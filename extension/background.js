// background.js — Manifest V3 Service Worker
// Handles message routing between popup and content scripts

chrome.runtime.onInstalled.addListener(() => {
  console.log('Anti-Echo Chamber extension installed.');
});

// Listen for messages from popup requesting analysis of the current tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return sendResponse({ error: 'No active tab.' });
      chrome.tabs.sendMessage(tabs[0].id, { type: 'EXTRACT_AND_ANALYZE' }, (response) => {
        sendResponse(response || { error: 'Content script not ready.' });
      });
    });
    return true; // Keep message channel open for async response
  }
});
