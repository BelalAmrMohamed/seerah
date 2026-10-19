const fs = require('fs');
const ws1 = new WebSocket('ws://127.0.0.1:9222/devtools/page/8BE829FD9D75B89CA2C9D335498D65DA');

function send(ws, method, params = {}) {
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

ws1.onopen = async () => {
  const res = await send(ws1, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tab1_screenshot.png', Buffer.from(res.data, 'base64'));
  console.log('Saved tab1_screenshot.png');
  ws1.close();
};
