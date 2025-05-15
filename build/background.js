chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // Capturing the visible tab on the user's browser:
  if (request.action === 'captureScreen') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {

      if (chrome.runtime.lastError || !dataUrl) {
        console.error('Error capturing tab:', chrome.runtime.lastError?.message);

        sendResponse(
          { 
            success: false, 
            error: chrome.runtime.lastError?.message || 'Failed to capture tab' 
          });
        return;
      }

      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

      // Sending the base64 image data back:
      sendResponse({ success: true, imageData: base64Data });
    });
  }

  // Indicate that the response will be sent asynchronously
  return true;
});