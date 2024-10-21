# Chrome Extension Template Generator

## Create new extension projects from the CLI

To run the generator, you must clone it.

From the terminal cd into the `extension-template-generator` directory and run:

```bash
npm link
```

This will give you global access to the generator.

Now go to the root directory where the project will be created:

```bash
create-extension
```

This will run the generator (provide inputs as required).

Once the project has been built, you will be prompted to run commands to install dependencies and run linters.

To open in VS Code:

```bash
code .
```

[To add the new repo to GitHub using Git](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)

- Create the new repo
- Follow instructions (copy and paste code suggested in GitHub)

## Importing scripts

### Service worker

You can import scripts with static ES modules using the usual `import` syntax.

### Content script

Content scripts do not support ES modules. You need to declare your functions in the `window` global namespace. Here is how to do it:

1. Declare all the files in the manifest _in order of dependency_, e.g.
   ```json
   "content_scripts": [
       {
       "matches": ["<all_urls>"],
       "js": [
           "content_scripts/utils.js",
           "content_scripts/content-script.js"
       ]
       }
   ]
   ```
2. In `utils.js`, declare all the functions you want to use in `content-script.js` in the `window` global namespace, e.g.
   ```javascript
   window.myUsefulFunction = function () {
     // Your code here
   }
   ```
3. Call the function in `content-script.js` from the `window` namespace, e.g.
   ```javascript
   const result = window.myUsefulFunction()
   ```
