#!/usr/bin/env node
/* eslint-disable no-undef */

import { input, select } from '@inquirer/prompts'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { promisify } from 'util'
import { exec as execCallback } from 'child_process'
import { addProjectTypeProperties } from './project-type-properties.js'
import { promptQuestions } from './prompt-questions.js'

const exec = promisify(execCallback)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function generateProject({
  projectType,
  projectName,
  projectTitle,
  projectDescription,
  projectAuthor,
  srcFolder,
  typeOptions,
}) {
  const projectPath = path.join(process.cwd(), projectName)

  try {
    if (await fs.pathExists(projectPath)) {
      console.error(`Project directory "${projectName}" already exists.`)
      process.exit(1)
    }

    // Create the project directory
    await fs.mkdir(projectPath)

    // Initialise git repository
    console.log('Initializing git repository...')
    await exec('git init', { cwd: projectPath })

    // Add git .ignore file
    await fs.writeFile(
      path.join(projectPath, '.gitignore'),
      'node_modules\nchrome-extension.zip\n'
    )

    // Initialise npm package
    const packageJson = {
      name: projectName,
      version: '0.0.1',
      description: projectDescription,
      author: projectAuthor,
      type: 'module',
      scripts: {
        lint: "eslint . && prettier --check . && stylelint '**/*.{css,scss}'",
      },
      devDependencies: {
        eslint: 'latest',
        prettier: 'latest',
        stylelint: 'latest',
        'stylelint-config-standard': 'latest',
      },
    }
    await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, {
      spaces: 2,
    })

    // Create src folder
    await fs.mkdir(path.join(projectPath, srcFolder))

    // Copy configuration files
    await fs.copy(
      path.join(__dirname, 'templates', 'my.eslint.config.js'),
      path.join(projectPath, 'eslint.config.js')
    )
    await fs.copy(
      path.join(__dirname, 'templates', 'my.prettier.config.js'),
      path.join(projectPath, 'prettier.config.js')
    )
    await fs.copy(
      path.join(__dirname, 'templates', 'my.stylelintrc.json'),
      path.join(projectPath, '.stylelintrc.json')
    )
    await fs.copy(
      path.join(__dirname, 'templates', 'jsconfig.json'),
      path.join(projectPath, 'jsconfig.json')
    )
    fs.copySync(
      path.join(__dirname, 'templates', 'support'),
      path.join(projectPath, 'support')
    )

    // Copy .vscode files
    await fs.copy(
      path.join(__dirname, '.vscode', 'settings.json'),
      path.join(projectPath, '.vscode/settings.json')
    )

    // Create README.md
    await fs.writeFile(
      path.join(projectPath, 'README.md'),
      `# ${projectTitle}\n\n${projectDescription}\n`
    )

    // Add files that are specific to the type of project, e.g. web or (chrome) ext (extension)
    addProjectTypeProperties(__dirname, projectType, projectPath, {
      projectName,
      projectTitle,
      srcFolder,
      ...typeOptions,
    })

    console.log('Project files have been set up successfully.')

    // Install dependencies
    console.log('Installing dependencies...')
    const { stdout } = await exec('npm install', { cwd: projectPath })
    console.log(stdout)
    console.log(`Dependencies installed successfully in ${projectPath}`)

    // Give instructions to complete setup
    console.log(`
      Project "${projectName}" has been created successfully!
      To get started, run the following commands to install dependencies and run linters:
      
      cd ${projectName} && npm install && npm run lint

      Then check the "support" directory for extra customization
      `)
  } catch (error) {
    console.error(`An error occurred: ${error.message}`)
    process.exit(1)
  }
}

// Generate project based on responses to setup questions
promptQuestions(input, select)
  .then(generateProject)
  .catch((error) => {
    console.error(`An error occurred: ${error.message}`)
    process.exit(1)
  })
