const WebSocket = require('ws');
const net = require('net');
const { window, workspace } = require('vscode');
const enigma = require('enigma.js');
const schema = require('enigma.js/schemas/12.170.2.json');

function isReachable(port, opts) {
  return new Promise(((resolve) => {
    const socket = new net.Socket();
    const onError = (e) => {
      socket.destroy();
      window.showErrorMessage(`Unable to connect to the Qlik Associative Engine: ${e}`);
      resolve(false);
    };
    socket.setTimeout(1000);
    socket.on('error', onError);
    socket.on('timeout', onError);
    socket.connect(port, opts.host, () => {
      socket.end();
      resolve(true);
    });
  }));
}

const getConfig = () => {
  const conf = workspace.getConfiguration('engine');
  return {
    host: conf.get('host'),
    port: conf.get('port'),
  };
};

const createSession = async (append = '') => {
  const config = getConfig();
  const alive = await isReachable(config.port, { host: config.host });
  if (alive === true) {
    const session = enigma.create({
      schema,
      url: `ws://${config.host}:${config.port}/app/engineData/${append}`,
      createSocket: url => new WebSocket(url),
    });

    const qix = await session.open();
    return { qix, session };
  }

  return undefined;
};

exports.checkScriptSyntax = async function checkScriptSyntax(script) {
  const { qix, session } = await createSession();

  if (qix) {
    const app = await qix.createSessionApp();
    await app.setScript(script);
    const errors = await app.checkScriptSyntax();
    session.close();
    return errors;
  }
  return [];
};

exports.reloadScriptSessionApp = async function reloadScriptSessionApp(script) {
  const append = `/identity/${+new Date()}/ttl/60`; // rename to keepalive???

  const { qix, session } = await createSession(append);

  if (qix) {
    const app = await qix.createSessionApp();
    await app.setScript(script);
    const result = await app.doReload();

    if (!result) {
      window.showErrorMessage('Failed to reload app');
    }
    session.close();
    return session.config.url;
  }

  return '';
};

exports.getEngineVersion = async function getEngineVersion() {
  const { qix, session } = await createSession();

  if (qix) {
    const result = await qix.engineVersion();
    session.close();
    return result.qComponentVersion;
  }

  return '';
};

exports.getScript = async function getScript(appName) {
  const { qix, session } = await createSession();

  if (qix) {
    const app = await qix.openDoc(appName);
    const script = await app.getScript();
    session.close();
    return script;
  }
  return null;
};

exports.getDocList = async function getScript() {
  const { qix, session } = await createSession();

  if (qix) {
    const docs = await qix.getDocList();
    session.close();
    return docs;
  }
  return null;
};

exports.createApp = async function getScript(appName) {
  const { qix, session } = await createSession();

  if (qix) {
    const app = await qix.createApp(appName);
    session.close();
    return app;
  }
  return null;
};

exports.getConfig = getConfig;
