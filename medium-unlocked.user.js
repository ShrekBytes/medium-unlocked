// ==UserScript==
// @name         Medium Unlocked
// @namespace    https://github.com/ShrekBytes
// @version      1.0.0
// @description  Adds alternate reading links (ReadMedium and Freedium) to Medium paywalled articles.
// @author       ShrekBytes
// @license      MIT
// @match        https://medium.com/*
// @match        https://*.medium.com/*
// @icon         https://raw.githubusercontent.com/ShrekBytes/medium-unlocked/refs/heads/main/freedom.png
// @grant        none
// @noframes
// @homepageURL  https://github.com/ShrekBytes/medium-unlocked
// @supportURL   https://github.com/ShrekBytes/medium-unlocked/issues
// @downloadURL  https://github.com/ShrekBytes/medium-unlocked/raw/main/medium-unlocked.user.js
// @updateURL    https://github.com/ShrekBytes/medium-unlocked/raw/main/medium-unlocked.user.js
// ==/UserScript==

(function () {
    'use strict';

    let buttonsAdded = false;
    let checkTimeout;

    // Utility: Debounce function
    function debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // Check if the article is member-only (paywalled)
    function isMemberOnlyArticle() {
        const quickSelectors = [
            '[data-testid="paywall"]',
            '[data-testid="meter-stats"]',
            '[data-testid="subscribe-paywall"]'
        ];

        for (let selector of quickSelectors) {
            if (document.querySelector(selector)) {
                return true;
            }
        }

        const bodyText = document.body.textContent;
        return bodyText.includes('Member-only story') ||
            bodyText.includes('Subscribe to read') ||
            bodyText.includes('Become a member');
    }

    // Create styled link button
    function createButton(text, url, topPosition) {
        const button = document.createElement('a');
        button.innerHTML = text;
        button.href = url;
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.className = 'medium-reader-btn';
        button.style.cssText = `
            position: absolute;
            top: ${topPosition}px;
            right: 64px;
            z-index: 9999;
            background: rgba(255, 255, 255, 0.44);
            backdrop-filter: blur(2px);
            color: black;
            border: 1px solid black;
            border-radius: 2px;
            font-size: 14px;
            font-weight: 400;
            cursor: pointer;
            width: 100px;
            height: 36px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;
        return button;
    }

    // Add external links if not already present
    function addButtons() {
        if (buttonsAdded) return;

        // Remove any existing buttons (in case of navigation)
        document.querySelectorAll('.medium-reader-btn').forEach(btn => btn.remove());

        const currentUrl = window.location.href;
        const encodedUrl = encodeURIComponent(currentUrl);

        const readMediumBtn = createButton('ReadMedium', `https://readmedium.com/en/${encodedUrl}`, 400);
        const freediumBtn = createButton('Freedium', `https://freedium.cfd/${encodedUrl}`, 440);

        document.body.appendChild(readMediumBtn);
        document.body.appendChild(freediumBtn);

        buttonsAdded = true;
    }

    // Debounced paywall check
    const checkForPaywall = debounce(() => {
        if (isMemberOnlyArticle() && !buttonsAdded) {
            addButtons();
        }
    }, 500);

    // Initialize on page load
    function init() {
        buttonsAdded = false;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkForPaywall);
        } else {
            checkForPaywall();
        }
    }

    // Track URL changes for SPA behavior
    let currentUrl = window.location.href;
    const observer = new MutationObserver(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            buttonsAdded = false;
            checkForPaywall();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true // ← More reliable in SPA
    });

    // Also respond to back/forward navigation
    window.addEventListener('popstate', () => {
        buttonsAdded = false;
        checkForPaywall();
    });

    // Kick off
    init();

})();

