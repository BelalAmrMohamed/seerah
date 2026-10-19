const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/515CACA8155C232258CF14FBA69FA49B');

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

ws.onopen = async () => {
  const res = await evaluate(ws, `(async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) await r.unregister();
    const keys = await caches.keys();
    for (const k of keys) await caches.delete(k);
    return { unregistered: regs.length, deletedCaches: keys };
  })()`);
  console.log('Cleared:', res);
  ws.close();
};
