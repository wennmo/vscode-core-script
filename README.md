
[![CircleCI](https://circleci.com/gh/wennmo/vscode-core-script.svg?style=shield)](https://circleci.com/gh/wennmo/vscode-core-script)

# vscode-core-script

## Description

This repo contains a vscode extension for developing and validating scripts using the editor. You can validate the script syntax, load the script in Qlik Associative Engine and view the current data model using `Catwalk`.

Keep in mind that this repository is under heavy development and the appareance and behaviour will probably change in the coming weeks.

## Prerequisites

- Qlik Associative Engine

We also recommend you to install the [vscode-qlik](https://github.com/Gimly/vscode-qlik) extension to get load script syntax highlighting in `vscode`!

## Configuration

This extension will by default use `localhost:9076` for communication with a Qlik Associative Engine. However `host` and `port` can be configured in your user settings for `vscode` like [this](./.vscode/settings.json).

If you want to connect with secure websocket and/or use headers you can also define them in settings:

```json
{
  "engine.host": "localhost",
  "engine.port": 19076,
  "engine.secure": true,
  "engine.headers": {
    "headerKey": "headerValue"
  }
}
```

## Features

### Validate script syntax

The extension will use the running Qlik Associative Engine for validating the script syntax of the load script. If errors are detected they will be highlighted in the editor and also the errors will be displayed in the status bar and in the `Problems`console.

The command can be executed by running `Ctrl+Shift+p` and is also triggered when saving a `.qvs` file.

### Show data model in Catwalk

To make it possible to view the data model created by your load script, the extension makes use of [`Catwalk`](https://github.com/qlik-oss/catwalk).

The command can be executed by running `Ctrl+Shift+c`.

### Stay tuned

## Try it out

The extension is not yet published to Visual Studio Marketplace, but if you want to try it out you can clone the repo and run it in debugger with `F5`.
