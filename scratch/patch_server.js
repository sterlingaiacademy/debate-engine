const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf8');

const queueCode = `
// Simple async queue for python executions to prevent process flooding under high load
class ExecutionQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  async enqueue(fn) {
    if (this.running >= this.concurrency) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    this.running++;
    try { return await fn(); } 
    finally {
      this.running--;
      if (this.queue.length > 0) this.queue.shift()();
    }
  }
}
const pythonQueue = new ExecutionQueue(20); // Max 20 concurrent python processes
`;

if (!code.includes('ExecutionQueue')) {
  code = code.replace('const app = express();', queueCode + '\nconst app = express();');
}

const execTarget = 'exec(`python3 "${scriptPath}" "${filename}" "${sId}" "${sName}" "${sClass}" "${sTopic}"`, { maxBuffer: 1024 * 1024 * 10 }, async (error, stdout, stderr) => {';

const execReplacement = `pythonQueue.enqueue(() => {
      return new Promise((resolveQueue) => {
        exec(\`python3 "\${scriptPath}" "\${filename}" "\${sId}" "\${sName}" "\${sClass}" "\${sTopic}"\`, { maxBuffer: 1024 * 1024 * 10 }, async (error, stdout, stderr) => {
          resolveQueue(); // Free up the queue slot immediately after python finishes
          // The rest of the DB processing happens asynchronously outside the process limit lock`;

if (code.includes(execTarget)) {
  code = code.replace(execTarget, execReplacement);
  // Fix the closing brackets
  code = code.replace('res.json(result);\n      }\n    });', 'res.json(result);\n      }\n    });\n    });');
}

fs.writeFileSync('backend/server.js', code);
console.log('Patched server.js with ExecutionQueue');
