// ==UserScript==
// @name         Medium Unlocked
// @namespace    https://github.com/ShrekBytes
// @version      1.6
// @description  Adds alternate reading links (ReadMedium and Freedium) to Medium paywalled articles.
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

    // Toggle to true for helpful console traces if you need to debug
    const DEBUG = false;
    const log = (...args) => { if (DEBUG) console.log('[MediumUnlocked]', ...args); };

    let buttonsAdded = false;
    let observer = null;
    let currentUrl = window.location.href;

    // Debounce helper
    function debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // Text patterns (regex) to detect paywall text in various forms
    const textPatterns = [
        /member-?only/i,
        /subscribe to read/i,
        /become a member/i,
        /sign in to continue/i,
        /sign in to read/i,
        /to continue reading/i,
        /join to continue/i,
        /unlock this story/i,
        /already used your free preview/i
    ];

    // Quick selectors that often indicate a paywall
    const selectors = [
        '[data-testid*="paywall"]',
        '[data-test-id*="paywall"]',
        '[data-testid*="meter"]',
        '[data-test-id*="meter"]',
        '[data-testid*="subscribe"]',
        '[data-test-id*="subscribe"]',
        'a[href*="subscribe"]',
        'button[aria-label*="subscribe"]',
        'div[class*="paywall"]',
        '.js-paywall',
        '.pw-cta',
        '.is-paywall'
    ];

    function elementMatchesAnySelector() {
        try {
            const sel = selectors.join(',');
            return !!document.querySelector(sel);
        } catch (e) {
            return false;
        }
    }

    function elementTextMatchesPatterns(el) {
        if (!el) return false;
        const text = (el.textContent || '').trim();
        if (!text) return false;
        for (const p of textPatterns) {
            if (p.test(text)) return true;
        }
        return false;
    }

    // Detect blocking overlays/dialogs with "subscribe" / "member" text and reasonable size/z-index
    function hasBlockingOverlay() {
        try {
            // candidate nodes: dialogs, aria-modal, or elements styled as fixed/absolute
            const overlayCandidates = Array.from(document.querySelectorAll(
                'dialog, [role="dialog"], [aria-modal="true"], [style*="position: fixed"], [style*="position:fixed"], [style*="position:absolute"], [style*="position: absolute"]'
            ));
            for (const el of overlayCandidates) {
                const rect = el.getBoundingClientRect();
                if (rect.width < 60 || rect.height < 20) continue; // tiny elements unlikely to be paywall overlay
                const cs = getComputedStyle(el);
                const z = parseInt(cs.zIndex, 10) || 0;
                const txt = (el.textContent || '').toLowerCase();
                if (z >= 5 && (txt.includes('subscribe') || txt.includes('member') || txt.includes('sign in') || txt.includes('continue'))) {
                    log('overlay candidate matched', el, z, txt.slice(0, 80));
                    return true;
                }
            }
        } catch (e) {
            // fail safe: ignore overlay check if something goes wrong
            log('overlay check error', e);
        }
        return false;
    }

    // The master detection function (quick selectors, article/main text, overlays)
    function isMemberOnlyArticle() {
        // 1) quick selectors (fast)
        if (elementMatchesAnySelector()) {
            log('matched quick selector');
            return true;
        }

        // 2) check article / main region text only (less expensive than full body)
        const mainEl = document.querySelector('article') || document.querySelector('main') || document.querySelector('[role="main"]');
        if (elementTextMatchesPatterns(mainEl)) {
            log('matched article/main text patterns');
            return true;
        }

        // 3) overlay/dialog detection
        if (hasBlockingOverlay()) {
            log('matched blocking overlay');
            return true;
        }

        // 4) conservative fallback: small scan on body for paywall patterns (only if nothing found above)
        // This is done as a last resort because it's heavier.
        try {
            if (elementTextMatchesPatterns(document.body)) {
                log('matched body text patterns (fallback)');
                return true;
            }
        } catch (e) {
            // ignore
        }

        return false;
    }

    // Create a visible, fixed-position button
    function createButton(text, url, topPx) {
        const a = document.createElement('a');
        a.textContent = text;
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'medium-reader-btn';
        // fixed positioning so it doesn't rely on absolute layout calculations
        a.style.cssText = [
            'position: fixed',
            `top: ${topPx}px`,
            'right: 16px',
            'z-index: 2147483647', // very high to be visible above overlays
            'background: rgba(255,255,255,0.94)',
            'backdrop-filter: blur(2px)',
            'color: #000',
            'border: 1px solid rgba(0,0,0,0.2)',
            'border-radius: 4px',
            'padding: 8px 10px',
            'font-size: 13px',
            'font-weight: 500',
            'text-decoration: none',
            'display: inline-flex',
            'align-items: center',
            'justify-content: center',
            'box-shadow: 0 2px 6px rgba(0,0,0,0.08)',
            'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        ].join(';');
        return a;
    }

    // Compute a sane top position for buttons (below any page header if present)
    function getButtonTop() {
        try {
            const header = document.querySelector('header, nav, [role="banner"]');
            if (header) {
                const r = header.getBoundingClientRect();
                // if header is visible at top, place buttons below it; otherwise default to 80
                if (r.bottom > 0 && r.bottom < window.innerHeight) {
                    return Math.min(Math.max(Math.round(r.bottom + 8), 48), 160);
                }
            }
        } catch (e) {
            // ignore
        }
        return 80;
    }

    // Add the two buttons to the page (if not already present)
    function addButtons() {
        if (buttonsAdded) return;
        // Clean up any stray buttons
        document.querySelectorAll('.medium-reader-btn').forEach(b => b.remove());

        const encoded = encodeURIComponent(window.location.href);
        const top = getButtonTop();
        const btn1 = createButton('ReadMedium', `https://readmedium.com/en/${encoded}`, top);
        const btn2 = createButton('Freedium', `https://freedium.cfd/${encoded}`, top + 48);

        document.body.appendChild(btn1);
        document.body.appendChild(btn2);

        buttonsAdded = true;
        log('buttons added');

        // stop observing once buttons are present (to save CPU)
        if (observer) {
            try { observer.disconnect(); } catch (e) { /* ignore */ }
            observer = null;
        }
    }

    // Debounced check - called by observer and initial timers
    const checkForPaywall = debounce(() => {
        try {
            if (!buttonsAdded && isMemberOnlyArticle()) {
                addButtons();
            }
        } catch (e) {
            log('checkForPaywall error', e);
        }
    }, 300);

    // SPA navigation helpers: dispatch a custom event when history changes
    (function () {
        const _push = history.pushState;
        history.pushState = function pushState() {
            const res = _push.apply(this, arguments);
            window.dispatchEvent(new Event('locationchange'));
            return res;
        };
        const _replace = history.replaceState;
        history.replaceState = function replaceState() {
            const res = _replace.apply(this, arguments);
            window.dispatchEvent(new Event('locationchange'));
            return res;
        };
        window.addEventListener('popstate', () => window.dispatchEvent(new Event('locationchange')));
    })();

    // Called on location change to reset state and re-check
    window.addEventListener('locationchange', () => {
        if (window.location.href === currentUrl) return;
        currentUrl = window.location.href;
        buttonsAdded = false;
        document.querySelectorAll('.medium-reader-btn').forEach(b => b.remove());
        log('locationchanged, rechecking paywall for', currentUrl);
        // small delay to give SPA a chance to render new article
        setTimeout(checkForPaywall, 250);
        setTimeout(checkForPaywall, 900);
    });

    // Init routine
    function init() {
        if (!document.body) {
            // wait for DOM
            document.addEventListener('DOMContentLoaded', init, { once: true });
            return;
        }

        // quick immediate checks (some pages render slowly)
        checkForPaywall();
        setTimeout(checkForPaywall, 500);
        setTimeout(checkForPaywall, 1500);
        setTimeout(checkForPaywall, 3500);

        // Observe the whole body (debounced callback) to detect dynamically inserted paywall nodes
        if (observer) {
            try { observer.disconnect(); } catch (e) { /* ignore */ }
        }
        observer = new MutationObserver(() => {
            checkForPaywall();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        log('observer attached to body');
    }

    // Start
    init();

})();
