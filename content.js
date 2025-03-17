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

// Function to create the language indicator element
function createLanguageIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'kb-layout-indicator';
  indicator.style.position = 'fixed';
  indicator.style.padding = '2px 6px';
  indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  indicator.style.color = 'white';
  indicator.style.borderRadius = '3px';
  indicator.style.fontSize = '12px';
  indicator.style.fontWeight = 'bold';
  indicator.style.zIndex = '9999';
  indicator.style.pointerEvents = 'none'; // Don't interfere with mouse events
  indicator.style.display = 'none';
  document.body.appendChild(indicator);
  return indicator;
}

// Function to detect current input language
function detectInputLanguage(element) {
  // Default to English if no element or no text
  if (!element) return 'EN';
  
  let text = '';
  if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
    text = element.value;
  } else if (element.isContentEditable) {
    text = element.textContent;
  }
  
  if (!text || text.length === 0) return 'EN';
  
  // Check last few characters to determine language
  const lastTenChars = text.slice(-10);
  const ukrCount = Array.from(lastTenChars).filter(ch => isUkrainianChar(ch)).length;
  const engCount = Array.from(lastTenChars).filter(ch => isEnglishChar(ch)).length;
  
  if (ukrCount > engCount) return 'UA';
  return 'EN';
}

// Initialize language indicator
const indicator = createLanguageIndicator();

// Handle mouse movement to position the indicator
document.addEventListener('mousemove', (e) => {
  if (indicator.style.display === 'block') {
    indicator.style.left = `${e.clientX + 15}px`;
    indicator.style.top = `${e.clientY + 15}px`;
  }
});

// Set up event listeners for input fields
function setupInputFieldListeners() {
  const inputSelectors = 
    'input[type="text"], input[type="password"], input[type="search"], input:not([type]), textarea, [contenteditable="true"]';
  
  const inputFields = document.querySelectorAll(inputSelectors);
  
  inputFields.forEach(field => {
    // Show indicator on mouse over
    field.addEventListener('mouseover', (e) => {
      const lang = detectInputLanguage(e.target);
      indicator.textContent = lang;
      indicator.style.display = 'block';
      indicator.style.left = `${e.clientX + 15}px`;
      indicator.style.top = `${e.clientY + 15}px`;
    });
    
    // Hide indicator on mouse out
    field.addEventListener('mouseout', () => {
      indicator.style.display = 'none';
    });

    // Update indicator on input (when typing)
    field.addEventListener('input', (e) => {
      if (indicator.style.display === 'block') {
        const lang = detectInputLanguage(e.target);
        indicator.textContent = lang;
      }
    });
  });
}

// Run setup when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupInputFieldListeners);
} else {
  setupInputFieldListeners();
}

// Set up observer for dynamically added input fields
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      setupInputFieldListeners();
      break;
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Notify the background script that the content script is loaded
// Send it immediately and also after a slight delay to ensure it's received
chrome.runtime.sendMessage({ action: "contentScriptReady" });
// Sometimes the first message can be missed if sent too early
setTimeout(() => {
  chrome.runtime.sendMessage({ action: "contentScriptReady" });
}, 200);
