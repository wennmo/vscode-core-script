// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window, commands, workspace } = require('vscode');
const { checkScriptSyntaxCommand } = require('./check-script-syntax-command');
const { validateModel } = require('./validate-model-command');
const getDocTree = require('./docs');
const { getScript } = require('./communication');


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  context.subscriptions.push(window.registerTreeDataProvider('qlikDocs', new getDocTree.Docs()));
  context.subscriptions.push(checkScriptSyntaxCommand);
  context.subscriptions.push(validateModel);

  context.subscriptions.push(commands.registerCommand('qlikDocs.getScript', async (treeItemInfo) => {
    const script = await getScript(treeItemInfo.docId);
    if (script == null) {
      window.showErrorMessage('No script found!');
    } else {
      const doc = await workspace.openTextDocument({ language: 'qlik', content: script });
      window.showTextDocument(doc);
    }
  }));

  context.subscriptions.push(commands.registerCommand('qlikDocs.addDoc', async () => {
    const inputBoxOptions = {
      placeHolder: 'myApp.qvf',
      prompt: 'Name of the app.',
      // TODO: validateInput function
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
