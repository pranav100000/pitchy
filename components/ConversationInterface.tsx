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
  voiceQuality: 'browser' | 'premium';
}

export default function ConversationInterface({
  persona,
  scenario,
  conversationHistory,
  setConversationHistory,
  onEndSession,
  voiceQuality
}: ConversationInterfaceProps) {
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
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

  const speakText = async (text: string) => {
    if (voiceQuality === 'premium') {
      await speakWithPremiumTTS(text);
    } else {
      speakWithBrowserTTS(text);
    }
  };

  const speakWithPremiumTTS = async (text: string) => {
    try {
      setIsAISpeaking(true);
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          persona: persona.id 
        })
      });

      if (!response.ok) {
        throw new Error('TTS failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsAISpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.onerror = () => {
          setIsAISpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Premium TTS error:', error);
      setIsAISpeaking(false);
      // Fallback to browser TTS
      speakWithBrowserTTS(text);
    }
  };

  const speakWithBrowserTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      // Small delay to ensure cancellation is processed
      setTimeout(() => {
        const speak = () => {
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Get available voices
          const voices = speechSynthesis.getVoices();
          
          // Find best quality voice based on persona
          let selectedVoice = null;
          
          // Mobile-friendly voice preferences (iOS/Android compatible)
          const mobilePreferredVoices = [
            'Samantha', // iOS
            'Alex', // iOS/macOS
            'Karen', // iOS
            'Daniel', // iOS
            'Google US English', // Android
            'Google English', // Android
            'en-US', // Generic fallback
            'en-GB' // Generic fallback
          ];
          
          // Desktop voice preferences
          const desktopPreferredVoices = [
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
          
          // Check if mobile (basic detection)
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          const preferredVoices = isMobile ? mobilePreferredVoices : desktopPreferredVoices;
          
          // Find first available preferred voice
          for (const preferred of preferredVoices) {
            selectedVoice = voices.find(voice => 
              voice.name.includes(preferred.split(' - ')[0]) || 
              voice.lang.includes(preferred) ||
              voice.name.toLowerCase().includes(preferred.toLowerCase())
            );
            if (selectedVoice) break;
          }
          
          // Enhanced fallback for mobile
          if (!selectedVoice) {
            // Prefer local voices on mobile for better performance
            selectedVoice = voices.find(voice => 
              voice.lang.startsWith('en') && voice.localService
            );
            
            // If no local service, get any English voice
            if (!selectedVoice) {
              selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
            }
          }
          
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
          
          // Mobile-optimized voice properties
          const baseRate = isMobile ? 0.9 : 1.0; // Slightly slower on mobile
          const basePitch = isMobile ? 1.0 : 1.0;
          
          // Optimize voice properties for persona
          if (persona.id === 'skeptical_steve') {
            utterance.rate = baseRate * 0.85;
            utterance.pitch = basePitch * 0.9;
          } else if (persona.id === 'busy_betty') {
            utterance.rate = baseRate * 1.1;
            utterance.pitch = basePitch * 1.1;
          } else if (persona.id === 'technical_tom') {
            utterance.rate = baseRate * 0.95;
            utterance.pitch = basePitch * 0.95;
          } else {
            utterance.rate = baseRate;
            utterance.pitch = basePitch;
          }
          
          utterance.volume = 0.9;
          
          utterance.onstart = () => setIsAISpeaking(true);
          utterance.onend = () => setIsAISpeaking(false);
          utterance.onerror = (error) => {
            console.error('Speech synthesis error:', error);
            setIsAISpeaking(false);
          };
          
          // For mobile browsers, we might need to chunk long text
          if (isMobile && text.length > 200) {
            // Split text into sentences and speak them sequentially
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            let currentIndex = 0;
            
            const speakNextSentence = () => {
              if (currentIndex < sentences.length) {
                const sentence = sentences[currentIndex].trim();
                if (sentence) {
                  const sentenceUtterance = new SpeechSynthesisUtterance(sentence);
                  if (selectedVoice) sentenceUtterance.voice = selectedVoice;
                  sentenceUtterance.rate = utterance.rate;
                  sentenceUtterance.pitch = utterance.pitch;
                  sentenceUtterance.volume = utterance.volume;
                  
                  sentenceUtterance.onend = () => {
                    currentIndex++;
                    if (currentIndex < sentences.length) {
                      setTimeout(speakNextSentence, 100); // Small pause between sentences
                    } else {
                      setIsAISpeaking(false);
                    }
                  };
                  
                  sentenceUtterance.onerror = () => {
                    console.error('Speech synthesis error on sentence:', sentence);
                    setIsAISpeaking(false);
                  };
                  
                  speechSynthesis.speak(sentenceUtterance);
                }
              }
            };
            
            setIsAISpeaking(true);
            speakNextSentence();
          } else {
            speechSynthesis.speak(utterance);
          }
        };
        
        // Ensure voices are loaded
        if (speechSynthesis.getVoices().length === 0) {
          speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
        } else {
          speak();
        }
      }, 100);
    }
  };

  const stopAISpeech = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsAISpeaking(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col safe-area-inset">
      {/* Header */}
      <div className="mb-4 sm:mb-6 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Practicing with: {persona.avatar} {persona.name}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-3">
          Scenario: {scenario.icon} {scenario.name}
        </p>
        
        {/* Voice Quality Display */}
        <div className="text-xs sm:text-sm text-gray-600">
          Using <strong>{voiceQuality === 'premium' ? 'Premium HD' : 'Standard'}</strong> voice quality
        </div>
      </div>

      {/* Hidden audio element for premium TTS */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Conversation Display */}
      <div 
        ref={conversationRef}
        className="flex-1 bg-white rounded-lg border border-gray-200 p-4 sm:p-6 overflow-y-auto mb-4 sm:mb-6 min-h-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
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
          <div key={index} className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {exchange.user && (
              <div className="flex items-start space-x-2 sm:space-x-3 justify-end">
                <div className="bg-blue-500 text-white rounded-lg p-3 sm:p-4 max-w-[85%] sm:max-w-3xl">
                  <div className="font-semibold mb-1 text-sm sm:text-base">You</div>
                  <div className="text-sm sm:text-base leading-relaxed">{exchange.user}</div>
                </div>
                <div className="text-xl sm:text-2xl flex-shrink-0">👤</div>
              </div>
            )}
            
            {exchange.assistant && (
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="text-xl sm:text-2xl flex-shrink-0">{persona.avatar}</div>
                <div className="bg-gray-100 rounded-lg p-3 sm:p-4 max-w-[85%] sm:max-w-3xl">
                  <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                    {persona.name}
                  </div>
                  <div className="text-gray-800 text-sm sm:text-base leading-relaxed">{exchange.assistant}</div>
                </div>
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
          <div className="flex items-center justify-center space-x-2 flex-wrap">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-700 font-medium text-sm sm:text-base">
              {persona.name} is speaking...
            </span>
            <button
              onClick={stopAISpeech}
              className="ml-2 sm:ml-4 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 bg-white rounded border border-blue-200 touch-manipulation"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Audio Controls */}
      <div className="text-center space-y-4 pb-safe">
        <AudioRecorder 
          onTranscription={handleUserTranscription}
          disabled={isProcessingResponse || isAISpeaking}
        />
        
        <button
          onClick={onEndSession}
          className="px-6 py-3 text-sm sm:text-base font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation min-h-[2.75rem]"
        >
          End Session
        </button>
      </div>
    </div>
  );
}