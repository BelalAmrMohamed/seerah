const fs = require('fs');
const content = fs.readFileSync('C:/Users/Belal Amr/.gemini/antigravity-ide/brain/6f910abb-c3ad-484a-847d-96e5977c2848/.system_generated/logs/transcript_full.jsonl', 'utf8');
const lines = content.split('\n');
for (const line of lines) {
  if (line.includes('"step_index":46')) {
    const o = JSON.parse(line);
    // Find step 14 or step 7 (browser_get_dom)
    const domSteps = o.content.split('### Step ');
    for (const s of domSteps) {
      if (s.startsWith('14:')) {
        console.log('--- Step 14 Content ---');
        console.log(s.slice(0, 3000));
      }
    }
  }
}
