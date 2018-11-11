const { checkScriptSyntaxCommand } = require('./check-script-syntax-command');
const { validateModel } = require('./validate-model-command');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  context.subscriptions.push(checkScriptSyntaxCommand);
  context.subscriptions.push(validateModel);
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
