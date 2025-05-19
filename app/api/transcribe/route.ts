import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { audioUrl } = await req.json();
    if (!audioUrl) {
      return NextResponse.json({ error: 'Missing audio URL' }, { status: 400 });
    }

    const uploadRes = await axios({
      method: 'POST',
      url: 'https://api.assemblyai.com/v2/transcript',
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY!,
        'content-type': 'application/json',
      },
      data: {
        audio_url: audioUrl,
        auto_chapters: true,
        speaker_labels: true,
        entity_detection: true,
        sentiment_analysis: true,
        iab_categories: true,
        summarization: true,
        summary_model: 'informative',
        summary_type: 'bullets',
      },
    });

    const transcriptId = uploadRes.data.id;
    const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;

    let pollingRes: { data: any } = { data: {} };
    let tries = 0;

    while (tries < 30) {
      pollingRes = await axios.get(pollingEndpoint, {
        headers: {
          authorization: process.env.ASSEMBLYAI_API_KEY!,
        },
      });

      if (pollingRes.data.status === 'completed') break;
      if (pollingRes.data.status === 'error') {
        return NextResponse.json({ error: pollingRes.data.error }, { status: 500 });
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
      tries++;
    }

    if (pollingRes.data.status !== 'completed') {
      return NextResponse.json({ error: 'Transcription timed out' }, { status: 408 });
    }

    return NextResponse.json({ transcript: pollingRes.data });
  } catch (err) {
    console.error('Transcription error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
