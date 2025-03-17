// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convertLayout",
    title: "Convert Keyboard Layout (Auto)",
    contexts: ["selection"],
  });
});

// Track which tabs have content scripts loaded
const loadedTabs = new Set();

// Listen for content script ready messages
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "contentScriptReady" && sender.tab) {
    loadedTabs.add(sender.tab.id);
  }
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  loadedTabs.delete(tabId);
});

// Function to ensure content scripts are loaded before sending messages
function ensureContentScriptsLoaded(tabId) {
  return new Promise((resolve, reject) => {
    // If we know the content script is loaded, resolve immediately
    if (loadedTabs.has(tabId)) {
      resolve();
      return;
    }

    // Otherwise, inject the scripts
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["mappings.js", "content.js"],
    })
    .then(() => {
      // Give the content scripts a moment to initialize
      setTimeout(() => {
        loadedTabs.add(tabId);
        resolve();
      }, 100);
    })
    .catch(reject);
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convertLayout" && tab && tab.id) {
    ensureContentScriptsLoaded(tab.id)
      .then(() => {
        return chrome.tabs.sendMessage(tab.id, {
          action: "convertText",
          autoDetect: true,
          selectedText: info.selectionText,
        });
      })
      .catch((err) => {
        console.error("Failed to convert text:", err);
        // You could show an error notification to the user here
      });
  }
});
