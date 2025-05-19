// /app/calendar/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // ✅ FIXED


export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_time', { ascending: true });

      if (!error && data) setEvents(data);
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10 bg-white">
      <h1 className="text-2xl font-bold mb-6">📆 Calendar</h1>

      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-gray-500">No events scheduled yet.</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-gray-100 rounded-md p-4 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-800">{event.title}</h2>
              <p className="text-sm text-gray-600">{event.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(event.event_time).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
