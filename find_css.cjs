const fs = require('fs');
const html = fs.readFileSync('scratch_html.html', 'utf8');
const links = [];
const regex = /href="([^"]+\.css[^"]*)"/g;
let m;
while ((m = regex.exec(html)) !== null) {
  links.push(m[1]);
}
console.log('Linked CSS files in HTML:');
console.log(links);
