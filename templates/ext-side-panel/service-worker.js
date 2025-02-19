// Service workers are ephemeral, use the chrome.storage API
// Not global variables as the source of truth in your event listeners
const storageCache = {
  isSidePanelOpen: false,
  currentTab: undefined,
}

const initStorageCache = chrome.storage.local.get().then((items) => {
  Object.assign(storageCache, items)
})

const closeSidePanel = async () => {
  chrome.runtime.sendMessage({
    from: 'service-worker',
    action: 'close-side-panel',
  })
  // Let the tab content script know that the side panel is closed
  chrome.tabs.sendMessage(storageCache.currentTab.id, {
    from: 'service-worker',
    action: 'side-panel-close',
  })
  storageCache.currentTab = undefined
  storageCache.isSidePanelOpen = false
}

chrome.action.onClicked.addListener(async (tab) => {
  // Visitor clicks on the extension icon
  if (storageCache.isSidePanelOpen) {
    console.log('Closing side panel')
    await initStorageCache
    closeSidePanel()
  } else {
    storageCache.currentTab = tab
    console.log(`Opening side panel for tab ${storageCache.currentTab.id}`)
    chrome.sidePanel.open({ windowId: storageCache.currentTab.windowId })
    // Can't be run outside the if statement because
    // the sidePanel.open method has to be first in the event listener
    await initStorageCache
    storageCache.isSidePanelOpen = true
  }
  chrome.storage.local.set(storageCache)
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  await initStorageCache
  // When the visitor updates the current tab, we keep the panel open
  if (changeInfo.status === 'complete') {
    storageCache.currentTab = tab
    chrome.runtime.sendMessage({
      from: 'service-worker',
      action: 'display-message',
      content: `Side panel for tab: ${storageCache.currentTab.title}`,
    })
  }
  chrome.storage.local.set(storageCache)
})

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await initStorageCache
  console.log(`New tab activated: ${activeInfo.tabId}`)
  // When the visitor goes to another tab, we close the panel if it's open
  if (storageCache.isSidePanelOpen) closeSidePanel()
  chrome.storage.local.set(storageCache)
})

chrome.runtime.onMessage.addListener(async (message) => {
  await initStorageCache
  if (message.from === 'side-panel') {
    switch (message.action) {
      case 'loaded':
        console.log('Side panel loaded')
        // We can only update the side panel when its DOM is loaded
        chrome.runtime.sendMessage({
          from: 'service-worker',
          action: 'display-message',
          content: `Side panel for tab: ${storageCache.currentTab.title}`,
        })
        // Let the tab content script know that the user started the extension
        chrome.tabs.sendMessage(storageCache.currentTab.id, {
          from: 'service-worker',
          action: 'side-panel-open',
        })
        break
    }
  }
  chrome.storage.local.set(storageCache)
})
