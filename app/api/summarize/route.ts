// /app/api/summarize/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();
    if (!transcript) {
      return NextResponse.json({ error: 'Missing transcript' }, { status: 400 });
    }

    const prompt = `You are an emotionally intelligent AI sales assistant helping a manufactured home sales team.

Your job is to:
- Summarize the call in 2–3 lines.
- Extract key highlights related to setup, delivery, finishes, pricing, location, and concerns.
- Detect the emotional tone of the customer (excited, hesitant, confused, frustrated, etc).
- Assign a lead status: Fresh, In the Works, Hot, Commitment, Sale Paperwork, Delivered, Closed & Booked.
- Recommend the best next step (e.g. phone call, text, handwritten letter, meeting).
- Explain WHY that follow-up step is best and HOW to approach it (with empathy, urgency, etc).
- Suggest coaching tips for the sales rep based on what the customer needs (urgency, clarity, empathy).
- Include regional alerts: If the state is Ohio, remind that porches are required on all exits to pass inspection.

Return this in JSON format:
{
  summary: string,
  highlights: string[],
  lead_status: string,
  progress_index: number,
  suggested_follow_up_type: string,
  follow_up_reason: string,
  coaching_tip: string,
  region_alerts: string[]
}

Transcript:
${transcript}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful CRM assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
    });

    const content = response.choices[0].message?.content;
    const parsed = JSON.parse(content || '{}');

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Smart summarize error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
