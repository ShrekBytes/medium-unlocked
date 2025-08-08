// ==UserScript==
// @name         Medium Unlocked Enhanced
// @namespace    https://github.com/ShrekBytes
// @version      2.0
// @description  Adds alternate reading links (ReadMedium and Freedium) to Medium paywalled articles with improved reliability.
// @author       ShrekBytes
// @license      MIT
// @match        https://medium.com/*
// @match        https://*.medium.com/*
// @match        https://infosecwriteups.com/*
// @match        https://*.infosecwriteups.com/*
// @match        https://betterprogramming.pub/*
// @match        https://*.betterprogramming.pub/*
// @match        https://betterhumans.pub/*
// @match        https://*.betterhumans.pub/*
// @match        https://uxplanet.org/*
// @match        https://*.uxplanet.org/*
// @match        https://writingcooperative.com/*
// @match        https://*.writingcooperative.com/*
// @match        https://entrepreneurshandbook.co/*
// @match        https://*.entrepreneurshandbook.co/*
// @match        https://medium.muz.li/*
// @match        https://*.medium.muz.li/*
// @match        https://blog.prototypr.io/*
// @match        https://*.blog.prototypr.io/*
// @match        https://bettermarketing.pub/*
// @match        https://*.bettermarketing.pub/*
// @match        https://byrslf.co/*
// @match        https://*.byrslf.co/*
// @match        https://levelup.gitconnected.com/*
// @match        https://*.levelup.gitconnected.com/*
// @match        https://javascript.plainenglish.io/*
// @match        https://*.javascript.plainenglish.io/*
// @match        https://thebelladonnacomedy.com/*
// @match        https://*.thebelladonnacomedy.com/*
// @match        https://medium.datadriveninvestor.com/*
// @match        https://*.medium.datadriveninvestor.com/*
// @match        https://itnext.io/*
// @match        https://*.itnext.io/*
// @match        https://proandroiddev.com/*
// @match        https://*.proandroiddev.com/*
// @match        https://code.likeagirl.io/*
// @match        https://*.code.likeagirl.io/*
// @match        https://blog.bitsrc.io/*
// @match        https://*.blog.bitsrc.io/*
// @match        https://uxdesign.cc/*
// @match        https://*.uxdesign.cc/*
// @match        https://thebolditalic.com/*
// @match        https://*.thebolditalic.com/*
// @match        https://towardsdatascience.com/*
// @match        https://*.towardsdatascience.com/*
// @match        https://medium.freecodecamp.org/*
// @match        https://*.medium.freecodecamp.org/*
// @match        https://hackernoon.com/*
// @match        https://*.hackernoon.com/*
// @match        https://codeburst.io/*
// @match        https://*.codeburst.io/*
// @match        https://blog.usejournal.com/*
// @match        https://*.blog.usejournal.com/*
// @match        https://chatbotslife.com/*
// @match        https://*.chatbotslife.com/*
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
    let currentUrl = window.location.href;
    let retryCount = 0;
    const maxRetries = 5;

    // Utility: Debounce function with longer delay for better reliability
    function debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // Enhanced paywall detection with more selectors and patterns
    function isMemberOnlyArticle() {
        // Quick selectors for common paywall elements
        const paywallSelectors = [
            '[data-testid="paywall"]',
            '[data-testid="meter-stats"]',
            '[data-testid="subscribe-paywall"]',
            '[data-testid="paywall-upsell"]',
            '.paywall',
            '.js-paywall',
            '.meteredContent',
            '.u-showForMembers',
            '[data-post-id][data-source="paywall"]',
            '.memberPreview',
            '.js-memberPreview'
        ];

        // Check for paywall elements
        for (let selector of paywallSelectors) {
            if (document.querySelector(selector)) {
                return true;
            }
        }

        // Text-based detection (more comprehensive)
        const bodyText = document.body.textContent.toLowerCase();
        const paywallPatterns = [
            'member-only story',
            'subscribe to read',
            'become a member',
            'read the full story',
            'this story is published in',
            'sign up to read',
            'continue reading with a membership',
            'unlock unlimited articles',
            'this post is for paying subscribers only',
            'get unlimited access',
            'upgrade to continue reading'
        ];

        const foundPattern = paywallPatterns.some(pattern => bodyText.includes(pattern));
        if (foundPattern) {
            return true;
        }

        // Check for clipping/truncated content indicators
        const clippingIndicators = [
            '.js-truncatedPostBody',
            '.u-lineHeightTighter.u-fontSize18',
            '[data-selectable-paragraph]:last-child[data-truncated="true"]'
        ];

        for (let selector of clippingIndicators) {
            if (document.querySelector(selector)) {
                return true;
            }
        }

        return false;
    }

    // Create minimal styled button (original design)
    function createButton(text, url, topPosition) {
        const button = document.createElement('a');
        button.innerHTML = text;
        button.href = url;
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.className = 'medium-reader-btn';
        button.style.cssText = `
            position: fixed;
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

    // Add buttons quickly
    function addButtons() {
        if (buttonsAdded) return;

        // Remove any existing buttons
        removeButtons();

        const currentUrl = window.location.href;
        const encodedUrl = encodeURIComponent(currentUrl);

        try {
            const readMediumBtn = createButton('ReadMedium', `https://readmedium.com/en/${encodedUrl}`, 400);
            const freediumBtn = createButton('Freedium', `https://freedium.cfd/${encodedUrl}`, 440);

            document.body.appendChild(readMediumBtn);
            document.body.appendChild(freediumBtn);

            buttonsAdded = true;

        } catch (error) {
            console.error('Medium Unlocked: Error adding buttons:', error);
        }
    }

    // Remove existing buttons
    function removeButtons() {
        document.querySelectorAll('.medium-reader-btn').forEach(btn => btn.remove());
        buttonsAdded = false;
    }

    // Faster paywall check with minimal delay
    const checkForPaywall = debounce(() => {
        if (isMemberOnlyArticle() && !buttonsAdded) {
            addButtons();
        } else if (!isMemberOnlyArticle() && buttonsAdded) {
            removeButtons();
        }
    }, 200); // Much faster debounce

    // Initialize with immediate check
    function init() {
        buttonsAdded = false;

        // Immediate check
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkForPaywall);
        } else {
            checkForPaywall();
        }

        // One additional check for slow content
        setTimeout(checkForPaywall, 1000);
    }

    // Enhanced URL change detection
    function handleUrlChange() {
        const newUrl = window.location.href;
        if (newUrl !== currentUrl) {
            currentUrl = newUrl;
            removeButtons();
            setTimeout(checkForPaywall, 300); // Quick response to URL changes
        }
    }

    // Comprehensive mutation observer
    const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;

        mutations.forEach(mutation => {
            // Check for URL changes
            if (window.location.href !== currentUrl) {
                handleUrlChange();
                shouldCheck = true;
                return;
            }

            // Check for content changes that might indicate paywall loading
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node;
                        if (element.matches && (
                            element.matches('[data-testid*="paywall"]') ||
                            element.matches('[data-testid*="meter"]') ||
                            element.matches('.paywall') ||
                            element.textContent.toLowerCase().includes('member-only')
                        )) {
                            shouldCheck = true;
                            break;
                        }
                    }
                }
            }
        });

        if (shouldCheck) {
            checkForPaywall();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-testid', 'class']
    });

    // Handle navigation events
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('pushstate', handleUrlChange);
    window.addEventListener('replacestate', handleUrlChange);

    // Intercept history methods for SPA navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
        originalPushState.apply(history, args);
        setTimeout(handleUrlChange, 50);
    };

    history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        setTimeout(handleUrlChange, 50);
    };

    // Handle page visibility changes for quick response
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(checkForPaywall, 100);
        }
    });

    // Start the script
    init();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        observer.disconnect();
        removeButtons();
    });

})();
