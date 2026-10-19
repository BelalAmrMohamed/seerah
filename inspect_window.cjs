async function run() {
  const v = await fetch('http://127.0.0.1:9222/json/version').then(r=>r.json());
  const ws = new WebSocket(v.webSocketDebuggerUrl);

  function send(method, params = {}) {
    return new Promise((resolve) => {
      let id = Math.floor(Math.random() * 100000);
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onopen = async () => {
    const targets = await send('Target.getTargets');
    const pageTarget = targets.targetInfos.find(t => t.type === 'page' && t.url.includes('localhost'));
    console.log('Page target:', pageTarget);
    if (pageTarget) {
      const windowInfo = await send('Browser.getWindowForTarget', { targetId: pageTarget.targetId });
      console.log('Window info:', windowInfo);
    }
    ws.close();
  };
}

run();
