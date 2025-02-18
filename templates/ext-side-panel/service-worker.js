let isSidePanelOpen = false
let currentTab = undefined

const closeSidePanel = async () => {
  chrome.runtime.sendMessage({
    from: 'service-worker',
    action: 'close-side-panel',
  })
  // Let the tab content script know that the side panel is closed
  chrome.tabs.sendMessage(currentTab.id, {
    from: 'service-worker',
    action: 'side-panel-close',
  })
  currentTab = undefined
  isSidePanelOpen = false
}

chrome.action.onClicked.addListener((tab) => {
  // Visitor clicks on the extension icon
  if (isSidePanelOpen) {
    console.log('Closing side panel')
    closeSidePanel()
  } else {
    currentTab = tab
    console.log(`Opening side panel for tab ${currentTab.id}`)
    chrome.sidePanel.open({ windowId: currentTab.windowId })
    isSidePanelOpen = true
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // When the visitor updates the current tab, we keep the panel open
  if (changeInfo.status === 'complete') {
    currentTab = tab
    chrome.runtime.sendMessage({
      from: 'service-worker',
      action: 'display-message',
      content: `Side panel for tab: ${currentTab.title}`,
    })
  }
})

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(`New tab activated: ${activeInfo.tabId}`)
  // When the visitor goes to another tab, we close the panel if it's open
  if (isSidePanelOpen) closeSidePanel()
})

chrome.runtime.onMessage.addListener((message) => {
  if (message.from === 'side-panel')
    switch (message.action) {
      case 'loaded':
        console.log('Side panel loaded')
        // We can only update the side panel when its DOM is loaded
        chrome.runtime.sendMessage({
          from: 'service-worker',
          action: 'display-message',
          content: `Side panel for tab: ${currentTab.title}`,
        })
        // Let the tab content script know that the user started the extension
        chrome.tabs.sendMessage(currentTab.id, {
          from: 'service-worker',
          action: 'side-panel-open',
        })
        break
    }
})
