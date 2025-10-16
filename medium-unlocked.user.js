// ==UserScript==
// @name         Medium Unlocked
// @namespace    https://github.com/ShrekBytes
// @description  Adds alternate reading links (RemovePaywalls, Freedium, Archive.today & ReadMedium) to Medium paywalled articles with improved reliability.
// @version      3.2.0
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
// @match        https://plainenglish.io/*
// @match        https://*.plainenglish.io/*
// @match        https://blog.devgenius.io/*
// @match        https://*.blog.devgenius.io/*
// @match        https://aws.plainenglish.io/*
// @match        https://*.aws.plainenglish.io/*
// @match        https://python.plainenglish.io/*
// @match        https://*.python.plainenglish.io/*
// @match        https://entrepreneurship.com/*
// @match        https://*.entrepreneurship.com/*
// @match        https://medium.com/@*
// @match        https://link.medium.com/*
// @match        https://stories.medium.com/*
// @icon         https://raw.githubusercontent.com/ShrekBytes/medium-unlocked/refs/heads/main/freedom.png
// @grant        none
// @noframes
// @run-at       document-start
// @homepageURL  https://github.com/ShrekBytes/medium-unlocked
// @supportURL   https://github.com/ShrekBytes/medium-unlocked/issues
// @downloadURL  https://github.com/ShrekBytes/medium-unlocked/raw/main/medium-unlocked.user.js
// @updateURL    https://github.com/ShrekBytes/medium-unlocked/raw/main/medium-unlocked.user.js
// ==/UserScript==

