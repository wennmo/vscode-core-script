const { window, commands, ViewColumn } = require('vscode');
const { reloadScriptSessionApp} = require("./communication")

exports.validateModelCommand = commands.registerCommand('extension.validateModel', async function () {
  const panel = window.createWebviewPanel(
    'catwalk', // Identifies the type of the webview. Used internally
    "catwalk", // Title of the panel displayed to the user
    ViewColumn.One, // Editor column to show the new webview panel in.
    {} // Webview options. More on these later.
  );

  const editor = window.activeTextEditor;
  const script = editor._documentData._lines.join('\r\n');
  const engineUrl = await reloadScriptSessionApp(script);
  const catwalkUrl = `https://catwalk.core.qlik.com/?engine_url=${engineUrl}`
  console.log(catwalkUrl);
});
