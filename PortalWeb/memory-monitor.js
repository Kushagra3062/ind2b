// Memory monitoring script for Node.js applications
const os = require('os');

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getMemoryUsage() {
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  console.log('\n=== Memory Usage Report ===');
  console.log(`Process Memory:`);
  console.log(`  RSS (Resident Set Size): ${formatBytes(memUsage.rss)}`);
  console.log(`  Heap Used: ${formatBytes(memUsage.heapUsed)}`);
  console.log(`  Heap Total: ${formatBytes(memUsage.heapTotal)}`);
  console.log(`  External: ${formatBytes(memUsage.external)}`);
  console.log(`  Array Buffers: ${formatBytes(memUsage.arrayBuffers)}`);
  
  console.log(`\nSystem Memory:`);
  console.log(`  Total: ${formatBytes(totalMem)}`);
  console.log(`  Used: ${formatBytes(usedMem)} (${((usedMem / totalMem) * 100).toFixed(1)}%)`);
  console.log(`  Free: ${formatBytes(freeMem)}`);
  console.log('========================\n');
}

// Monitor memory every 5 seconds
setInterval(getMemoryUsage, 5000);

// Initial report
getMemoryUsage();

console.log('Memory monitoring started. Press Ctrl+C to stop.');