(function() {
    'use strict';

    // State management
    const state = {
        buttonsAdded: false,
        currentUrl: window.location.href,
        isChecking: false,
        lastCheck: 0,
        observer: null,
        checkTimeout: null,
        abortController: new AbortController()
    };

    // Performance optimized selectors - ordered by likelihood and specificity
    const PAYWALL_SELECTORS = Object.freeze([
        // Primary paywall indicators (most common)
        '[data-testid="paywall"]',
        '[data-testid="meter-stats"]',
        '[data-testid="subscribe-paywall"]',
        '.paywall',

        // Secondary indicators
        '[data-testid="paywall-upsell"]',
        '[data-testid="meter-card"]',
        '.js-paywall',
        '.meteredContent',
        '.u-showForMembers',
        '.memberPreview',
        '.js-memberPreview',

        // Content limitation indicators
        '.js-truncatedPostBody',
        '[data-source="paywall"]',
        '[data-post-id][data-source="meter"]',
        '.u-lineHeightTighter.u-fontSize18:last-child',

        // Subscribe/upgrade prompts
        '[data-testid="subscribe-button"]',
        '[data-testid="upgrade-button"]',
        '.js-upgradeButton',
        '.js-subscribeButton'
    ]);

    // Optimized text patterns - case insensitive, ordered by frequency
    const PAYWALL_PATTERNS = Object.freeze([
        'member-only story',
        'subscribe to read',
        'become a member',
        'sign up to read',
        'continue reading with',
        'read the full story',
        'unlock unlimited',
        'upgrade to continue',
        'this story is published in',
        'get unlimited access'
    ]);

    // Efficient paywall detection with early returns
    function isPaywalled() {
        // Quick DOM-based detection first (fastest)
        for (const selector of PAYWALL_SELECTORS) {
            if (document.querySelector(selector)) {
                return true;
            }
        }

        // Text-based detection (slower, but thorough)
        const bodyText = document.body?.textContent?.toLowerCase();
        if (!bodyText) return false;

        return PAYWALL_PATTERNS.some(pattern => bodyText.includes(pattern));
    }

    // Optimized button creation with minimal DOM operations
    function createButton(text, url, top) {
        const button = document.createElement('a');

        // Set properties in batch for better performance
        Object.assign(button, {
            innerHTML: text,
            href: url,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'medium-unlock-btn'
        });

        // Add ARIA label for accessibility
        button.setAttribute('aria-label', `Read this article on ${text}`);
        button.setAttribute('role', 'link');

        // Optimized styles as single string with fixed font syntax
        button.style.cssText = `
            position:fixed !important;top:${top}px !important;right:64px !important;z-index:9999 !important;
            background:rgba(64, 64, 128,.33) !important;backdrop-filter:blur(2px) !important;
            color:#000 !important;border:1px solid #000 !important;border-radius:2px !important;
            font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif !important;
            font-size:14px !important;font-weight:400 !important;line-height:1.4 !important;
            cursor:pointer !important;width:128px !important;height:36px !important;
            display:flex !important;align-items:center !important;justify-content:center !important;
            text-decoration:none !important;box-sizing:border-box !important;
        `;

        return button;
    }

    // Efficient button management
    function addButtons() {
        if (state.buttonsAdded || !document.body) return;

        // Double-check to prevent race conditions
        const existingButtons = document.querySelectorAll('.medium-unlock-btn');
        if (existingButtons.length > 0) {
            state.buttonsAdded = true;
            return;
        }

        const url = encodeURIComponent(window.location.href);
        const rawUrl = window.location.href;
        const fragment = document.createDocumentFragment();

        // Create buttons in memory first (ordered by preference)
        fragment.appendChild(createButton('RemovePaywalls', `https://removepaywalls.com/${rawUrl}`, 400));
        fragment.appendChild(createButton('Freedium', `https://freedium-mirror.cfd/${url}`, 440));
        fragment.appendChild(createButton('Archive.today', `https://archive.today/latest/${rawUrl}`, 480));
        fragment.appendChild(createButton('ReadMedium', `https://readmedium.com/en/${url}`, 520));

        // Single DOM append operation
        document.body.appendChild(fragment);
        state.buttonsAdded = true;
    }

    function removeButtons() {
        if (!state.buttonsAdded) return;

        // Use more specific selector to avoid conflicts
        const buttons = document.querySelectorAll('.medium-unlock-btn');
        if (buttons.length > 0) {
            buttons.forEach(btn => btn.remove());
            state.buttonsAdded = false;
        }
    }

    // Throttled paywall check to prevent excessive calls
    function checkPaywall() {
        const now = Date.now();

        // Prevent rapid successive checks
        if (state.isChecking || (now - state.lastCheck) < 100) {
            return;
        }

        state.isChecking = true;
        state.lastCheck = now;

        try {
            const isPaywalledNow = isPaywalled();

            if (isPaywalledNow && !state.buttonsAdded) {
                addButtons();
            } else if (!isPaywalledNow && state.buttonsAdded) {
                removeButtons();
            }
        } catch (error) {
            // Silent error handling - don't break the page
        } finally {
            state.isChecking = false;
        }
    }

    // Debounced check for performance
    function scheduleCheck(delay = 150) {
        if (state.checkTimeout) {
            clearTimeout(state.checkTimeout);
        }

        state.checkTimeout = setTimeout(() => {
            checkPaywall();
            state.checkTimeout = null;
        }, delay);
    }

    // Optimized mutation observer with smart filtering
    function createObserver() {
        return new MutationObserver((mutations) => {
            let shouldCheck = false;

            // Efficient mutation analysis
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check only Element nodes for relevant changes
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node;

                            // Check if added node or its children contain paywall indicators
                            if (element.matches?.(PAYWALL_SELECTORS.join(',')) ||
                                element.querySelector?.(PAYWALL_SELECTORS.join(','))) {
                                shouldCheck = true;
                                break;
                            }
                        }
                    }

                    if (shouldCheck) break;
                }
            }

            if (shouldCheck) {
                scheduleCheck();
            }
        });
    }

    // Handle URL changes efficiently
    function handleUrlChange() {
        const newUrl = window.location.href;

        if (newUrl !== state.currentUrl) {
            state.currentUrl = newUrl;
            removeButtons();
            scheduleCheck(300); // Slight delay for page transition
        }
    }

    // Optimized history API interception
    function interceptHistory() {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function(...args) {
            const result = originalPushState.apply(this, args);
            setTimeout(handleUrlChange, 0);
            return result;
        };

        history.replaceState = function(...args) {
            const result = originalReplaceState.apply(this, args);
            setTimeout(handleUrlChange, 0);
            return result;
        };
    }

    // Initialize with optimal timing
    function initialize() {
        // Immediate check if DOM is ready
        if (document.readyState !== 'loading') {
            scheduleCheck(0);
        }

        // Setup observers and listeners
        if (!state.observer) {
            state.observer = createObserver();

            // Wait for body to be available
            const startObserving = () => {
                if (document.body) {
                    state.observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['data-testid', 'class', 'data-source']
                    });
                } else {
                    setTimeout(startObserving, 50);
                }
            };

            startObserving();
        }

        // Event listeners with passive option for performance and AbortController
        window.addEventListener('popstate', handleUrlChange, { 
            passive: true, 
            signal: state.abortController.signal 
        });

        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                scheduleCheck(50);
            }
        }, { 
            passive: true, 
            signal: state.abortController.signal 
        });

        // DOM ready fallback
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => scheduleCheck(0), { 
                once: true,
                signal: state.abortController.signal 
            });
        }
    }

    // Cleanup function
    function cleanup() {
        if (state.observer) {
            state.observer.disconnect();
            state.observer = null;
        }

        if (state.checkTimeout) {
            clearTimeout(state.checkTimeout);
            state.checkTimeout = null;
        }

        if (state.abortController) {
            state.abortController.abort();
        }

        removeButtons();
        state.isChecking = false;
    }

    // Handle page unload
    window.addEventListener('beforeunload', cleanup, { 
        passive: true,
        signal: state.abortController.signal 
    });

    // Start everything
    interceptHistory();
    initialize();

})();
