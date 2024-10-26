function captureScreen() {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, function(dataUrl) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    // Send the base64-encoded image data back to the sender
    chrome.runtime.sendMessage({ action: 'captureScreenResponse', dataUrl });
  });
}

// Example: Add a listener to capture the screen when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  captureScreen();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureScreen') {
    captureScreen();
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open_extension") {
    chrome.windows.getCurrent((window) => {
      chrome.tabs.create({
        url: chrome.runtime.getURL("index.html"),
        windowId: window.id
      });
    });
  }
});
