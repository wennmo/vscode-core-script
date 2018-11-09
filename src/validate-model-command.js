const { window, commands, ViewColumn } = require('vscode');

exports.validateModelCommand = commands.registerCommand('extension.validateModel', async function () {
  const panel = window.createWebviewPanel(
    'catwalk', // Identifies the type of the webview. Used internally
    "catwalk", // Title of the panel displayed to the user
    ViewColumn.One, // Editor column to show the new webview panel in.
    {} // Webview options. More on these later.
  );
});
