const fs = require('fs');

async function test() {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  fs.writeFileSync('scratch_html.html', html);
  console.log('HTML saved. Length:', html.length);
  // Check if "اسأل" or "hidden sm:inline-flex" is in HTML
  console.log('Has اسأل?', html.includes('اسأل'));
  console.log('Has hidden sm:inline-flex?', html.includes('hidden sm:inline-flex'));
}

test();
