chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureScreen') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        sendResponse({ success: false, error: chrome.runtime.lastError?.message || 'Failed to capture tab' });
        return;
      }

      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      console.log('Captured Base64 data:', base64Data);

      // Send the captured image data back to the sender
      sendResponse({ success: true, imageData: base64Data });
    });

    // Indicate that the response will be sent asynchronously
    return true;
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_extension') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  }
});