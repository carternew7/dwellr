// /components/LeadFileUpload.tsx

'use client';

import { useState } from 'react';
import axios from 'axios';

export default function LeadFileUpload({ leadId }: { leadId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('leadId', leadId);

    try {
      const res = await axios.post('/api/upload', formData);
      setStatus(`Uploaded as: ${res.data.category}`);
    } catch (err) {
      console.error(err);
      setStatus('Upload failed');
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="text-sm font-medium text-gray-700">📎 Upload a file for this lead</h3>
      <div className="flex items-center gap-2 mt-2">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500"
        />
        <button
          onClick={handleUpload}
          className="bg-green-600 text-white text-sm px-4 py-1 rounded hover:bg-green-700"
        >
          Upload
        </button>
      </div>
      {status && <p className="text-xs text-gray-500 mt-1">{status}</p>}
    </div>
  );
}