// /app/call/page.tsx

'use client';

import { useState } from 'react';
import axios from 'axios';

export default function CallPage() {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Idle');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');

  const handleStartCall = async () => {
    try {
      setStatus('Calling...');
      const callRes = await axios.post('/api/call', { to: phone });
      setStatus(`Call started. SID: ${callRes.data.sid}`);
    } catch (err) {
      setStatus('Call failed.');
      console.error(err);
    }
  };

  const handleTranscribeAndSummarize = async () => {
    setStatus('Transcribing...');
    try {
      const transcribeRes = await axios.post('/api/transcribe', {
        audioUrl: 'https://your-audio-url.com/recording.mp3',
      });
      setTranscript(transcribeRes.data.transcript.text);

      const summaryRes = await axios.post('/api/summarize', {
        transcript: transcribeRes.data.transcript.text,
      });
      setSummary(summaryRes.data.summary);
      setStatus('Summary complete.');
    } catch (err) {
      setStatus('Failed to process audio.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <h1 className="text-2xl font-bold mb-4">📞 Call Assistant</h1>

      <div className="mb-6">
        <input
          type="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border px-4 py-2 rounded mr-4"
        />
        <button
          onClick={handleStartCall}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Start Call
        </button>
      </div>

      <div className="mb-6">
        <button
          onClick={handleTranscribeAndSummarize}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Transcribe & Summarize
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-4">Status: {status}</div>

      {transcript && (
        <div className="mb-4">
          <h2 className="font-semibold">📝 Transcript</h2>
          <p className="text-gray-700 whitespace-pre-wrap text-sm">{transcript}</p>
        </div>
      )}

      {summary && (
        <div>
          <h2 className="font-semibold">🔍 AI Summary</h2>
          <p className="text-gray-800 whitespace-pre-wrap text-sm">{summary}</p>
        </div>
      )}
    </div>
  );
}
