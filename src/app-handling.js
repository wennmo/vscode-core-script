const { window, commands, workspace } = require('vscode');
const { getScript, createApp, update } = require('./communication');

const inputBoxOptions = {
  placeHolder: 'myApp.qvf',
  prompt: 'Name of the app.',
  // TODO: validateInput function
};

exports.getScript = commands.registerCommand('qlikDocs.getScript', async (args) => {
  let appName;

  if (args && args.docId) {
    appName = args.docId;
  } else {
    appName = await window.showInputBox(inputBoxOptions);
  }

  const script = await getScript(appName);
  if (script == null) {
    window.showErrorMessage('No script found!');
  } else {
    const doc = await workspace.openTextDocument({ language: 'qlik', content: script });
    window.showTextDocument(doc);
  }
});

exports.addDoc = commands.registerCommand('qlikDocs.addDoc', async () => {
  const appName = await window.showInputBox(inputBoxOptions);

  if (appName) {
    await createApp(appName);
    window.showInformationMessage(`The app ${appName} was created on the QAE.`);
  }

  // todo: refresh applist
});

exports.update = commands.registerCommand('qlikDocs.update', async (args) => {
  let appName;

  if (args && args.docId) {
    appName = args.docId;
  } else {
    appName = await window.showInputBox(inputBoxOptions);
  }

  const editor = window.activeTextEditor;
  const script = editor._documentData._lines.join('\r\n');

  // todo: check if active is qvs

  await update(appName, script);
  window.showInformationMessage(`The app ${appName} has been updated`);
});
