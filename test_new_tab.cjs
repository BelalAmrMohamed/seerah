async function testNewTab() {
  // Create a new tab
  const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000/', { method: 'PUT' });
  const tab = await newTabRes.json();
  console.log('Created tab:', tab.id);

  // Wait 1.5 seconds for initial render
  await new Promise(r => setTimeout(r, 1500));

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  function evaluate(expr) {
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
    const res = await evaluate(`(() => {
      const actions = document.querySelector('header > div > div:last-child');
      return {
        width: window.innerWidth,
        buttons: Array.from(actions.children).map(c => ({
          tag: c.tagName,
          className: c.className,
          display: getComputedStyle(c).display,
          text: c.textContent.trim(),
          ariaLabel: c.getAttribute('aria-label') || c.querySelector('[aria-label]')?.getAttribute('aria-label')
        }))
      };
    })()`);
    console.log('New tab initial load result:', JSON.stringify(res, null, 2));
    ws.close();
    // Close tab after test
    await fetch('http://127.0.0.1:9222/json/close/' + tab.id);
  };
}

testNewTab();
