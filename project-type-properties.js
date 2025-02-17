import fs from 'fs-extra'
import path from 'path'
import { getManifest, webPage, sidePanel } from './project-helpers.js'

export const addProjectTypeProperties = async (
  __dirname,
  projectType,
  projectPath,
  options
) => {
  const { projectName, projectTitle, srcFolder, manifestDescription } = options

  // TODO: DRY
  // Copy relevant service worker
  await fs.copy(
    path.join(__dirname, 'templates', projectType, 'service-worker.js'),
    path.join(projectPath, srcFolder, 'background', 'service-worker.js')
  )
  // Copy relevant content script
  await fs.copy(
    path.join(__dirname, 'templates', projectType, 'content-script.js'),
    path.join(projectPath, srcFolder, 'content-scripts', 'content-script.js')
  )
  // Initialise manifest
  const manifestJson = getManifest(
    projectType,
    projectName,
    manifestDescription
  )
  // Create manifest
  await fs.writeJson(
    path.join(projectPath, srcFolder, 'manifest.json'),
    manifestJson,
    {
      spaces: 2,
    }
  )
  switch (projectType) {
    case 'ext':
      break
    case 'ext-side-panel':
      {
        // Copy side panel script
        await fs.copy(
          path.join(
            __dirname,
            'templates',
            projectType,
            'side-panel-script.js'
          ),
          path.join(projectPath, srcFolder, 'sidepanel', 'side-panel-script.js')
        )
        await fs.writeFile(
          path.join(projectPath, srcFolder, 'sidepanel', 'styles.css'),
          ''
        )
        // Create a basic HTML side panel
        const htmlContent = sidePanel(projectTitle)
        await fs.writeFile(
          path.join(projectPath, srcFolder, 'sidepanel', 'side-panel.html'),
          htmlContent
        )
      }
      break
  }
}
