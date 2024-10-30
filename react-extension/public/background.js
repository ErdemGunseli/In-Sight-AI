chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request);
  if (request.action === 'captureScreen') {
    console.log('Processing captureScreen action...');
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        console.error('Error capturing tab:', chrome.runtime.lastError?.message);
        sendResponse({ success: false, error: chrome.runtime.lastError?.message || 'Failed to capture tab' });
        return;
      }

      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      console.log('Captured Base64 data length:', base64Data.length);

      // Send the captured image data back to the sender
      sendResponse({ success: true, imageData: base64Data });
    });
  }

  // Indicate that the response will be sent asynchronously
  return true;
});