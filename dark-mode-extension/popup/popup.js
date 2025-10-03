document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("darkModeToggle");
  const label = document.getElementById("toggleLabel");

  // Get current tab and initialize
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    const hostname = new URL(currentTab.url).hostname;

    // Get current state from storage
    chrome.storage.sync.get([hostname], function (result) {
      const isEnabled = result[hostname] || false;
      toggle.checked = isEnabled;
      updateLabel(isEnabled);
    });

    // Handle toggle change
    toggle.addEventListener("change", function () {
      const enabled = toggle.checked;

      // Save state
      chrome.storage.sync.set({ [hostname]: enabled });

      // Send message to content script
      chrome.tabs.sendMessage(
        currentTab.id,
        {
          action: "toggleDarkMode",
          enabled: enabled,
        },
        function (response) {
          if (chrome.runtime.lastError) {
            console.log(
              "Content script not ready, will be handled on page load"
            );
          }
        }
      );

      updateLabel(enabled);
    });
  });

  function updateLabel(enabled) {
    label.textContent = enabled
      ? "Disable dark mode on this site"
      : "Enable dark mode on this site";
  }
});
