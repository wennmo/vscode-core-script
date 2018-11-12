const { window, commands, Uri } = require('vscode');
const { reloadScriptSessionApp, getConfig } = require('./communication');

exports.validateModelCommand = commands.registerCommand('extension.validateModel', async (args) => {
  let engineUrl;

  if (!args) {
    const editor = window.activeTextEditor;
    const script = editor._documentData._lines.join('\r\n');
    engineUrl = await reloadScriptSessionApp(script);
  } else {
    const engineConfig = await getConfig();
    engineUrl = `${engineConfig.secure ? 'wss' : 'ws'}://${engineConfig.host}:${engineConfig.port}${args.docId}`;
  }

  const catwalkUrl = `https://catwalk.core.qlik.com/?engine_url=${engineUrl}`;
  commands.executeCommand('vscode.open', Uri.parse(catwalkUrl));
});
