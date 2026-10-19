const ws1 = new WebSocket('ws://127.0.0.1:9222/devtools/page/515CACA8155C232258CF14FBA69FA49B');

function evaluate(ws, expr) {
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
    ws.send(JSON.stringify({
      id,
      method: 'Runtime.evaluate',
      params: { expression: expr, returnByValue: true, awaitPromise: true }
    }));
  });
}

ws1.onopen = async () => {
  const keys = await evaluate(ws1, `(async () => {
    const cacheNames = await caches.keys();
    const result = {};
    for (const name of cacheNames) {
      const c = await caches.open(name);
      const reqs = await c.keys();
      result[name] = reqs.map(r => r.url);
    }
    return result;
  })()`);
  console.log('Caches:', JSON.stringify(keys, null, 2));
  ws1.close();
};
