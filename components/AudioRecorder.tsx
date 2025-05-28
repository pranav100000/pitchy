import { useState, useRef } from 'react';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export default function AudioRecorder({ onTranscription, disabled = false }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    if (disabled || isProcessing) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        chunksRef.current = [];
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        if (audioBlob.size > 0) {
          setIsProcessing(true);
          await sendAudioForTranscription(audioBlob);
          setIsProcessing(false);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.text) {
        onTranscription(data.text);
      } else {
        console.error('Transcription failed:', data.error);
        alert('Failed to transcribe audio. Please try again.');
      }
    } catch (error) {
      console.error('Error sending audio for transcription:', error);
      alert('Error processing audio. Please try again.');
    }
  };

  const getButtonText = () => {
    if (isProcessing) return '🔄 Processing...';
    if (isRecording) return '🔴 Release to Send';
    return '🎤 Hold to Talk';
  };

  const getButtonStyle = () => {
    if (disabled || isProcessing) {
      return 'bg-gray-400 cursor-not-allowed';
    }
    if (isRecording) {
      return 'bg-red-500 hover:bg-red-600';
    }
    return 'bg-blue-500 hover:bg-blue-600';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording} // Handle case where mouse leaves button while holding
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        disabled={disabled || isProcessing}
        className={`
          px-8 py-4 text-lg font-semibold text-white rounded-full 
          transition-all duration-200 shadow-lg hover:shadow-xl
          active:scale-95 select-none
          ${getButtonStyle()}
        `}
      >
        {getButtonText()}
      </button>
      
      {isRecording && (
        <div className="flex items-center space-x-2 text-red-600 animate-pulse">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm font-medium">Recording...</span>
        </div>
      )}
      
      {isProcessing && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <span className="text-sm font-medium">Processing your speech...</span>
        </div>
      )}
      
      <p className="text-sm text-gray-600 text-center max-w-sm">
        Hold the button and speak clearly. Release when finished.
      </p>
    </div>
  );
}