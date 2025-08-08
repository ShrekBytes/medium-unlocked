# Medium Unlocked

> A userscript that adds alternate reading links (ReadMedium & Freedium) for paywalled Medium articles.

![Screenshot of Medium Unlocked](screenshots/pc.jpg)

[![Install Medium Unlocked](https://img.shields.io/badge/Install%20Userscript-Medium%20Unlocked-blue?style=for-the-badge&logo=userscript)](https://raw.githubusercontent.com/ShrekBytes/medium-unlocked/main/medium-unlocked.user.js)
[![View on GreasyFork](https://img.shields.io/badge/View%20on-GreasyFork-4E9A06?style=for-the-badge&logo=greasyfork)](https://greasyfork.org/en/scripts/544839-medium-unlocked)

## Table of Contents

* [Overview](#overview)
* [Supported Domains](#supported-domains)
* [Usage](#usage)
* [Features](#features)
* [Notes](#notes)
* [Contributing](#contributing)


## Overview

**Medium Unlocked** is a lightweight userscript that detects paywalled ("member-only") articles on Medium and provides alternate reading links using external services — [ReadMedium](https://readmedium.com) and [Freedium](https://freedium.cfd).


## Supported Domains
> This script supports all Medium domains, subdomains, and some custom domains. While it’s technically possible to match every site with `*://*/*`, doing so would run the script on all websites, which is inefficient and unnecessary. If you want a Medium-powered custom domain added, [open an issue](../../issues) and I’ll work on adding it.

### ReadMedium

- Medium domains (`medium.com`)
- Medium subdomains (`*.medium.com`)

### Freedium

- Medium domains (`medium.com`)
- Medium subdomains (`*.medium.com`)
- InfoSec Write-ups (`infosecwriteups.com`)
- Better Programming (`betterprogramming.pub`)


## Usage

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. [Click here to install the script](https://raw.githubusercontent.com/ShrekBytes/medium-unlocked/main/medium-unlocked.user.js)
3. Done! Visit Medium and enjoy unrestricted reading


## Features

* Detects Medium paywalls automatically
* Adds ReadMedium & Freedium buttons
* Works on both mobile and desktop
* Simple, fast, and privacy-respecting
* Supports Medium's dynamic page loads (SPA)

<p align="center">
  <img src="screenshots/mobile.jpg" width="33%"/>
  <img src="screenshots/pc.jpg" width="88%"/>
</p>


## Notes

* This script **does not bypass** paywalls directly
* It only links to third-party services
* Use at your own discretion


## Contributing

Found a bug or have a feature request?
[Open an issue](https://github.com/ShrekBytes/medium-unlocked/issues) or submit a pull request.
