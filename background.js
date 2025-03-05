console.log('Background script loaded');

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    try {
      const originalUrl = details.url;
      if (
        (originalUrl.includes('/transform/videomanifest') && originalUrl.includes('format=dash')) ||
        originalUrl.endsWith('.m3u8') ||
        originalUrl.endsWith('.mpd')
      ) {
        console.log('Video manifest detected:', originalUrl);

        let cleanedUrl = originalUrl;
        let type = 'unknown';
        if (originalUrl.includes('/transform/videomanifest') && originalUrl.includes('format=dash')) {
          const index = originalUrl.indexOf('format=dash');
          cleanedUrl = originalUrl.substring(0, index + 'format=dash'.length);
          type = 'dash';
        } else if (originalUrl.endsWith('.mpd')) {
          const index = originalUrl.indexOf('.mpd') + '.mpd'.length;
          cleanedUrl = originalUrl.substring(0, index);
          type = 'dash';
        } else if (originalUrl.endsWith('.m3u8')) {
          const index = originalUrl.indexOf('.m3u8') + '.m3u8'.length;
          cleanedUrl = originalUrl.substring(0, index);
          type = 'hls';
        }

        const manifestData = {
          originalUrl: originalUrl,
          cleanedUrl: cleanedUrl,
          type: type
        };
        chrome.storage.local.set({ lastManifest: manifestData }, (result) => {
          if (chrome.runtime.lastError) {
            console.error('Error saving manifest:', chrome.runtime.lastError.message);
          } else {
            console.log('Manifest saved:', manifestData);
          }
        });

        chrome.runtime.sendMessage({ type: 'manifestDetected', data: manifestData }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError.message);
          }
        });
      }
    } catch (error) {
      console.error('Error in webRequest listener:', error);
    }
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  if (message.type === 'getLastManifest') {
    try {
      chrome.storage.local.get('lastManifest', (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error getting manifest:', chrome.runtime.lastError.message);
          sendResponse({ data: null });
        } else {
          sendResponse({ data: result.lastManifest || null });
        }
      });
    } catch (error) {
      console.error('Error in message listener:', error);
      sendResponse({ data: null });
    }
    return true; // Keep the channel open for async response
  }
});