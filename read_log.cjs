const fs = require('fs');
const content = fs.readFileSync('C:/Users/Belal Amr/.gemini/antigravity-ide/brain/6f910abb-c3ad-484a-847d-96e5977c2848/.system_generated/logs/transcript_full.jsonl', 'utf8');
const lines = content.split('\n');
for (const line of lines) {
  if (line.includes('"step_index":46')) {
    const o = JSON.parse(line);
    const steps = o.content.match(/### Step \d+:[^\n]+/g);
    console.log(steps);
  }
}
