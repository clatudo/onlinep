import { NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/email-queue';

// Este endpoint pode ser chamado por um Cron Job ou pelo DashboardAdmin periodicamente
export async function GET() {
  try {
    const result = await processEmailQueue();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// Também permitimos POST para disparos manuais
export async function POST() {
  return GET();
}
