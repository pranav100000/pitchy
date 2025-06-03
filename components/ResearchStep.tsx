import { useState } from 'react';
import { ResearchData } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ResearchStepProps {
  onResearchComplete: (data: ResearchData | null) => void;
  onSkip: () => void;
}

export default function ResearchStep({ onResearchComplete, onSkip }: ResearchStepProps) {
  const [query, setQuery] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exampleQueries = [
    'Tesla Model Y pricing and features',
    'Salesforce CRM benefits for small businesses',
    'Microsoft Azure vs AWS comparison',
    'HubSpot marketing automation tools',
    'Zoom video conferencing solutions',
    'Slack team collaboration features'
  ];

  const handleResearch = async () => {
    if (!query.trim()) return;

    setIsResearching(true);
    setError(null);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setResearchData(data.data);
        setError(null);
      } else {
        throw new Error(data.error || 'Research failed');
      }
    } catch (error) {
      console.error('Research error:', error);
      setError(error instanceof Error ? error.message : 'Failed to research topic');
    } finally {
      setIsResearching(false);
    }
  };

  const handleUseResearch = () => {
    onResearchComplete(researchData);
  };

  const handleSkipResearch = () => {
    onResearchComplete(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isResearching && query.trim()) {
      handleResearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 safe-area-inset">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          🔍 Research Your Topic
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Get key insights before your sales practice session
        </p>
      </div>

      {!researchData ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              What would you like to research?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a company, product, or topic to research..."
                className="flex-1 px-4 py-3 text-base border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={isResearching}
              />
              <Button 
                onClick={handleResearch}
                disabled={!query.trim() || isResearching}
                size="lg"
                className="min-w-[120px]"
              >
                {isResearching ? '🔄 Researching...' : '🔍 Research'}
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <p className="text-destructive text-sm">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Example Queries */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                💡 Example searches:
              </h3>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(example)}
                    className="text-xs"
                    disabled={isResearching}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            {/* Skip Option */}
            <div className="text-center pt-4 border-t">
              <Button
                variant="ghost"
                onClick={handleSkipResearch}
                disabled={isResearching}
              >
                ⏭️ Skip Research & Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Research Results */
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                📋 Research Results
              </CardTitle>
              <Badge variant="secondary">
                {researchData.query}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-2">📝 Summary</h3>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="leading-relaxed">{researchData.summary}</p>
                </CardContent>
              </Card>
            </div>

            {/* Key Points */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🎯 Key Talking Points</h3>
              <div className="space-y-2">
                {researchData.keyPoints.map((point, index) => (
                  <Card key={index} className="bg-primary/5">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Badge className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </Badge>
                        <p className="text-sm leading-relaxed">{point}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleUseResearch}
                size="lg"
                className="flex-1"
              >
                ✅ Use This Research
              </Button>
              <Button
                variant="outline"
                onClick={() => setResearchData(null)}
                size="lg"
              >
                🔄 Search Again
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkipResearch}
                size="lg"
              >
                ⏭️ Continue Without
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-primary">
            <strong>💡 Pro Tip:</strong> Research helps the AI persona respond more realistically based on your specific topic or company.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}