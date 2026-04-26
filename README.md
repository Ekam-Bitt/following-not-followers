# Following Not Followers

Find the Instagram accounts you follow that do not follow you back by comparing your exported Instagram JSON files locally in the browser.

Live site: [following-not-followers.vercel.app](https://following-not-followers.vercel.app/)

<img width="2880" alt="Following Not Followers screenshot" src="https://github.com/user-attachments/assets/9c81c2fd-b38c-4c8c-b57a-3b3f4cce4bbf" />

## Features

- Private browser-only comparison with no server upload
- Drag-and-drop support for Instagram export files
- Search and sort controls for large result sets
- Automatic JSON shape detection for Instagram export variations
- Zero dependencies and no build step

## How It Works

1. Download your Instagram information in JSON format.
2. Find the followers and following files in the exported archive.
3. Upload both files into the tool.
4. Review the accounts that appear in following but not in followers.

## Local Development

```bash
git clone https://github.com/Ekam-Bitt/following-not-followers.git
cd following-not-followers
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

## Project Structure

- `index.html`: page structure and metadata
- `style.css`: styles and responsive layout
- `app.js`: client-side comparison logic and UI behavior

## Technical Notes

- Usernames are extracted from profile URLs when available, with a fallback to export values.
- Duplicate usernames are removed during parsing to avoid extra rendering work.
- Results are rendered with `DocumentFragment` to keep updates efficient.
- SEO support includes canonical metadata, social metadata, structured data, `robots.txt`, and `sitemap.xml`.

## License

[MIT](LICENSE)
