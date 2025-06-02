import { useState } from 'react';
import Head from 'next/head';
import PersonaSelector from '../components/PersonaSelector';
import ConversationInterface from '../components/ConversationInterface';
import FeedbackDisplay from '../components/FeedbackDisplay';
import { GameState, Persona, Scenario, ConversationExchange, SessionFeedback } from '../lib/types';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedVoiceQuality, setSelectedVoiceQuality] = useState<'browser' | 'premium'>('premium');
  const [conversationHistory, setConversationHistory] = useState<ConversationExchange[]>([]);
  const [sessionFeedback, setSessionFeedback] = useState<SessionFeedback | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const startSession = () => {
    if (!selectedPersona || !selectedScenario) return;
    
    setGameState('conversation');
    setConversationHistory([]);
    setSessionFeedback(null);
  };

  const endSession = async () => {
    if (!selectedPersona || !selectedScenario) return;
    
    setIsGeneratingFeedback(true);
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: conversationHistory,
          persona: selectedPersona,
          scenario: selectedScenario
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSessionFeedback(data.feedback);
        setGameState('feedback');
      } else {
        throw new Error(data.error || 'Failed to generate feedback');
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      alert('Failed to generate feedback. Please try again.');
      // Stay in conversation state if feedback generation fails
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const resetApp = () => {
    setGameState('setup');
    setSelectedPersona(null);
    setSelectedScenario(null);
    setSelectedVoiceQuality('premium');
    setConversationHistory([]);
    setSessionFeedback(null);
  };

  // Show loading screen while generating feedback
  if (isGeneratingFeedback) {
    return (
      <>
        <Head>
          <title>Pitchy - AI Sales Practice Tool</title>
          <meta name="description" content="Practice your sales skills with AI customer personas" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="format-detection" content="telephone=no" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Analyzing Your Performance...
            </h2>
            <p className="text-gray-600">
              AI is reviewing your conversation and generating feedback
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Pitchy - AI Sales Practice Tool</title>
        <meta name="description" content="Practice your sales skills with AI customer personas" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gray-100">
        {gameState === 'setup' && (
          <PersonaSelector 
            onPersonaSelect={setSelectedPersona}
            onScenarioSelect={setSelectedScenario}
            onVoiceQualitySelect={setSelectedVoiceQuality}
            onStart={startSession}
            selectedPersona={selectedPersona}
            selectedScenario={selectedScenario}
            selectedVoiceQuality={selectedVoiceQuality}
          />
        )}
        
        {gameState === 'conversation' && selectedPersona && selectedScenario && (
          <ConversationInterface
            persona={selectedPersona}
            scenario={selectedScenario}
            conversationHistory={conversationHistory}
            setConversationHistory={setConversationHistory}
            onEndSession={endSession}
            voiceQuality={selectedVoiceQuality}
          />
        )}
        
        {gameState === 'feedback' && sessionFeedback && selectedPersona && selectedScenario && (
          <FeedbackDisplay
            feedback={sessionFeedback}
            transcript={conversationHistory}
            persona={selectedPersona}
            scenario={selectedScenario}
            onTryAgain={resetApp}
          />
        )}
      </div>
    </>
  );
}