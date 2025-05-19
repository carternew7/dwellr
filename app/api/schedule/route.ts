// /app/api/schedule/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUSINESS_HOURS = {
  weekday: { start: 9, end: 18 },
  saturday: { start: 9, end: 17 },
};

function getBusinessHoursForDate(date: Date) {
  const day = date.getDay();
  return day === 6 ? BUSINESS_HOURS.saturday : BUSINESS_HOURS.weekday;
}

export async function POST(req: NextRequest) {
  try {
    const { title, description } = await req.json();

    const now = new Date();
    const hours = getBusinessHoursForDate(now);
    now.setMinutes(0, 0, 0);

    // Step forward in 30-min intervals until free slot is found
    let attempt = 0;
    let found = false;
    let proposedTime = new Date(now);

    while (!found && attempt < 48) {
      const hour = proposedTime.getHours();
      if (hour >= hours.start && hour < hours.end) {
        const { data: events, error } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('event_time', proposedTime.toISOString());

        if (!events || events.length === 0) {
          found = true;
          break;
        }
      }
      proposedTime.setMinutes(proposedTime.getMinutes() + 30);
      attempt++;
    }

    if (!found) {
      return NextResponse.json({ error: 'No available slots found' }, { status: 409 });
    }

    const { data, error } = await supabase.from('calendar_events').insert({
      title,
      description,
      event_time: proposedTime.toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ scheduled: proposedTime.toISOString() });
  } catch (err) {
    console.error('Scheduling error:', err);
    return NextResponse.json({ error: 'Scheduling failed' }, { status: 500 });
  }
}
