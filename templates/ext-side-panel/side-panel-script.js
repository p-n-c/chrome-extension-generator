document.addEventListener('DOMContentLoaded', () => {
  // Signal opening to service-worker
  chrome.runtime.sendMessage({
    from: 'side-panel',
    action: 'loaded',
  })
  // Listen for messages from the service worker
  chrome.runtime.onMessage.addListener((message) => {
    console.log(`Message received from ${message.from}: ${message.action}`)
    // Message handling
    if (message.from === 'service-worker') {
      switch (message.action) {
        case 'close-side-panel':
          // Closing the side panel
          window.close()
          break
        case 'display-message':
          // Display messages received from the service worker
          document.getElementById('message').innerText = message.content
          break
      }
    }
  })
})
