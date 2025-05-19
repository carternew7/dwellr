// /app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const leadId = formData.get('leadId') as string;

  if (!file || !leadId) {
    return NextResponse.json({ error: 'Missing file or leadId' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(arrayBuffer);
  const fileExt = file.name.split('.').pop();
  const filePath = `uploads/${leadId}/${randomUUID()}.${fileExt}`;

  const uploadRes = await supabase.storage
    .from('lead-files')
    .upload(filePath, fileBytes, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadRes.error) {
    return NextResponse.json({ error: uploadRes.error.message }, { status: 500 });
  }

  // Ask OpenAI to categorize the file by name only (for now)
  const prompt = `Categorize this file name into a useful document type for a manufactured home sales CRM.

Example categories: Proof of Income, Signed Contract, Floor Plan, Delivery Schedule, Utility Permit, ID Verification

Filename: ${file.name}`;

  const tagRes = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a document tagging assistant.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  });

  const category = tagRes.choices[0].message?.content?.trim();

  const publicUrl = supabase.storage.from('lead-files').getPublicUrl(filePath).data.publicUrl;

  const { error } = await supabase.from('uploads').insert({
    lead_id: leadId,
    filename: file.name,
    category,
    url: publicUrl,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category, url: publicUrl });
}
