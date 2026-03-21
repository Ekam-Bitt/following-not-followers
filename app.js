const IG_GRADIENTS = [
  "linear-gradient(135deg, #833ab4, #fd1d1d)",
  "linear-gradient(135deg, #fd1d1d, #fcb045)",
  "linear-gradient(135deg, #fcb045, #833ab4)",
  "linear-gradient(135deg, #405de6, #833ab4)",
  "linear-gradient(135deg, #e1306c, #fd1d1d)",
  "linear-gradient(135deg, #833ab4, #c13584)",
  "linear-gradient(135deg, #405de6, #5851db)",
  "linear-gradient(135deg, #f77737, #fcb045)",
];

const SORT_LABELS = {
  "username-asc": "Username A to Z",
  "username-desc": "Username Z to A",
  "date-newest": "Follow date, newest first",
  "date-oldest": "Follow date, oldest first",
};

const state = {
  allResults: [],
  sort: "username-asc",
  errorTimer: null,
};

const elements = {
  compareForm: document.getElementById("compareForm"),
  compareBtn: document.getElementById("compareBtn"),
  countBanner: document.getElementById("countBanner"),
  errorBanner: document.getElementById("errorBanner"),
  followersFile: document.getElementById("followersFile"),
  followingFile: document.getElementById("followingFile"),
  footerYear: document.getElementById("footerYear"),
  resultList: document.getElementById("resultList"),
  results: document.getElementById("results"),
  searchBox: document.getElementById("searchBox"),
  searchInfo: document.getElementById("searchInfo"),
  sortBtn: document.getElementById("sortBtn"),
  sortLabel: document.getElementById("sortLabel"),
  sortMenu: document.getElementById("sortMenu"),
};

init();

function init() {
  elements.footerYear.textContent = String(new Date().getFullYear());

  setupDropZone({
    zoneId: "followersDropZone",
    input: elements.followersFile,
    statusId: "followersStatus",
  });

  setupDropZone({
    zoneId: "followingDropZone",
    input: elements.followingFile,
    statusId: "followingStatus",
  });

  setupSortMenu();

  elements.compareForm.addEventListener("submit", handleCompare);
  elements.searchBox.addEventListener("input", renderVisibleResults);

  document.addEventListener("click", (event) => {
    if (!elements.sortMenu.contains(event.target) && !elements.sortBtn.contains(event.target)) {
      closeSortMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSortMenu();
    }
  });
}

function setupDropZone({ zoneId, input, statusId }) {
  const zone = document.getElementById(zoneId);
  const status = document.getElementById(statusId);

  const updateLabel = (file) => {
    const hasFile = Boolean(file);
    zone.classList.toggle("has-file", hasFile);
    status.textContent = hasFile ? file.name : "No file selected";
  };

  const openPicker = () => input.click();

  zone.addEventListener("click", (event) => {
    if (event.target !== input) {
      openPicker();
    }
  });

  zone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  });

  input.addEventListener("change", () => {
    updateLabel(input.files[0]);
  });

  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("drag-over");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("drag-over");
  });

  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("drag-over");

    const [file] = event.dataTransfer.files;
    if (!isJsonFile(file)) {
      showError("Please drop a valid JSON file.");
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;
    updateLabel(file);
  });
}

function setupSortMenu() {
  elements.sortBtn.addEventListener("click", () => {
    const isOpen = elements.sortMenu.classList.toggle("show");
    elements.sortBtn.setAttribute("aria-expanded", String(isOpen));
  });

  elements.sortMenu.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", () => {
      updateSortSelection(item.dataset.sort);
      closeSortMenu();
      renderVisibleResults();
    });
  });
}

function updateSortSelection(sort) {
  state.sort = sort;
  elements.sortLabel.textContent = SORT_LABELS[sort] || "Sort";

  elements.sortMenu.querySelectorAll(".dropdown-item").forEach((item) => {
    const isSelected = item.dataset.sort === sort;
    item.classList.toggle("selected", isSelected);
    item.setAttribute("aria-pressed", String(isSelected));
    item.querySelector(".check").textContent = isSelected ? "\u2713" : "";
  });
}

function closeSortMenu() {
  elements.sortMenu.classList.remove("show");
  elements.sortBtn.setAttribute("aria-expanded", "false");
}

async function handleCompare(event) {
  event.preventDefault();

  const followersFile = elements.followersFile.files[0];
  const followingFile = elements.followingFile.files[0];

  if (!followersFile || !followingFile) {
    showError("Upload both Instagram JSON files before comparing.");
    return;
  }

  hideError();
  setBusyState(true);
  elements.results.hidden = true;

  try {
    const [followersData, followingData] = await Promise.all([
      readJsonFile(followersFile),
      readJsonFile(followingFile),
    ]);

    const followersItems = findItemsArray(followersData);
    const followingItems = findItemsArray(followingData);

    if (!followersItems) {
      throw new Error(`Could not find Instagram user data in "${followersFile.name}".`);
    }

    if (!followingItems) {
      throw new Error(`Could not find Instagram user data in "${followingFile.name}".`);
    }

    const followers = extractEntries(followersItems);
    const following = extractEntries(followingItems);

    state.allResults = Array.from(following.values()).filter((entry) => !followers.has(entry.username));
    updateCountBanner(state.allResults.length);
    elements.searchBox.value = "";
    renderVisibleResults();
    elements.results.hidden = false;
    elements.results.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showError(error.message || String(error));
  } finally {
    setBusyState(false);
  }
}

function setBusyState(isBusy) {
  elements.compareBtn.disabled = isBusy;
  elements.compareBtn.textContent = isBusy ? "Comparing..." : "Compare files";
}

