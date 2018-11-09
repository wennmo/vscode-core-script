// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const WebSocket = require('ws');
const enigma = require('enigma.js');
const schema = require('enigma.js/schemas/12.170.2.json');

const engine = "localhost:19076";
const session = enigma.create({
  schema,
  url: `ws://${engine}/app/engineData/`,
  createSocket: url => new WebSocket(url),
});

const script = `
Characters
Load Chr(RecNo()+Ord('A')-1) as Alpha, RecNo() as Num autogenerate 26;
ASCII:
Load
if(RecNo()>=65 and RecNo()<=90,RecNo()-64) as Num,
  Chr(RecNo()) as AsciiAlpha,
ReNo() as AsciiNum
autogenerate 255
Where (RecNo()>=32 and RecNo()<=126) or RecNo()>=160 ;
Transactions:
Load
TransLineID,
TransID,
mod(TransID,26)+1 as Num,
Pick(Ceil(3*Rand1),'A','B','C') as Dim1,
Pick(Ceil(6*Rand1),'a','b','c','d','e','f') as Dim2,
Pick(Ceil(3*Rand()),'X','Y','Z') as Dim3,
Round(1000*Rand()*Rand()*Rand1) as Expression1,
Round(  10*Rand()*Rand()*Rand1) as Expression2,
Round(Rand()*Rand1,0.00001) as Expression3;
Load
Rand() as Rand1,
IterNo() as TransLineID,
RecNo() as TransID
Autogenerate 1000
While Rand()<=0.5 or IterNo()=1;
Comment Field Dim1 With "This is a field comment";
`;

async function checkScriptSyntax() {
  //session.on("traffic:*", (direction, data) => console.log("session", direction, JSON.stringify(data)));
  const qix = await session.open();
  const app = await qix.createSessionApp();
  await app.setScript(script);
  const errors = await app.checkScriptSyntax();
  console.log(`Errors: ${JSON.stringify(errors)}`);
  return errors;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.checkScriptSyntax', async function () {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Lets check the script');
        const errors = await checkScriptSyntax();
        vscode.window.showInformationMessage(`Found errors: ${JSON.stringify(errors)}`);
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
