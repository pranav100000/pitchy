import { getAllPitchLengths } from '../lib/pitchLengths';
import { PitchLength } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PitchModeSelectorProps {
  onPitchLengthSelect: (pitchLength: PitchLength) => void;
  onStart: () => void;
  selectedPitchLength: PitchLength | null;
}

export default function PitchModeSelector({ 
  onPitchLengthSelect,
  onStart, 
  selectedPitchLength
}: PitchModeSelectorProps) {
  const pitchLengths = getAllPitchLengths();

  const canStart = selectedPitchLength;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 safe-area-inset">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          🎯 Pitch Practice Mode
        </h1>
        <p className="text-lg sm:text-xl text-gray-600">
          Deliver your sales pitch and get objective, detailed feedback on your presentation skills
        </p>
      </div>


      {/* Pitch Length Selection */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
          Choose Pitch Length:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {pitchLengths.map((pitchLength) => (
            <div
              key={pitchLength.id}
              onClick={() => onPitchLengthSelect(pitchLength)}
              className={`
                cursor-pointer p-4 sm:p-6 rounded-lg border-2 transition-all duration-200 touch-manipulation
                ${selectedPitchLength?.id === pitchLength.id
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2 sm:mb-3">
                  {pitchLength.duration}s
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {pitchLength.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {pitchLength.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <Card className="mb-8 sm:mb-12 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            💡 How Pitch Mode Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-orange-700">
          <p>
            <strong>1. Prepare:</strong> Think about your product/service and how to pitch it to your chosen audience
          </p>
          <p>
            <strong>2. Record:</strong> Deliver your pitch within the time limit - no conversation, just your presentation
          </p>
          <p>
            <strong>3. Get Feedback:</strong> Receive detailed analysis on clarity, persuasiveness, structure, timing, and audience relevance
          </p>
          <p className="font-semibold">
            This is different from conversation mode - you'll be speaking uninterrupted to present your case!
          </p>
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="text-center pb-safe">
        <button
          onClick={onStart}
          disabled={!canStart}
          className={`
            px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-semibold rounded-lg transition-all duration-200 touch-manipulation
            min-h-[3rem] sm:min-h-[3.5rem]
            ${canStart
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
  {canStart ? 'Start Pitch Practice' : 'Select Pitch Length'}
        </button>
        
{selectedPitchLength && (
          <div className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
            Ready to deliver your <strong>{selectedPitchLength.name}</strong> in{' '}
            <strong>{selectedPitchLength.duration} seconds</strong>
          </div>
        )}
      </div>
    </div>
  );
}