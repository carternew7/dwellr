// /app/api/call/route.ts

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!;

export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json();

    if (!to) {
      return NextResponse.json({ error: 'Missing destination number' }, { status: 400 });
    }

    const call = await client.calls.create({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/twiml`,
      to,
      from: TWILIO_PHONE_NUMBER,
      record: true,
    });

    return NextResponse.json({ sid: call.sid });
  } catch (err) {
    console.error('Twilio call error:', err);
    return NextResponse.json({ error: 'Call failed' }, { status: 500 });
  }
}
