import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  const memoryInfo = {
    process: {
      rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100, // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100, // MB
      arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024 * 100) / 100, // MB
    },
    system: {
      total: Math.round(totalMem / 1024 / 1024 * 100) / 100, // MB
      used: Math.round(usedMem / 1024 / 1024 * 100) / 100, // MB
      free: Math.round(freeMem / 1024 / 1024 * 100) / 100, // MB
      usagePercentage: Math.round((usedMem / totalMem) * 100 * 100) / 100, // %
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(memoryInfo);
}





