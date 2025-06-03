import { useState } from 'react';
import Head from 'next/head';
import ResearchStep from '../components/ResearchStep';
import PersonaSelector from '../components/PersonaSelector';
import PitchModeSelector from '../components/PitchModeSelector';
import ConversationInterface from '../components/ConversationInterface';
import PitchRecorder from '../components/PitchRecorder';
import FeedbackDisplay from '../components/FeedbackDisplay';
import PitchFeedbackDisplay from '../components/PitchFeedbackDisplay';
import { GameState, Persona, Scenario, ConversationExchange, SessionFeedback, ResearchData, PitchLength, PitchSession, PitchFeedback } from '../lib/types';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('research');
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedPitchLength, setSelectedPitchLength] = useState<PitchLength | null>(null);
  const [selectedVoiceQuality, setSelectedVoiceQuality] = useState<'browser' | 'premium'>('premium');
  const [conversationHistory, setConversationHistory] = useState<ConversationExchange[]>([]);
  const [pitchSession, setPitchSession] = useState<PitchSession | null>(null);
  const [sessionFeedback, setSessionFeedback] = useState<SessionFeedback | null>(null);
  const [pitchFeedback, setPitchFeedback] = useState<PitchFeedback | null>(null);
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

  const startPitchSession = () => {
    if (!selectedPersona || !selectedPitchLength) return;
    
    setGameState('pitch');
    setPitchSession(null);
    setPitchFeedback(null);
  };

  const handlePitchComplete = async (session: PitchSession) => {
    setPitchSession(session);
    setIsGeneratingFeedback(true);
    
    try {
      const response = await fetch('/api/pitch-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitchSession: session
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.feedback) {
        setPitchFeedback(data.feedback);
        setGameState('pitch-feedback');
      } else {
        throw new Error(data.error || 'Failed to generate pitch feedback');
      }
    } catch (error) {
      console.error('Error generating pitch feedback:', error);
      alert('Failed to generate pitch feedback. Please try again.');
      setGameState('pitch');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const handleResearchComplete = (data: ResearchData | null) => {
    setResearchData(data);
    setGameState('setup');
  };

  const resetApp = () => {
    setGameState('research');
    setResearchData(null);
    setSelectedPersona(null);
    setSelectedScenario(null);
    setSelectedPitchLength(null);
    setSelectedVoiceQuality('premium');
    setConversationHistory([]);
    setPitchSession(null);
    setSessionFeedback(null);
    setPitchFeedback(null);
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
        {gameState === 'research' && (
          <ResearchStep 
            onResearchComplete={handleResearchComplete}
            onSkip={() => handleResearchComplete(null)}
          />
        )}

        {gameState === 'setup' && (
          <div className="space-y-8">
            {/* Mode Selection */}
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Choose Your Practice Mode
                </h1>
                <p className="text-lg sm:text-xl text-gray-600">
                  Select how you want to practice your sales skills
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div
                  onClick={() => setGameState('conversation-setup')}
                  className="cursor-pointer p-6 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Conversation Mode
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      Practice interactive sales conversations with AI customers who respond in real-time
                    </p>
                    <div className="text-blue-600 font-medium text-sm">
                      Two-way dialogue • Handle objections • Build rapport
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setGameState('pitch-setup')}
                  className="cursor-pointer p-6 rounded-lg border-2 border-gray-200 bg-white hover:border-green-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Pitch Mode
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      Deliver uninterrupted sales pitches and get detailed feedback on your presentation
                    </p>
                    <div className="text-green-600 font-medium text-sm">
                      Solo presentation • Time limits • Structure analysis
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === 'conversation-setup' && (
          <PersonaSelector 
            onPersonaSelect={setSelectedPersona}
            onScenarioSelect={setSelectedScenario}
            onVoiceQualitySelect={setSelectedVoiceQuality}
            onStart={startSession}
            selectedPersona={selectedPersona}
            selectedScenario={selectedScenario}
            selectedVoiceQuality={selectedVoiceQuality}
            researchData={researchData}
          />
        )}

        {gameState === 'pitch-setup' && (
          <PitchModeSelector 
            onPersonaSelect={setSelectedPersona}
            onPitchLengthSelect={setSelectedPitchLength}
            onStart={startPitchSession}
            selectedPersona={selectedPersona}
            selectedPitchLength={selectedPitchLength}
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
            researchData={researchData}
          />
        )}

        {gameState === 'pitch' && selectedPersona && selectedPitchLength && (
          <PitchRecorder
            persona={selectedPersona}
            pitchLength={selectedPitchLength}
            onPitchComplete={handlePitchComplete}
            onCancel={() => setGameState('pitch-setup')}
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

        {gameState === 'pitch-feedback' && pitchFeedback && pitchSession && (
          <PitchFeedbackDisplay
            feedback={pitchFeedback}
            pitchSession={pitchSession}
            onTryAgain={resetApp}
          />
        )}
      </div>
    </>
  );
}