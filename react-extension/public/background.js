function captureScreen() {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, function(dataUrl) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    // Log the base64-encoded image data to the console
    console.log(dataUrl);
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
