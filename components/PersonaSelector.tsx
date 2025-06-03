import { getAllPersonas } from '../lib/personas';
import { getAllScenarios } from '../lib/scenarios';
import { Persona, Scenario, ResearchData } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PersonaSelectorProps {
  onPersonaSelect: (persona: Persona) => void;
  onScenarioSelect: (scenario: Scenario) => void;
  onVoiceQualitySelect: (quality: 'browser' | 'premium') => void;
  onStart: () => void;
  selectedPersona: Persona | null;
  selectedScenario: Scenario | null;
  selectedVoiceQuality: 'browser' | 'premium';
  researchData?: ResearchData | null;
}

export default function PersonaSelector({ 
  onPersonaSelect, 
  onScenarioSelect, 
  onVoiceQualitySelect,
  onStart, 
  selectedPersona, 
  selectedScenario,
  selectedVoiceQuality,
  researchData
}: PersonaSelectorProps) {
  const personas = getAllPersonas();
  const scenarios = getAllScenarios();

  const canStart = selectedPersona && selectedScenario;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 safe-area-inset">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          AI Sales Practice Tool
        </h1>
        <p className="text-lg sm:text-xl text-gray-600">
          Practice your sales skills with realistic AI customer personas
        </p>
      </div>

      {/* Research Summary */}
      {researchData && (
        <Card className="mb-8 sm:mb-12 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 Research Context
              <Badge variant="secondary">{researchData.query}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Summary:</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {researchData.summary}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Key Points to Discuss:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {researchData.keyPoints.slice(0, 4).map((point, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Badge className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </Badge>
                    <span className="text-xs text-gray-600 leading-tight">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Persona Selection */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
          Choose Your Customer:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {personas.map((persona) => (
            <div
              key={persona.id}
              onClick={() => onPersonaSelect(persona)}
              className={`
                cursor-pointer p-4 sm:p-6 rounded-lg border-2 transition-all duration-200 touch-manipulation
                ${selectedPersona?.id === persona.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{persona.avatar}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {persona.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {persona.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
          Choose Scenario:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => onScenarioSelect(scenario)}
              className={`
                cursor-pointer p-4 sm:p-6 rounded-lg border-2 transition-all duration-200 touch-manipulation
                ${selectedScenario?.id === scenario.id
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{scenario.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {scenario.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {scenario.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Quality Selection */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
          Choose Voice Quality:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
          <div
            onClick={() => onVoiceQualitySelect('browser')}
            className={`
              cursor-pointer p-4 sm:p-6 rounded-lg border-2 transition-all duration-200 touch-manipulation
              ${selectedVoiceQuality === 'browser'
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🔊</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Standard Voice
              </h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                Enhanced browser text-to-speech with persona-specific tuning
              </p>
              <div className="text-green-600 font-medium text-xs sm:text-sm">
                ✓ Free • ✓ Fast • ✓ No API usage
              </div>
            </div>
          </div>

          <div
            onClick={() => onVoiceQualitySelect('premium')}
            className={`
              cursor-pointer p-4 sm:p-6 rounded-lg border-2 transition-all duration-200 touch-manipulation
              ${selectedVoiceQuality === 'premium'
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🎙️</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Premium HD Voice
              </h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                Studio-quality AI voices with unique persona characteristics
              </p>
              <div className="text-blue-600 font-medium text-xs sm:text-sm">
                ✓ HD Quality • ✓ Persona Voices • ⚡ Requires OpenAI API
              </div>
            </div>
          </div>
        </div>
      </div>

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
          {canStart ? 'Start Practice Session' : 'Select Persona & Scenario'}
        </button>
        
        {selectedPersona && selectedScenario && (
          <div className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
            Ready to practice <strong>{selectedScenario.name}</strong> with{' '}
            <strong>{selectedPersona.name}</strong> using{' '}
            <strong>{selectedVoiceQuality === 'premium' ? 'Premium HD' : 'Standard'}</strong> voice
          </div>
        )}
      </div>
    </div>
  );
}