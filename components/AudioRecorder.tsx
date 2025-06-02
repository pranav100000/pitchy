import { useState, useRef } from 'react';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export default function AudioRecorder({ onTranscription, disabled = false }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'hold' | 'click'>('hold');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    if (disabled || isProcessing) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Check for supported MIME types (Safari requires specific formats)
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
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
      alert('Could not access microphone. Please check permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      
      // Use appropriate file extension based on MIME type
      let filename = 'recording.webm';
      if (audioBlob.type.includes('mp4')) {
        filename = 'recording.mp4';
      } else if (audioBlob.type.includes('wav')) {
        filename = 'recording.wav';
      }
      
      formData.append('audio', audioBlob, filename);
      
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
    
    if (recordingMode === 'click') {
      if (isRecording) return '🔴 Click to Stop';
      return '🎤 Click to Talk';
    } else {
      if (isRecording) return '🔴 Release to Send';
      return '🎤 Hold to Talk';
    }
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
      {/* Recording Mode Selector */}
      <div className="flex bg-gray-100 rounded-lg p-1 text-sm">
        <button
          onClick={() => setRecordingMode('hold')}
          className={`px-3 py-1 rounded-md transition-colors ${
            recordingMode === 'hold'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Hold to Talk
        </button>
        <button
          onClick={() => setRecordingMode('click')}
          className={`px-3 py-1 rounded-md transition-colors ${
            recordingMode === 'click'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Click to Talk
        </button>
      </div>

      <button
        {...(recordingMode === 'hold' ? {
          onMouseDown: startRecording,
          onMouseUp: stopRecording,
          onMouseLeave: stopRecording,
          onTouchStart: (e) => {
            e.preventDefault();
            startRecording();
          },
          onTouchEnd: (e) => {
            e.preventDefault();
            stopRecording();
          },
          onTouchCancel: (e) => {
            e.preventDefault();
            stopRecording();
          }
        } : {
          onClick: toggleRecording,
        })}
        disabled={disabled || isProcessing}
        className={`
          px-8 py-6 text-lg font-semibold text-white rounded-full 
          transition-all duration-200 shadow-lg hover:shadow-xl
          active:scale-95 select-none touch-manipulation
          min-h-[4rem] min-w-[12rem]
          ${getButtonStyle()}
        `}
        style={{ touchAction: 'manipulation' }}
      >
        {getButtonText()}
      </button>
      
      {isRecording && (
        <div className="flex items-center space-x-2 text-red-600 animate-pulse">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm font-medium">
            {recordingMode === 'click' ? 'Recording... (Click button to stop)' : 'Recording...'}
          </span>
        </div>
      )}
      
      {isProcessing && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <span className="text-sm font-medium">Processing your speech...</span>
        </div>
      )}
      
      <p className="text-sm text-gray-600 text-center max-w-sm">
        {recordingMode === 'hold' 
          ? 'Hold the button and speak clearly. Release when finished.'
          : 'Click to start recording, speak clearly, then click again to stop.'
        }
      </p>
    </div>
  );
}