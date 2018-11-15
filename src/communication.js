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
    headers: conf.get('headers'),
    secure: conf.get('secure'),
  };
};

const checkProgress = async (qix, requestId) => {
  const InteractDef = {
    Type: 0,
    Title: '',
    Msg: '',
    Buttons: 0,
    Line: '',
    OldLineNr: 0,
    NewLineNr: 0,
    Path: '',
    Hidden: false,
    Result: 0,
    Input: '',
  };

  let progress = await qix.getProgress(requestId);

  while (!progress.qFinished) {
    progress = await qix.getProgress(requestId);

    if (progress.qUserInteractionWanted) {
      qix.interactDone(requestId, InteractDef);
    }
  }
  return true;
};

const createSession = async (append = '') => {
  const config = getConfig();
  const alive = await isReachable(config.port, { host: config.host });
  if (alive === true) {
    const session = enigma.create({
      schema,
      url: `${config.secure ? 'wss' : 'ws'}://${config.host}:${config.port}/app/engineData/${append}`,
      createSocket: url => new WebSocket(url),
      headers: config.headers,
    });

    // bind traffic events to log what is sent and received on the socket:
    // session.on('traffic:sent', data => console.log('sent:', data));
    // session.on('traffic:received', data => console.log('received:', data));

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
  const append = `identity/${+new Date()}/ttl/60`; // rename to keepalive???
  const conf = workspace.getConfiguration('engine');
  const limit = conf.get('reloadLimit');
  const { qix, session } = await createSession(append);

  let result;

  if (qix) {
    const app = await qix.createSessionApp();
    await app.setScript(script);

    if (!limit) {
      result = await app.doReload();
    } else {
      await app.setFetchLimit(limit);
      const request = app.doReload({ qDebug: true });
      await qix.getInteract(request.requestId);

      result = await checkProgress(qix, request.requestId);
    }

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

exports.update = async function update(appName, script) {
  const { qix, session } = await createSession();
  try {
    const app = await qix.openDoc(appName);
    await app.setScript(script);
    const reloadResult = await app.doReload();
    if (reloadResult) {
      await app.doSave();
    } else {
      throw new Error('Reload failed');
    }
    session.close();
  } catch (err) {
    session.close();
    throw err;
  }
};

exports.getConfig = getConfig;
