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
    const filename = audioFile.originalFilename || 'audio.webm';
    const mimeType = audioFile.mimetype || 'audio/webm';
    
    console.log('Transcribing audio file:', { 
      filename, 
      mimeType, 
      size: fileBuffer.length,
      userAgent: req.headers['user-agent'] 
    });
    
    const file = new File([fileBuffer], filename, {
      type: mimeType
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
    
    // More detailed error message
    let errorMessage = 'Internal server error during transcription';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}