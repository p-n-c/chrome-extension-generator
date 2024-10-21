// Basic extension which runs when the user clicks on the extension icon

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed')
})

// Send message to content-script.js
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'runExtension' })
})
