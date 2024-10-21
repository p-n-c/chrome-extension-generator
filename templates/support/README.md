# Git hooks script

## Automatically zip the publish directory for upload

- Move the pre-commit script to the `.git/hooks` directory. From the `./support` directory:
  `cp pre-commit ../.git/hooks/pre-commit`
- Commit normally, the script will automatically create `chrome-extension.zip`
