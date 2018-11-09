// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window, workspace, StatusBarAlignment, commands } = require('vscode');
const WebSocket = require('ws');
const net = require("net");
const enigma = require('enigma.js');
const schema = require('enigma.js/schemas/12.170.2.json');

let nbrScriptErrors = 0;

async function checkScriptSyntax(script) {
  const conf = workspace.getConfiguration("engine");
  const host = conf.get("host");
  const port = conf.get("port");

  console.log(`Using engine: ${host}:${port}`);

  const alive = await isReachable(port, { host });
  if (alive === true) {

    const session = enigma.create({
      schema,
      url: `ws://${host}:${port}/app/engineData/`,
      createSocket: url => new WebSocket(url),
    });

    //session.on("traffic:*", (direction, data) => console.log("session", direction, JSON.stringify(data)));
    const qix = await session.open();
    const app = await qix.createSessionApp();
    await app.setScript(script);
    const errors = await app.checkScriptSyntax();
    console.log(`Errors: ${JSON.stringify(errors)}`);
    session.close();
    window.showInformationMessage(`Found errors: ${JSON.stringify(errors)}`);
    return errors;
  }
  return [];
}

function isReachable(port, opts) {
  opts = Object.assign({ timeout: 1000 }, opts);
  return new Promise((resolve => {
    const socket = new net.Socket();
    const onError = (e) => {
      socket.destroy();
      window.showErrorMessage('Unable to connect to the Qlik Associative Engine.');
      resolve(false);
    };
    socket.setTimeout(opts.timeout);
    socket.on('error', onError);
    socket.on('timeout', onError);
    socket.connect(port, opts.host, () => {
      socket.end();
      resolve(true);
    });
  }));
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

  const scriptErrors = window.createStatusBarItem(StatusBarAlignment.Right, 100);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand('extension.checkScriptSyntax', async function () {
    // The code you place here will be executed every time your command is executed

    const editor = window.activeTextEditor;
    const script = editor._documentData._lines.join('\r\n');

    // Display a message box to the user
    window.showInformationMessage('Lets check the script');
    const errors = await checkScriptSyntax(script);
    nbrScriptErrors = errors.length;
    updateStatus(scriptErrors);
  });

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;

function updateStatus(status) {
	let errors = nbrScriptErrors;
	if (errors) {
		status.text = `$(megaphone) Number of script errors: ${errors}`;
	}

	if (errors) {
		status.show();
	} else {
		status.hide();
	}
}
