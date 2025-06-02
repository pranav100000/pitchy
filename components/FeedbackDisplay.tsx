import { useState } from 'react';
import { SessionFeedback, ConversationExchange, Persona, Scenario } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    if (score >= 90) return 'border-green-500 bg-green-50 text-green-700';
    if (score >= 80) return 'border-blue-500 bg-blue-50 text-blue-700';
    if (score >= 70) return 'border-yellow-500 bg-yellow-50 text-yellow-700';
    if (score >= 60) return 'border-orange-500 bg-orange-50 text-orange-700';
    if (score >= 40) return 'border-red-500 bg-red-50 text-red-700';
    return 'border-red-600 bg-red-100 text-red-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Outstanding! 🎉';
    if (score >= 80) return 'Strong Performance 👏';
    if (score >= 70) return 'Decent Attempt 👍';
    if (score >= 60) return 'Needs Improvement 💪';
    if (score >= 40) return 'Keep Practicing 📝';
    if (score >= 20) return 'More Practice Needed 📚';
    return 'Try Again 🔄';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '🎆';
    if (score >= 70) return '⭐';
    if (score >= 60) return '📈';
    if (score >= 40) return '💯';
    return '📝';
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 safe-area-inset">
      {/* Header */}
      <Card className="text-center mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">
            Session Complete! 🎉
          </CardTitle>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline">
              {scenario.icon} {scenario.name}
            </Badge>
            <Badge variant="secondary">
              {persona.avatar} {persona.name}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Score Display */}
      <Card className={`mb-6 border-2 ${getScoreColor(feedback.score)}`}>
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-4">{getScoreIcon(feedback.score)}</div>
          <div className="text-4xl sm:text-5xl font-bold mb-2">
            {feedback.score}/100
          </div>
          <div className="text-xl font-semibold">
            {getScoreLabel(feedback.score)}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Points */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            📝 Key Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {feedback.feedback.map((point, index) => (
            <Card key={index} className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Badge className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </Badge>
                  <p className="leading-relaxed">{point}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Transcript Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              📜 Conversation Transcript
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowFullTranscript(!showFullTranscript)}
            >
              {showFullTranscript ? 'Hide' : 'Show'} Transcript
            </Button>
          </div>
        </CardHeader>

        {showFullTranscript && (
          <CardContent>
            <ScrollArea className="h-96 w-full border rounded-lg">
              <div className="p-4">
                {transcript.length === 0 ? (
                  <p className="text-muted-foreground text-center">No conversation recorded</p>
                ) : (
                  <div className="space-y-4">
                    {transcript.map((exchange, index) => (
                      <div key={index} className="space-y-3">
                        {exchange.assistant && (
                          <div className="flex items-start space-x-3">
                            <div className="text-lg">{persona.avatar}</div>
                            <Card className="flex-1 bg-muted/50">
                              <CardContent className="p-3">
                                <Badge variant="outline" className="text-xs mb-2">
                                  {persona.name}
                                </Badge>
                                <div className="text-sm leading-relaxed">{exchange.assistant}</div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                        
                        {exchange.user && (
                          <div className="flex items-start space-x-3 ml-8">
                            <div className="text-lg">👤</div>
                            <Card className="flex-1 bg-primary/10">
                              <CardContent className="p-3">
                                <Badge variant="secondary" className="text-xs mb-2">
                                  You
                                </Badge>
                                <div className="text-sm leading-relaxed">{exchange.user}</div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <Button
          onClick={onTryAgain}
          size="lg"
          className="shadow-lg hover:shadow-xl"
        >
          🔄 Practice Again
        </Button>
        
        <Button
          onClick={() => {
            // Go back to setup with same persona but different scenario
            onTryAgain();
          }}
          variant="secondary"
          size="lg"
          className="shadow-lg hover:shadow-xl"
        >
          🎬 Try Different Scenario
        </Button>
        
        <Button
          onClick={() => {
            // Go back to setup to choose different persona
            onTryAgain();
          }}
          variant="outline"
          size="lg"
          className="shadow-lg hover:shadow-xl"
        >
          👥 Choose Different Persona
        </Button>
      </div>

      {/* Encouragement Message */}
      <Card className="border-primary/20 bg-primary/5 pb-safe">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-primary font-medium">
            <strong>Keep practicing!</strong> Each session helps you improve your sales skills. 
            Try different personas and scenarios to build confidence in various situations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}