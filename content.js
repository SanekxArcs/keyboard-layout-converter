// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);

  if (request.action === "convertText") {
    let direction;
    
    if (request.autoDetect) {
      direction = detectDirection(request.selectedText);
    } else {
      direction = request.direction === "engToUkr" ? "engToUkr" : "ukrToEng";
    }
    
    const convertedText = convertText(request.selectedText, direction);

    const activeEl = document.activeElement;
    const selection = window.getSelection();

    try {
      if (
        activeEl.tagName === "TEXTAREA" ||
        activeEl.tagName === "INPUT"
      ) {
        // Handle input and textarea elements
        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;

        if (typeof start === "number" && typeof end === "number") {
          // For regular input elements
          const text = activeEl.value;
          activeEl.value =
            text.substring(0, start) + convertedText + text.substring(end);
          
          // Reset selection to end of inserted text
          activeEl.selectionStart = activeEl.selectionEnd =
            start + convertedText.length;
        }
      } else if (activeEl.isContentEditable) {
        // For contenteditable elements
        if (!selection.isCollapsed) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(convertedText));
          
          // Reset the selection
          selection.removeAllRanges();
          const newRange = document.createRange();
          newRange.setStartAfter(range.startContainer.childNodes[0] || range.startContainer);
          selection.addRange(newRange);
        }
      } else if (!selection.isCollapsed) {
        // For general web page selections
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(convertedText));
        
        // Reset the selection
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.setStartAfter(range.startContainer.childNodes[0] || range.startContainer);
        selection.addRange(newRange);
      }

      sendResponse({ success: true });
    } catch (error) {
      console.error("Error during text conversion:", error);
      sendResponse({ success: false, error: error.message });
    }
    
    return true; // Indicates async response
  }
});

// Notify the background script that the content script is loaded
// Send it immediately and also after a slight delay to ensure it's received
chrome.runtime.sendMessage({ action: "contentScriptReady" });
// Sometimes the first message can be missed if sent too early
setTimeout(() => {
  chrome.runtime.sendMessage({ action: "contentScriptReady" });
}, 200);
