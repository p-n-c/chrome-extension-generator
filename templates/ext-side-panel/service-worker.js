// Service workers are ephemeral, use the chrome.storage API
// Not global variables as the source of truth in your event listeners
const storageCache = {
  isSidePanelOpen: false,
  currentTab: undefined,
}

const initStorageCache = chrome.storage.local.get().then((items) => {
  Object.assign(storageCache, items)
})

// Handles the loading state of the side panel DOM
// (**not** the side panel open state)
const panelManager = (() => {
  let currentState = {
    isLoaded: false,
    loadPromise: null,
    resolveLoad: null,
  }

  return {
    // Call this from the message handler
    handlePanelLoaded: () => {
      currentState.isLoaded = true
      if (currentState.resolveLoad) {
        currentState.resolveLoad()
      }
    },
    // Asynchronous wait for the panel DOM to load
    waitForLoad: async () => {
      if (currentState.isLoaded) {
        return Promise.resolve()
      }

      if (!currentState.loadPromise) {
        currentState.loadPromise = new Promise((resolve) => {
          currentState.resolveLoad = resolve
        })
      }

      return currentState.loadPromise
    },
    // Call this when opening a new panel
    reset: () => {
      currentState = {
        isLoaded: false,
        loadPromise: null,
        resolveLoad: null,
      }
    },
  }
})()

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

const handlePanelOpening = async (tab) => {
  // This must be run first to avoid
  panelManager.reset()
  storageCache.currentTab = tab
  storageCache.isSidePanelOpen = true
  await panelManager.waitForLoad()
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
}

chrome.action.onClicked.addListener(async (tab) => {
  // This has to happen first
  // If the panel is already open, nothing happens!
  chrome.sidePanel.open({ windowId: tab.windowId })
  await initStorageCache
  // Visitor clicks on the extension icon
  if (storageCache.isSidePanelOpen) {
    console.log('Closing side panel')
    closeSidePanel()
  } else {
    console.log('Opening side panel')
    await handlePanelOpening(tab)
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
        // Let panel manager know about the load
        panelManager.handlePanelLoaded()
    }
  }
  chrome.storage.local.set(storageCache)
})
