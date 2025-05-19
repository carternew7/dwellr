'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  leadId: string;
};

export default function LeadFileUpload({ leadId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const filePath = `${leadId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('lead-files')
      .upload(filePath, file);

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicURL } = supabase.storage
      .from('lead-files')
      .getPublicUrl(filePath);

    await supabase.from('uploads').insert({
      lead_id: leadId,
      filename: file.name,
      category: 'uncategorized',
      url: publicURL.publicUrl,
    });

    alert('✅ File uploaded!');
    setFile(null);
    setUploading(false);
  };

  return (
    <div className="mt-4 border-t pt-2">
      <label className="text-xs font-medium block mb-1">Upload File:</label>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-sm"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
