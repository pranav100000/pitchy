import { useState } from 'react';
import { SessionFeedback, ConversationExchange, Persona, Scenario } from '../lib/types';

interface FeedbackDisplayProps {
  feedback: SessionFeedback;
  transcript: ConversationExchange[];
  persona: Persona;
  scenario: Scenario;
  onTryAgain: () => void;
}

export default function FeedbackDisplay({ 
  feedback, 
  transcript, 
  persona, 
  scenario, 
  onTryAgain 
}: FeedbackDisplayProps) {
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 40) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-red-800 bg-red-100 border-red-300';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Outstanding!';
    if (score >= 80) return 'Strong Performance';
    if (score >= 70) return 'Decent Attempt';
    if (score >= 60) return 'Weak Performance';
    if (score >= 40) return 'Poor Performance';
    if (score >= 20) return 'Very Poor';
    return 'Failure';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Session Complete! 🎉
        </h1>
        <p className="text-gray-600">
          You practiced <strong>{scenario.name}</strong> with <strong>{persona.name}</strong>
        </p>
      </div>

      {/* Score Display */}
      <div className="mb-8">
        <div className={`
          rounded-lg border-2 p-6 text-center
          ${getScoreColor(feedback.score)}
        `}>
          <div className="text-4xl font-bold mb-2">
            {feedback.score}/100
          </div>
          <div className="text-lg font-semibold">
            {getScoreLabel(feedback.score)}
          </div>
        </div>
      </div>

      {/* Feedback Points */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Key Feedback:
        </h2>
        <div className="space-y-3">
          {feedback.feedback.map((point, index) => (
            <div 
              key={index}
              className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
            >
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-800 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transcript Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Conversation Transcript
          </h2>
          <button
            onClick={() => setShowFullTranscript(!showFullTranscript)}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {showFullTranscript ? 'Hide' : 'Show'} Full Transcript
          </button>
        </div>

        {showFullTranscript && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
            {transcript.length === 0 ? (
              <p className="text-gray-500 text-center">No conversation recorded</p>
            ) : (
              <div className="space-y-4">
                {transcript.map((exchange, index) => (
                  <div key={index} className="space-y-2">
                    {exchange.assistant && (
                      <div className="flex items-start space-x-3">
                        <div className="text-lg">{persona.avatar}</div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {persona.name}:
                          </div>
                          <div className="text-gray-700">{exchange.assistant}</div>
                        </div>
                      </div>
                    )}
                    
                    {exchange.user && (
                      <div className="flex items-start space-x-3 ml-8">
                        <div className="text-lg">👤</div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            You:
                          </div>
                          <div className="text-gray-700">{exchange.user}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onTryAgain}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Practice Again
        </button>
        
        <button
          onClick={() => {
            // Go back to setup with same persona but different scenario
            onTryAgain();
          }}
          className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Try Different Scenario
        </button>
        
        <button
          onClick={() => {
            // Go back to setup to choose different persona
            onTryAgain();
          }}
          className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Choose Different Persona
        </button>
      </div>

      {/* Encouragement Message */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <p className="text-blue-800">
          <strong>Keep practicing!</strong> Each session helps you improve your sales skills. 
          Try different personas and scenarios to build confidence in various situations.
        </p>
      </div>
    </div>
  );
}