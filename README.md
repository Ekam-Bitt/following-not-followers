# 🔍 Following Not Followers

> Find out who you follow on Instagram that doesn't follow you back — instantly, privately, and completely offline.

🚀 **Try it live: [following-not-followers.vercel.app](https://following-not-followers.vercel.app/)**

<img width="2880" height="1460" alt="screenshot" src="https://github.com/user-attachments/assets/2faadfc0-b1cd-4d06-bb7d-3c2af20c2cb0" />

## ✨ Features

- **📂 Drag & Drop** — Upload your Instagram data export JSON files with ease
- **🔒 100% Private** — Everything runs in your browser. No data is sent anywhere
- **🛡️ Resilient Parsing** — Auto-detects JSON structure, tolerant to Instagram export format changes
- **🔎 Search & Filter** — Instantly search through results by username
- **📊 Count Summary** — See at a glance how many accounts don't follow you back

## 🚀 How to Use

### Step 1: Download Your Instagram Data

1. Open Instagram → **Settings** → **Your Activity** → **Download Your Information**
2. Select **JSON** format
3. Request **Followers and Following** data
4. Download and unzip the export

### Step 2: Upload & Compare

1. Open the tool (hosted via [Website](https://following-not-followers.vercel.app/) or locally)
2. Upload your `followers_1.json` file
3. Upload your `following.json` file
4. Click **Compare**

### Step 3: Review Results

- Browse the list of accounts that don't follow you back
- Use the **search bar** to find specific usernames
- Click any result to open their Instagram profile

## 🛠️ Run Locally

```bash
git clone https://github.com/Ekam-Bitt/following-not-followers.git
cd following-not-followers
python3 -m http.server 8080
# Open http://localhost:8080
```

No dependencies. No build step. Just a single `index.html`.

## 🧠 Technical Highlights

| Feature | Detail |
|---|---|
| **Auto-detect JSON** | Recursively scans any JSON shape for `string_list_data` arrays — no hardcoded keys |
| **href-based extraction** | Extracts usernames from profile URLs rather than relying on unstable `value`/`title` fields |
| **URL format tolerance** | Handles both `/username` and `/_u/username` Instagram URL formats |
| **Error clarity** | Error messages include the filename that caused the issue |

## 📝 License

[MIT](LICENSE)

---

Made with ❤️ by [Ekam](https://www.instagram.com/notsookayekam)
