import { NextApiRequest, NextApiResponse } from 'next';
import { transcribeAudio } from '../../lib/openai';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle file uploads
  },
};

interface TranscribeApiResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TranscribeApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set in environment variables');
    return res.status(500).json({ 
      success: false, 
      error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.' 
    });
  }

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      allowEmptyFiles: false,
    });

    const [fields, files] = await form.parse(req);
    
    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    
    if (!audioFile) {
      return res.status(400).json({ 
        success: false, 
        error: 'No audio file provided' 
      });
    }

    // Read the file and create a File object for OpenAI
    const fileBuffer = fs.readFileSync(audioFile.filepath);
    const file = new File([fileBuffer], audioFile.originalFilename || 'audio.wav', {
      type: audioFile.mimetype || 'audio/wav'
    });

    // Clean up the temporary file
    fs.unlinkSync(audioFile.filepath);

    // Transcribe using OpenAI Whisper
    const result = await transcribeAudio(file);

    if (result.success) {
      res.status(200).json({
        success: true,
        text: result.text
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Transcription failed'
      });
    }
  } catch (error) {
    console.error('Transcription API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during transcription'
    });
  }
}