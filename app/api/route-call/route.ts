// /app/api/route-call/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { from_number } = await req.json();
    if (!from_number) return NextResponse.json({ error: 'Missing number' }, { status: 400 });

    // Find lead by phone number
    const { data: leads, error: leadError } = await supabase
      .from('leads')
      .select('id, assigned_to')
      .eq('phone', from_number)
      .limit(1);

    if (leadError || !leads?.length || !leads[0].assigned_to) {
      return NextResponse.json({ forward_to: null }); // No match or unassigned
    }

    const assignedRepId = leads[0].assigned_to;
    const { data: rep, error: userError } = await supabase
      .from('users')
      .select('phone')
      .eq('id', assignedRepId)
      .single();

    if (userError || !rep?.phone) {
      return NextResponse.json({ forward_to: null });
    }

    return NextResponse.json({ forward_to: rep.phone });
  } catch (e) {
    return NextResponse.json({ error: 'Routing failed' }, { status: 500 });
  }
}
