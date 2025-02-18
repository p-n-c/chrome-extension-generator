chrome.runtime.onMessage.addListener((message) => {
  if (message.from === 'service-worker') {
    switch (message.action) {
      case 'side-panel-open':
        console.log('I now have a side panel :)')
        break
      case 'side-panel-close':
        console.log("I don't have a side panel anymore :/")
    }

    // Add extension code here…
  }
})
