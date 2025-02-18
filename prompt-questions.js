export const promptQuestions = async (input, select) => {
  // First, ask for the project type
  const projectType = await select({
    message: 'Project type:',
    choices: [
      { name: 'Extension project', value: 'ext' },
      { name: 'Extension project with side panel', value: 'ext-side-panel' },
    ],
    default: 'ext',
  })
  const projectName = await input({
    message: 'Project directory name:',
    default: 'my-new-project',
  })
  const projectTitle = await input({
    message: 'Project title:',
    default: '',
  })
  const projectDescription = await input({
    message: 'Project description:',
    default: '',
  })
  const projectAuthor = await input({
    message: 'Project author:',
    default: '',
  })
  const srcFolder = await input({
    message: 'Source folder name:',
    default: 'publish',
  })

  let typeOptions = {}
  // Conditional question based on projectType
  if (projectType === 'ext') {
    typeOptions.manifestDescription = await input({
      message: 'Manifest extension description:',
      default: '',
    })
  }

  return {
    projectType,
    projectName,
    projectTitle,
    projectDescription,
    projectAuthor,
    srcFolder,
    typeOptions,
  }
}