function updateCountBanner(count) {
  if (count === 0) {
    elements.countBanner.textContent = "Everything matches. Everyone you follow also follows you back.";
    elements.countBanner.style.background = "linear-gradient(135deg, #059669, #10b981)";
    return;
  }

  elements.countBanner.textContent = `${count} account${count === 1 ? "" : "s"} do not follow you back`;
  elements.countBanner.style.background = "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)";
}

function renderVisibleResults() {
  const query = normalizeQuery(elements.searchBox.value);
  const filtered = query
    ? state.allResults.filter((entry) => entry.username.includes(query))
    : state.allResults;

  const visibleResults = sortEntries(filtered, state.sort);
  updateSearchInfo(visibleResults.length, state.allResults.length, query);
  renderCards(visibleResults, query);
}

function updateSearchInfo(visibleCount, totalCount, query) {
  if (!totalCount) {
    elements.searchInfo.textContent = "";
    return;
  }

  if (!query) {
    elements.searchInfo.textContent = `${totalCount} result${totalCount === 1 ? "" : "s"} ready`;
    return;
  }

  elements.searchInfo.textContent = `Showing ${visibleCount} of ${totalCount} result${totalCount === 1 ? "" : "s"} for "${query}"`;
}

function renderCards(entries, query) {
  const fragment = document.createDocumentFragment();

  if (!entries.length) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.textContent = query
      ? `No usernames match "${query}".`
      : "No accounts were found in the comparison.";
    fragment.append(emptyState);
    elements.resultList.replaceChildren(fragment);
    return;
  }

  entries.forEach((entry) => {
    fragment.append(createProfileCard(entry));
  });

  elements.resultList.replaceChildren(fragment);
}

function createProfileCard({ username, timestamp }) {
  const card = document.createElement("li");
  card.className = "profile-card";

  const cardTop = document.createElement("div");
  cardTop.className = "card-top";

  const avatarRing = document.createElement("div");
  avatarRing.className = "avatar-ring";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.style.background = getGradient(username);
  avatar.textContent = username.charAt(0).toUpperCase();

  const info = document.createElement("div");
  info.className = "user-info";
  const usernameText = document.createElement("span");
  usernameText.className = "username";
  usernameText.textContent = `@${username}`;

  avatarRing.append(avatar);
  info.append(usernameText);
  cardTop.append(avatarRing, info);
  card.append(cardTop);

  if (timestamp) {
    const followDate = document.createElement("p");
    followDate.className = "follow-date";
    followDate.textContent = `Following since ${formatDate(timestamp)}`;
    card.append(followDate);
  }

  const link = document.createElement("a");
  link.className = "visit-btn";
  link.href = `https://www.instagram.com/${username}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View profile";

  const arrow = document.createElement("span");
  arrow.className = "arrow";
  arrow.textContent = "\u2192";
  link.append(" ", arrow);

  card.append(link);
  return card;
}

function sortEntries(entries, sort) {
  return [...entries].sort((left, right) => {
    switch (sort) {
      case "username-desc":
        return right.username.localeCompare(left.username);
      case "date-newest":
        return (right.timestamp || 0) - (left.timestamp || 0);
      case "date-oldest":
        return (left.timestamp || 0) - (right.timestamp || 0);
      case "username-asc":
      default:
        return left.username.localeCompare(right.username);
    }
  });
}

function extractEntries(items) {
  const entries = new Map();

  items.forEach((item) => {
    if (!Array.isArray(item.string_list_data)) {
      return;
    }

    item.string_list_data.forEach((entry) => {
      const username = extractUsername(entry, item);
      if (!username) {
        return;
      }

      if (!entries.has(username)) {
        entries.set(username, {
          username,
          timestamp: typeof entry.timestamp === "number" ? entry.timestamp : null,
        });
      }
    });
  });

  return entries;
}

function extractUsername(entry, item) {
  if (entry?.href) {
    const hrefUsername = extractUsernameFromHref(entry.href);
    if (hrefUsername) {
      return hrefUsername;
    }
  }

  return normalizeUsername(entry?.value || item?.title || "");
}

function extractUsernameFromHref(href) {
  try {
    const url = new URL(href);
    const segments = url.pathname.split("/").filter(Boolean);
    return normalizeUsername(segments[segments.length - 1] || "");
  } catch {
    return "";
  }
}

function normalizeUsername(value) {
  return String(value).trim().replace(/^@/, "").replace(/\/+$/, "").toLowerCase();
}

function normalizeQuery(value) {
  return value.trim().toLowerCase();
}

function findItemsArray(data) {
  if (Array.isArray(data)) {
    if (data.some((item) => Array.isArray(item?.string_list_data))) {
      return data;
    }

    for (const item of data) {
      const nested = findItemsArray(item);
      if (nested) {
        return nested;
      }
    }

    return null;
  }

  if (data && typeof data === "object") {
    for (const value of Object.values(data)) {
      const nested = findItemsArray(value);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      try {
        resolve(JSON.parse(target.result));
      } catch {
        reject(new Error(`"${file.name}" is not valid JSON.`));
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read "${file.name}".`));
    reader.readAsText(file);
  });
}

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getGradient(username) {
  let hash = 0;

  for (let index = 0; index < username.length; index += 1) {
    hash = username.charCodeAt(index) + ((hash << 5) - hash);
  }

  return IG_GRADIENTS[Math.abs(hash) % IG_GRADIENTS.length];
}

function isJsonFile(file) {
  if (!file) {
    return false;
  }

  return file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
}

function showError(message) {
  window.clearTimeout(state.errorTimer);
  elements.errorBanner.textContent = message;
  elements.errorBanner.hidden = false;
  state.errorTimer = window.setTimeout(hideError, 6000);
}

function hideError() {
  elements.errorBanner.hidden = true;
}
