import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { PitchLength, PitchSession } from '../lib/types';

interface PitchRecorderProps {
  pitchLength: PitchLength;
  onPitchComplete: (session: PitchSession) => void;
  onCancel: () => void;
}

export default function PitchRecorder({ pitchLength, onPitchComplete, onCancel }: PitchRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(pitchLength.duration);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [pitchSession, setPitchSession] = useState<PitchSession | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      // Try to use a more compatible format for mobile
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        options.mimeType = 'audio/wav';
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    
    try {
      const formData = new FormData();
      const filename = audioBlob.type.includes('webm') ? 'pitch.webm' : 
                      audioBlob.type.includes('mp4') ? 'pitch.mp4' : 'pitch.wav';
      formData.append('audio', audioBlob, filename);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.text) {
        setTranscript(result.text);
        const actualDuration = pitchLength.duration - timeRemaining;
        const session: PitchSession = {
          pitchLength,
          transcript: result.text,
          duration: actualDuration,
          timestamp: Date.now()
        };
        
        setPitchSession(session);
      } else {
        throw new Error(result.error || 'Transcription failed');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleProceedToFeedback = () => {
    if (pitchSession) {
      onPitchComplete(pitchSession);
    }
  };

  const handleRecordAgain = () => {
    setAudioBlob(null);
    setTranscript('');
    setPitchSession(null);
    setTimeRemaining(pitchLength.duration);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return ((pitchLength.duration - timeRemaining) / pitchLength.duration) * 100;
  };

  return (
    <Card className="max-w-2xl mx-auto p-8">
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {pitchLength.name}
          </h2>
          <p className="text-gray-600">{pitchLength.description}</p>
        </div>

        {/* Timer Display */}
        <div className="space-y-4">
          <div className="text-6xl font-mono font-bold text-blue-600">
            {formatTime(timeRemaining)}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            <span className="font-semibold">Recording...</span>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {!isRecording && !audioBlob && (
            <>
              <Button onClick={startRecording} size="lg" className="px-8">
                Start Pitch
              </Button>
              <Button onClick={onCancel} variant="outline" size="lg">
                Cancel
              </Button>
            </>
          )}

          {isRecording && (
            <Button onClick={stopRecording} variant="destructive" size="lg" className="px-8">
              Stop Recording
            </Button>
          )}

          {audioBlob && !isTranscribing && !transcript && (
            <>
              <Button onClick={handleSubmit} size="lg" className="px-8">
                Get Transcript
              </Button>
              <Button 
                onClick={handleRecordAgain} 
                variant="outline" 
                size="lg"
              >
                Record Again
              </Button>
            </>
          )}

          {transcript && (
            <>
              <Button onClick={handleProceedToFeedback} size="lg" className="px-8">
                Get Feedback
              </Button>
              <Button 
                onClick={handleRecordAgain} 
                variant="outline" 
                size="lg"
              >
                Record Again
              </Button>
            </>
          )}

          {isTranscribing && (
            <Button disabled size="lg" className="px-8">
              Processing...
            </Button>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Your Pitch Transcript:</h3>
            <div className="bg-white p-4 rounded-lg border-2 border-blue-200 shadow-sm">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{transcript}</p>
            </div>
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p className="font-semibold">Review your transcript above</p>
              <p>Make sure it accurately captured what you said. If not, you can record again. If it looks good, proceed to get your detailed feedback!</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!transcript && (
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Pitch Instructions:</p>
            <p>Deliver your best sales pitch for any product or service you choose.</p>
            <p className="mt-2">
              You have {formatTime(pitchLength.duration)} to deliver your pitch. 
              The timer will automatically stop when time runs out.
            </p>
            <p className="mt-2 text-xs">
              Your pitch will be evaluated objectively on clarity, persuasiveness, structure, timing, and overall impact.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}