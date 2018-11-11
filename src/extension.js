// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window, commands } = require('vscode');
const { checkScriptSyntaxCommand } = require('./check-script-syntax-command');
const { validateModel } = require('./validate-model-command');
const getDocTree = require('./docs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  context.subscriptions.push(window.registerTreeDataProvider('qlikDocs', new getDocTree.Docs()));
  context.subscriptions.push(checkScriptSyntaxCommand);
  context.subscriptions.push(validateModel);

  context.subscriptions.push(commands.registerCommand('qlikDocs.addDoc', async () => {
    const inputBoxOptions = {
      placeHolder: 'myApp.qvf',
      prompt: 'Name of the app.',
      // validateInput function
    };
    const appName = await window.showInputBox(inputBoxOptions);

    if (appName) {
      window.showInformationMessage(`Lets add the app: ${appName}`);
    }
  }));
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
