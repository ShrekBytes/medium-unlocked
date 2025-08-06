# 📰 Medium Unlocked

**Medium Unlocked** is a lightweight userscript that enhances your reading experience on [Medium](https://medium.com) by adding one-click access to alternate, paywall-free versions of articles using **ReadMedium** and **Freedium**.

> 📖 Read paywalled Medium articles easily — no account, no subscriptions, no BS.

## 🔧 Features

- 🔗 Adds buttons to view the current article on:
  - [ReadMedium](https://readmedium.com)
  - [Freedium](https://freedium.cfd)
- 🧠 Detects paywalled ("Member-only") articles automatically.
- ⚡ Works seamlessly with Medium's single-page app (SPA) navigation.
- 🎯 Simple UI with non-intrusive placement.
- 🛠️ No external dependencies. Pure vanilla JavaScript.

## 📸 Preview

![Medium Unlocked Screenshot](https://raw.githubusercontent.com/ShrekBytes/medium-unlocked/refs/heads/main/freedom.png)

## 🚀 Installation

To use this userscript, you'll need a userscript manager extension like [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).

### 1. Install a Userscript Manager
- **Chrome / Edge**: [Tampermonkey](https://chrome.google.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)

### 2. Install the Script
👉 [Click here to install Medium Unlocked](https://github.com/ShrekBytes/medium-unlocked/raw/main/medium-unlocked.user.js)

Alternatively, copy and paste the code manually from [`medium-unlocked.user.js`](https://github.com/ShrekBytes/medium-unlocked/blob/main/medium-unlocked.user.js) into your userscript manager.

## 💡 How It Works

When you visit a Medium article, the script checks if it's behind a paywall. If so, it injects two buttons in the top-right corner of the page:
- **ReadMedium**: `https://readmedium.com/en/<article-url>`
- **Freedium**: `https://freedium.cfd/<article-url>`

These services attempt to provide readable versions of the content without requiring a Medium subscription.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🧑‍💻 Author

Made with ☕️ by [ShrekBytes](https://github.com/ShrekBytes)

## 🛠 Support & Feedback

Found a bug or have a feature request? [Open an issue](https://github.com/ShrekBytes/medium-unlocked/issues)

---

> ⚠️ **Disclaimer**: This script is intended for educational purposes. Bypass of paywalls may violate the terms of service of some websites. Use responsibly.
