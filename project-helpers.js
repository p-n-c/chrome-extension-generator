export const getManifest = (projectType, projectName, manifestDescription) => {
  let permissions
  switch (projectType) {
    case 'ext':
      permissions = ['activeTab']
      break
    case 'ext-side-panel':
      permissions = ['activeTab', 'sidePanel', 'storage']
      break
  }
  const manifest = {
    manifest_version: 3,
    name: projectName,
    version: '0.0.0.1',
    description: manifestDescription,
    permissions,
    host_permissions: ['<all_urls>'],
    background: {
      service_worker: 'background/service-worker.js',
      type: 'module',
    },
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['content-scripts/content-script.js'],
      },
    ],
    action: {},
    icons: {},
  }

  if (projectType === 'ext') {
    manifest.content_scripts.js = ['content-scripts/content-script.js']
  }

  if (projectType === 'ext-side-panel') {
    manifest.side_panel = {
      default_path: 'sidepanel/side-panel.html',
    }
  }

  return manifest
}

export const webPage = (projectTitle) => {
  return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${projectTitle}</title>
        </head>
        <body>
            <h1>Welcome to ${projectTitle}</h1>
        </body>
        </html>`
}

export const sidePanel = (projectTitle) => {
  return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${projectTitle}</title>
        </head>
        <body>
            <h1>${projectTitle}</h1>
        </body>
            <div id="message">Message goes here…</div>
            <script src="side-panel-script.js"></script>
        </html>`
}
