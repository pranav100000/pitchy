import { getAllPersonas } from '../lib/personas';
import { getAllScenarios } from '../lib/scenarios';
import { Persona, Scenario } from '../lib/types';

interface PersonaSelectorProps {
  onPersonaSelect: (persona: Persona) => void;
  onScenarioSelect: (scenario: Scenario) => void;
  onStart: () => void;
  selectedPersona: Persona | null;
  selectedScenario: Scenario | null;
}

export default function PersonaSelector({ 
  onPersonaSelect, 
  onScenarioSelect, 
  onStart, 
  selectedPersona, 
  selectedScenario 
}: PersonaSelectorProps) {
  const personas = getAllPersonas();
  const scenarios = getAllScenarios();

  const canStart = selectedPersona && selectedScenario;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Sales Practice Tool
        </h1>
        <p className="text-xl text-gray-600">
          Practice your sales skills with realistic AI customer personas
        </p>
      </div>

      {/* Persona Selection */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Choose Your Customer:
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <div
              key={persona.id}
              onClick={() => onPersonaSelect(persona)}
              className={`
                cursor-pointer p-6 rounded-lg border-2 transition-all duration-200
                ${selectedPersona?.id === persona.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{persona.avatar}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {persona.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {persona.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Choose Scenario:
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => onScenarioSelect(scenario)}
              className={`
                cursor-pointer p-6 rounded-lg border-2 transition-all duration-200
                ${selectedScenario?.id === scenario.id
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{scenario.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {scenario.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {scenario.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={onStart}
          disabled={!canStart}
          className={`
            px-12 py-4 text-xl font-semibold rounded-lg transition-all duration-200
            ${canStart
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {canStart ? 'Start Practice Session' : 'Select Persona & Scenario'}
        </button>
        
        {selectedPersona && selectedScenario && (
          <div className="mt-4 text-gray-600">
            Ready to practice <strong>{selectedScenario.name}</strong> with{' '}
            <strong>{selectedPersona.name}</strong>
          </div>
        )}
      </div>
    </div>
  );
}