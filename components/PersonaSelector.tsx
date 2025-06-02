import { getAllPersonas } from '../lib/personas';
import { getAllScenarios } from '../lib/scenarios';
import { Persona, Scenario } from '../lib/types';
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
}

export default function PersonaSelector({ 
  onPersonaSelect, 
  onScenarioSelect, 
  onVoiceQualitySelect,
  onStart, 
  selectedPersona, 
  selectedScenario,
  selectedVoiceQuality
}: PersonaSelectorProps) {
  const personas = getAllPersonas();
  const scenarios = getAllScenarios();

  const canStart = selectedPersona && selectedScenario;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 safe-area-inset">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          🎯 AI Sales Practice Tool
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Master your sales skills with realistic AI customer personas
        </p>
      </div>

      {/* Persona Selection */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
          👥 Choose Your Customer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {personas.map((persona) => (
            <Card
              key={persona.id}
              className={`cursor-pointer transition-all duration-200 touch-manipulation hover:shadow-lg ${
                selectedPersona?.id === persona.id
                  ? 'ring-2 ring-primary shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onClick={() => onPersonaSelect(persona)}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-4xl sm:text-5xl mb-2">{persona.avatar}</div>
                <CardTitle className="text-lg sm:text-xl">{persona.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <CardDescription className="text-sm leading-relaxed">
                  {persona.description}
                </CardDescription>
                {selectedPersona?.id === persona.id && (
                  <Badge className="mt-3">Selected</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
          🎬 Choose Your Scenario
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className={`cursor-pointer transition-all duration-200 touch-manipulation hover:shadow-lg ${
                selectedScenario?.id === scenario.id
                  ? 'ring-2 ring-green-500 shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onClick={() => onScenarioSelect(scenario)}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-4xl sm:text-5xl mb-2">{scenario.icon}</div>
                <CardTitle className="text-lg sm:text-xl">{scenario.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <CardDescription className="text-sm leading-relaxed">
                  {scenario.description}
                </CardDescription>
                {selectedScenario?.id === scenario.id && (
                  <Badge variant="secondary" className="mt-3 bg-green-100 text-green-700">Selected</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Voice Quality Selection */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
          🎵 Choose Voice Quality
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <Card
            className={`cursor-pointer transition-all duration-200 touch-manipulation hover:shadow-lg ${
              selectedVoiceQuality === 'browser'
                ? 'ring-2 ring-purple-500 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => onVoiceQualitySelect('browser')}
          >
            <CardHeader className="text-center pb-4">
              <div className="text-4xl sm:text-5xl mb-2">🔊</div>
              <CardTitle className="text-lg sm:text-xl">Standard Voice</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <CardDescription className="text-sm mb-4 leading-relaxed">
                Enhanced browser text-to-speech with persona-specific tuning
              </CardDescription>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">Free</Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Fast</Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">No API</Badge>
              </div>
              {selectedVoiceQuality === 'browser' && (
                <Badge className="mt-3">Selected</Badge>
              )}
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all duration-200 touch-manipulation hover:shadow-lg ${
              selectedVoiceQuality === 'premium'
                ? 'ring-2 ring-purple-500 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => onVoiceQualitySelect('premium')}
          >
            <CardHeader className="text-center pb-4">
              <div className="text-4xl sm:text-5xl mb-2">🎙️</div>
              <CardTitle className="text-lg sm:text-xl">Premium HD Voice</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <CardDescription className="text-sm mb-4 leading-relaxed">
                Studio-quality AI voices with unique persona characteristics
              </CardDescription>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">HD Quality</Badge>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">Persona Voices</Badge>
                <Badge variant="outline">Requires API</Badge>
              </div>
              {selectedVoiceQuality === 'premium' && (
                <Badge className="mt-3">Selected</Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center pb-safe">
        <Button
          onClick={onStart}
          disabled={!canStart}
          size="xl"
          className="touch-manipulation min-h-[3rem] sm:min-h-[3.5rem] shadow-lg hover:shadow-xl"
        >
          {canStart ? '🚀 Start Practice Session' : '📋 Select Persona & Scenario'}
        </Button>
        
        {selectedPersona && selectedScenario && (
          <Card className="mt-6 max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <Badge variant="outline" className="mb-3">Ready to Start</Badge>
                <p className="text-sm sm:text-base leading-relaxed">
                  Practice <strong>{selectedScenario.name}</strong> with{' '}
                  <strong>{selectedPersona.name}</strong> using{' '}
                  <strong>{selectedVoiceQuality === 'premium' ? 'Premium HD' : 'Standard'}</strong> voice
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}