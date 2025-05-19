'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import LeadFileUpload from '../../components/LeadFileUpload';



const statusColor = {
  'Fresh': 'bg-blue-100 text-blue-800',
  'In the Works': 'bg-yellow-100 text-yellow-800',
  'Hot': 'bg-red-100 text-red-800',
  'Commitment': 'bg-orange-100 text-orange-800',
  'Sale Paperwork': 'bg-purple-100 text-purple-800',
  'Delivered': 'bg-teal-100 text-teal-800',
  'Closed & Booked': 'bg-green-100 text-green-800',
};

const progressStages = [
  'Fresh',
  'In the Works',
  'Hot',
  'Commitment',
  'Sale Paperwork',
  'Delivered',
  'Closed & Booked',
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filterUserId, setFilterUserId] = useState<string>('all');
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      const { data: usersData } = await supabase.from('users').select('id, full_name');
      if (leadsData) setLeads(leadsData);
      if (usersData) setUsers(usersData);
    };
    fetchData();
  }, []);

  const assignLead = async (leadId: string, userId: string) => {
    await supabase.from('leads').update({ assigned_to: userId }).eq('id', leadId);
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, assigned_to: userId } : l)));
  };

  const handleNoteChange = (leadId: string, value: string) => {
    setNotes((prev) => ({ ...prev, [leadId]: value }));
  };

  const submitNote = async (leadId: string) => {
    const text = notes[leadId];
    if (!text) return;
    await supabase.from('lead_notes').insert({ lead_id: leadId, note: text });
    setNotes((prev) => ({ ...prev, [leadId]: '' }));
  };

  const filteredLeads = filterUserId === 'all' ? leads : leads.filter((l) => l.assigned_to === filterUserId);

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">📋 Lead Dashboard</h1>

      <div className="mb-4">
        <label className="text-sm font-medium mr-2">Filter by Rep:</label>
        <select
          className="px-2 py-1 border rounded text-sm"
          value={filterUserId}
          onChange={(e) => setFilterUserId(e.target.value)}
        >
          <option value="all">All</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.full_name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white p-4 rounded shadow flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{lead.name || 'Unnamed Lead'}</h2>
              <span className={`text-xs px-2 py-1 rounded ${statusColor[lead.status as keyof typeof statusColor] || 'bg-gray-100 text-gray-800'}`}>
                {lead.status || 'Fresh'}
              </span>
            </div>
            <p className="text-sm text-gray-600">{lead.email} • {lead.phone}</p>
            <p className="text-xs text-gray-500">{new Date(lead.created_at).toLocaleString()}</p>

            <div className="mt-2">
              <label className="text-xs font-medium">Assigned Rep:</label>
              <select
                className="ml-2 text-sm border px-2 py-1 rounded"
                value={lead.assigned_to || ''}
                onChange={(e) => assignLead(lead.id, e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </select>
            </div>

            {typeof lead.progress_index === 'number' && (
              <div className="w-full bg-gray-200 rounded h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${(lead.progress_index / (progressStages.length - 1)) * 100}%` }}
                ></div>
              </div>
            )}

            <div className="mt-3">
              <textarea
                placeholder="Add a note..."
                value={notes[lead.id] || ''}
                onChange={(e) => handleNoteChange(lead.id, e.target.value)}
                className="w-full text-sm border rounded px-2 py-1"
              />
              <button
                onClick={() => submitNote(lead.id)}
                className="mt-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Save Note
              </button>
            </div>

            <LeadFileUpload leadId={lead.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
