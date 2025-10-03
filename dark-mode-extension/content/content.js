// Dark Mode Extension Content Script
(function () {
  "use strict";

  const DARK_MODE_ID = "darkly-custom-dark-mode";
  let isEnabled = false;
  let observer = null;

  // Check if site already has dark theme
  function hasNativeDarkTheme() {
    const bodyStyle = window.getComputedStyle(document.body);
    const bgColor = bodyStyle.backgroundColor;

    // Check if background is already dark
    if (
      bgColor &&
      bgColor !== "rgba(0, 0, 0, 0)" &&
      bgColor !== "transparent"
    ) {
      const rgb = bgColor.match(/\d+/g);
      if (rgb) {
        const [r, g, b] = rgb.map(Number);
        // If background is dark, consider it has native dark theme
        return r < 50 && g < 50 && b < 50;
      }
    }

    return false;
  }

  // Create comprehensive dark mode styles
  function createDarkModeStyles() {
    return `
      /* Global page background */
      html, body {
        background-color: rgb(29, 28, 25) !important;
        color: white !important;
      }
      
      /* All text elements default to white */
      *, *::before, *::after {
        color: white !important;
      }
      
      /* All background elements get the main dark background */
      *:not(img):not(video):not(iframe):not(embed):not(object):not(svg):not(canvas):not(picture) {
        background-color: rgb(29, 28, 25) !important;
      }
      
      /* Headers, footers, nav, and card-like elements */
      header, footer, nav, aside, article, section, main,
      .header, .footer, .nav, .navbar, .navigation, .sidebar, .menu,
      .card, .panel, .box, .widget, .module, .block,
      .container:not(.main-container), .wrapper:not(.main-wrapper),
      [class*="card"], [class*="panel"], [class*="box"], [class*="widget"],
      [class*="header"], [class*="footer"], [class*="nav"],
      [role="navigation"], [role="banner"], [role="contentinfo"] {
        background-color: rgb(51, 49, 44) !important;
        border: 1px solid white !important;
        color: white !important;
      }
      
      /* Divs that look like cards or sections */
      div[class*="content"], div[class*="section"], div[class*="area"],
      div[class*="region"], div[class*="zone"], div[class*="block"] {
        background-color: rgb(51, 49, 44) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
      }
      
      /* Form elements */
      input, textarea, select {
        background-color: rgb(51, 49, 44) !important;
        color: white !important;
        border: 1px solid #666 !important;
      }
      
      /* Buttons */
      button, [role="button"], .btn, .button, input[type="button"], 
      input[type="submit"], input[type="reset"] {
        background-color: rgb(51, 49, 44) !important;
        color: white !important;
        border: 1px solid white !important;
      }
      
      /* Links - keep some color for visibility */
      a, a:link {
        color: #66b3ff !important;
      }
      
      a:visited {
        color: #cc99ff !important;
      }
      
      a:hover {
        color: #99ccff !important;
      }
      
      /* Tables */
      table, thead, tbody, tfoot, tr, td, th {
        background-color: rgb(51, 49, 44) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
        color: white !important;
      }
      
      /* Lists */
      ul, ol, li {
        color: white !important;
      }
      
      /* Code elements */
      pre, code, .code, .highlight, .codehilite {
        background-color: rgb(35, 34, 31) !important;
        color: #f8f8f2 !important;
        border: 1px solid #555 !important;
      }
      
      /* Preserve images and media */
      img, video, iframe, embed, object, canvas, svg, picture {
        filter: none !important;
        background-color: transparent !important;
        opacity: 1 !important;
      }
      
      /* Special handling for elements with colored backgrounds */
      [style*="background-color"], [style*="background:"] {
        background-color: rgb(44, 66, 50) !important;
      }
      
      /* Placeholders */
      input::placeholder, textarea::placeholder {
        color: #ccc !important;
      }
      
      /* Focus states */
      *:focus {
        outline-color: white !important;
      }
    `;
  }

  // Apply dark mode
  function applyDarkMode() {
    console.log("Applying dark mode...");

    // Skip if site already has dark theme
    if (hasNativeDarkTheme()) {
      console.log("Site appears to have native dark theme, skipping");
      return;
    }

    // Remove existing styles first
    removeDarkMode();

    // Create and inject new styles
    const styleElement = document.createElement("style");
    styleElement.id = DARK_MODE_ID;
    styleElement.textContent = createDarkModeStyles();

    // Add to head
    if (document.head) {
      document.head.appendChild(styleElement);
    } else {
      document.documentElement.appendChild(styleElement);
    }

    isEnabled = true;
    console.log("Dark mode applied successfully");

    // Start observing for dynamic content
    startObserver();
  }

  // Remove dark mode
  function removeDarkMode() {
    console.log("Removing dark mode...");

    const existingStyle = document.getElementById(DARK_MODE_ID);
    if (existingStyle) {
      existingStyle.remove();
    }

    stopObserver();
    isEnabled = false;
    console.log("Dark mode removed");
  }

  // Start mutation observer for dynamic content
  function startObserver() {
    if (observer || !document.body) return;

    observer = new MutationObserver(function (mutations) {
      // No need to do anything special - CSS will handle new elements
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Stop mutation observer
  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // Initialize based on stored preference
  function init() {
    const hostname = window.location.hostname;

    chrome.storage.sync.get([hostname], function (result) {
      const shouldEnable = result[hostname] || false;
      console.log("Init - hostname:", hostname, "shouldEnable:", shouldEnable);

      if (shouldEnable) {
        applyDarkMode();
      }
    });
  }

  // Listen for messages from popup
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.onMessage
  ) {
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      console.log("Content script received message:", request);

      if (request.action === "toggleDarkMode") {
        if (request.enabled) {
          applyDarkMode();
        } else {
          removeDarkMode();
        }
        sendResponse({ success: true });
      }
      return true;
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
