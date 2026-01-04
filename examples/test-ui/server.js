import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8080;

const server = createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    // Serve the HTML file
    const filePath = join(__dirname, 'index.html');
    const content = readFileSync(filePath, 'utf-8');

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  } else {
    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Test UI Server Running`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n   URL: http://localhost:${PORT}`);
  console.log(`\n📋 This test page includes:`);
  console.log(`   ✓ Simple form with validation`);
  console.log(`   ❌ Console errors (intentional)`);
  console.log(`   ❌ Accessibility violations (intentional)`);
  console.log(`\n💡 Test the UI verification workflow:`);
  console.log(`   1. Run: npx agentic15 visual-test http://localhost:${PORT}`);
  console.log(`   2. Check generated logs for:`);
  console.log(`      • console-errors.log (should find 2 errors)`);
  console.log(`      • accessibility.log (should find violations)`);
  console.log(`      • network-errors.log (should be empty)`);
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\nPress Ctrl+C to stop the server\n`);
});
