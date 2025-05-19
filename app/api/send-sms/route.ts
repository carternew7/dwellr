// /app/api/send-sms/route.ts

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!;

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json();

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing recipient or message' }, { status: 400 });
    }

    const result = await client.messages.create({
      to,
      from: TWILIO_PHONE_NUMBER,
      body: message,
    });

    return NextResponse.json({ sid: result.sid });
  } catch (err) {
    console.error('SMS send error:', err);
    return NextResponse.json({ error: 'SMS failed to send' }, { status: 500 });
  }
}
