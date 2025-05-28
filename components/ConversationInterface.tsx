import { useState, useEffect, useRef } from 'react';
import AudioRecorder from './AudioRecorder';
import { Persona, Scenario, ConversationExchange } from '../lib/types';
import { buildConversationPrompt } from '../lib/scenarios';

interface ConversationInterfaceProps {
  persona: Persona;
  scenario: Scenario;
  conversationHistory: ConversationExchange[];
  setConversationHistory: (history: ConversationExchange[]) => void;
  onEndSession: () => void;
}

export default function ConversationInterface({
  persona,
  scenario,
  conversationHistory,
  setConversationHistory,
  onEndSession
}: ConversationInterfaceProps) {
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [voiceQuality, setVoiceQuality] = useState<'browser' | 'premium'>('browser');
  const conversationRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  // Start conversation with AI's opening message
  useEffect(() => {
    if (conversationHistory.length === 0) {
      generateInitialAIMessage();
    }
  }, []);

  const generateInitialAIMessage = async () => {
    setIsProcessingResponse(true);
    
    try {
      const messages = buildConversationPrompt(persona, scenario, [], '');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      
      if (!response.ok) throw new Error('Failed to get AI response');
      
      const data = await response.json();
      
      if (data.success) {
        const newExchange: ConversationExchange = {
          user: '',
          assistant: data.response,
          timestamp: Date.now()
        };
        
        setConversationHistory([newExchange]);
        speakText(data.response);
      }
    } catch (error) {
      console.error('Error generating initial AI message:', error);
    } finally {
      setIsProcessingResponse(false);
    }
  };

  const handleUserTranscription = async (userMessage: string) => {
    if (!userMessage.trim()) return;
    
    setIsProcessingResponse(true);
    
    try {
      // Build conversation prompt with current history
      const messages = buildConversationPrompt(persona, scenario, conversationHistory, userMessage);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      
      if (!response.ok) throw new Error('Failed to get AI response');
      
      const data = await response.json();
      
      if (data.success) {
        const newExchange: ConversationExchange = {
          user: userMessage,
          assistant: data.response,
          timestamp: Date.now()
        };
        
        setConversationHistory([...conversationHistory, newExchange]);
        speakText(data.response);
      } else {
        throw new Error(data.error || 'AI response failed');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      alert('Failed to get AI response. Please try again.');
    } finally {
      setIsProcessingResponse(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      // Wait for voices to load
      const speak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get available voices
        const voices = speechSynthesis.getVoices();
        
        // Find best quality voice based on persona
        let selectedVoice = null;
        
        // Look for high-quality voices first
        const preferredVoices = [
          'Microsoft David - English (United States)',
          'Microsoft Zira - English (United States)', 
          'Google US English',
          'Alex',
          'Samantha',
          'Daniel',
          'Karen',
          'Moira',
          'Tessa'
        ];
        
        // Find first available preferred voice
        for (const preferred of preferredVoices) {
          selectedVoice = voices.find(voice => voice.name.includes(preferred.split(' - ')[0]));
          if (selectedVoice) break;
        }
        
        // Fallback to any English voice
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.localService
          ) || voices.find(voice => voice.lang.startsWith('en'));
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        // Optimize voice properties for persona
        if (persona.id === 'skeptical_steve') {
          utterance.rate = 0.85;
          utterance.pitch = 0.9;
        } else if (persona.id === 'busy_betty') {
          utterance.rate = 1.1;
          utterance.pitch = 1.1;
        } else if (persona.id === 'technical_tom') {
          utterance.rate = 0.95;
          utterance.pitch = 0.95;
        }
        
        utterance.volume = 0.9;
        
        utterance.onstart = () => setIsAISpeaking(true);
        utterance.onend = () => setIsAISpeaking(false);
        utterance.onerror = (error) => {
          console.error('Speech synthesis error:', error);
          setIsAISpeaking(false);
        };
        
        speechSynthesis.speak(utterance);
      };
      
      // Ensure voices are loaded
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
      } else {
        speak();
      }
    }
  };

  const stopAISpeech = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsAISpeaking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Practicing with: {persona.avatar} {persona.name}
        </h2>
        <p className="text-gray-600">
          Scenario: {scenario.icon} {scenario.name}
        </p>
      </div>

      {/* Conversation Display */}
      <div 
        ref={conversationRef}
        className="flex-1 bg-white rounded-lg border border-gray-200 p-6 overflow-y-auto mb-6"
      >
        {conversationHistory.length === 0 && isProcessingResponse && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>{persona.name} is getting ready...</p>
            </div>
          </div>
        )}

        {conversationHistory.map((exchange, index) => (
          <div key={index} className="space-y-4 mb-6">
            {exchange.assistant && (
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{persona.avatar}</div>
                <div className="bg-gray-100 rounded-lg p-4 max-w-3xl">
                  <div className="font-semibold text-gray-900 mb-1">
                    {persona.name}
                  </div>
                  <div className="text-gray-800">{exchange.assistant}</div>
                </div>
              </div>
            )}
            
            {exchange.user && (
              <div className="flex items-start space-x-3 justify-end">
                <div className="bg-blue-500 text-white rounded-lg p-4 max-w-3xl">
                  <div className="font-semibold mb-1">You</div>
                  <div>{exchange.user}</div>
                </div>
                <div className="text-2xl">👤</div>
              </div>
            )}
          </div>
        ))}

        {isProcessingResponse && conversationHistory.length > 0 && (
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{persona.avatar}</div>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Speaking Indicator */}
      {isAISpeaking && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-700 font-medium">
              {persona.name} is speaking...
            </span>
            <button
              onClick={stopAISpeech}
              className="ml-4 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Audio Controls */}
      <div className="text-center space-y-4">
        <AudioRecorder 
          onTranscription={handleUserTranscription}
          disabled={isProcessingResponse || isAISpeaking}
        />
        
        <button
          onClick={onEndSession}
          className="px-6 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          End Session
        </button>
      </div>
    </div>
  );
}