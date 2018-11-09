const { window, commands, Uri } = require('vscode');
const { reloadScriptSessionApp} = require("./communication")

exports.validateModelCommand = commands.registerCommand('extension.validateModel', async function () {
  const editor = window.activeTextEditor;
  const script = editor._documentData._lines.join('\r\n');
  const engineUrl = await reloadScriptSessionApp(script);
  const catwalkUrl = `https://catwalk.core.qlik.com/?engine_url=${engineUrl}`
  commands.executeCommand("vscode.open", Uri.parse(catwalkUrl));
});
