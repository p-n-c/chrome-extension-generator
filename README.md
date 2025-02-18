# Chrome Extension Template Generator

## Create new extension projects from the CLI

To run the generator, you must clone it.

From the terminal cd into the `chrome-extension-generator` directory and run:

```bash
npm install && npm link
```

This will give you global access to the generator.

Now go to the root directory where the project will be created and run:

```bash
create-chrome-extension
```

This will run the generator (provide inputs as required).

Once the project has been built, you will be prompted to run commands to install dependencies and run linters.

When in the extension directory, open in VS Code with:

```bash
code .
```

(Here is how to set up the [VS Code command line interface](https://code.visualstudio.com/docs/editor/command-line))

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

## How to work with your new extension

### Tips and tricks for development

- Make sure your manifest has the [right permissions](https://developer.chrome.com/docs/extensions/reference/permissions-list) for what you're trying to achieve. Error messages don't explicitely mention that you're missing a permission.
- Once you've (re)loaded your extension locally, try to reload the web page you're working on, that may solve some communication issues between the service worker and the content script.
- If you have weird errors, don't hesitate to `Remove` and `Load Unpacked` the extension again, particularly if you've modified the manifest.

### Local use

You can use your extension locally in Chrome (or Chromium-based browsers such as Brave) as follows:

- Go to the menu (burger or three dots in the top right corner) then `Extensions > Manage Extensions`.
- Make sure the `Developer Mode` is activated (toggle in the top right corner)
- Click `Load Unpacked` and point to the directory hosting your extension code (by default `publish`, it's the directory containing your `manifest.json`)

### Distribution on the Chrome Web Store

We've written a [short article](https://people-and-code.com/how-to/build-and-distribute-a-chrome-extension) about the main steps and pitfalls to publishing your extension on the [Chrome Web Store](https://chromewebstore.google.com/).
