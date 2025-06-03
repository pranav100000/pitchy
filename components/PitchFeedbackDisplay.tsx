import { PitchFeedback, PitchSession } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PitchFeedbackDisplayProps {
  feedback: PitchFeedback;
  pitchSession: PitchSession;
  onTryAgain: () => void;
}

export default function PitchFeedbackDisplay({
  feedback,
  pitchSession,
  onTryAgain
}: PitchFeedbackDisplayProps) {
  const { pitchLength, transcript, duration } = pitchSession;
  const timeUsedPercentage = (duration / pitchLength.duration) * 100;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 90) return '🎯';
    if (score >= 80) return '👍';
    if (score >= 70) return '👌';
    if (score >= 60) return '😐';
    if (score >= 40) return '😕';
    if (score >= 20) return '😞';
    return '💀';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 safe-area-inset">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Pitch Analysis Complete
        </h1>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Badge variant="outline" className="text-sm">
            {pitchLength.name}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {formatTime(duration)} / {formatTime(pitchLength.duration)} used
          </Badge>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-6xl">{getScoreEmoji(feedback.score)}</div>
            <div className={`text-6xl font-bold px-6 py-3 rounded-lg ${getScoreColor(feedback.score)}`}>
              {feedback.score}
            </div>
          </div>
          <CardTitle className="text-2xl">Overall Pitch Score</CardTitle>
          <CardDescription>
            {feedback.score >= 80 ? 'Excellent pitch!' : 
             feedback.score >= 60 ? 'Good effort with room for improvement' :
             feedback.score >= 40 ? 'Needs significant work' : 
             'Requires major overhaul'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Criteria Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>Score breakdown across key pitch criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { 
              label: 'Clarity', 
              score: feedback.criteria.clarity, 
              desc: 'How clear and understandable was your message?',
              justification: feedback.criteriaJustifications.clarity
            },
            { 
              label: 'Persuasiveness', 
              score: feedback.criteria.persuasiveness, 
              desc: 'How compelling and convincing was your pitch?',
              justification: feedback.criteriaJustifications.persuasiveness
            },
            { 
              label: 'Structure', 
              score: feedback.criteria.structure, 
              desc: 'Did you follow a logical flow and organization?',
              justification: feedback.criteriaJustifications.structure
            },
            { 
              label: 'Time Management', 
              score: feedback.criteria.timeManagement, 
              desc: 'How well did you use your allocated time?',
              justification: feedback.criteriaJustifications.timeManagement
            },
            { 
              label: 'Impact', 
              score: feedback.criteria.impact, 
              desc: 'How memorable and impactful was your pitch?',
              justification: feedback.criteriaJustifications.impact
            }
          ].map((criterion, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{criterion.label}</h4>
                <div className={`text-2xl font-bold px-3 py-1 rounded ${getScoreColor(criterion.score)}`}>
                  {criterion.score}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{criterion.desc}</p>
              <div className="bg-white p-3 rounded border-l-2 border-blue-500">
                <p className="text-sm text-gray-800 italic">{criterion.justification}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Feedback Points */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Specific Feedback</CardTitle>
          <CardDescription>Areas for improvement and what to work on next</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedback.feedback.map((point, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600 font-bold text-lg mt-0.5">•</div>
                <p className="text-red-800 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{formatTime(duration)}</div>
            <div className="text-sm text-blue-800">Time Used</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{timeUsedPercentage.toFixed(0)}%</div>
            <div className="text-sm text-purple-800">Time Efficiency</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{transcript.split(' ').length}</div>
            <div className="text-sm text-green-800">Words Spoken</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round((transcript.split(' ').length / duration) * 60)}
            </div>
            <div className="text-sm text-orange-800">Words/Minute</div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Pitch Transcript</CardTitle>
          <CardDescription>What you said during your {pitchLength.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{transcript}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="text-center space-y-4 pb-safe">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onTryAgain} 
            variant="outline" 
            size="lg"
            className="px-8 py-3"
          >
            Practice Again
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            size="lg"
            className="px-8 py-3"
          >
            Back to Main Menu
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Practice makes perfect! Try different pitch lengths or target different customer personas 
          to improve your versatility and effectiveness.
        </p>
      </div>
    </div>
  );
}