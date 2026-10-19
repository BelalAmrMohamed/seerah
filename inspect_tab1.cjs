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
      params: { expression: expr, returnByValue: true }
    }));
  });
}

ws1.onopen = async () => {
  console.log('Connected to tab 1');
  const res = await evaluate(ws1, `(() => {
    const header = document.querySelector('header');
    const actions = document.querySelector('header > div > div:last-child');
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      buttons: Array.from(actions.children).map(c => ({
        tag: c.tagName,
        className: c.className,
        display: getComputedStyle(c).display,
        text: c.textContent.trim(),
        ariaLabel: c.getAttribute('aria-label') || c.querySelector('[aria-label]')?.getAttribute('aria-label'),
        rect: c.getBoundingClientRect()
      }))
    };
  })()`);
  console.log('Tab 1 result:', JSON.stringify(res, null, 2));
  ws1.close();
};
