
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, MessageCircle, HelpCircle } from "lucide-react";

interface SampleScenario {
  id: string;
  question: string;
  expectedResponse: string;
}

const InteractionModel = () => {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [scenarios, setScenarios] = useState<SampleScenario[]>([
    { id: '1', question: '', expectedResponse: '' }
  ]);

  const addScenario = () => {
    const newScenario: SampleScenario = {
      id: Date.now().toString(),
      question: '',
      expectedResponse: ''
    };
    setScenarios([...scenarios, newScenario]);
  };

  const removeScenario = (id: string) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter(scenario => scenario.id !== id));
    }
  };

  const updateScenario = (id: string, field: 'question' | 'expectedResponse', value: string) => {
    setScenarios(scenarios.map(scenario => 
      scenario.id === id ? { ...scenario, [field]: value } : scenario
    ));
  };

  const handleSave = () => {
    console.log('Saving interaction model:', { welcomeMessage, scenarios });
    // TODO: Implement save functionality
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Interaction Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Define how your AI tutor communicates and interacts with students. Set the tone, style, 
            and behavioral patterns through examples.
          </p>

          {/* Welcome Message Section */}
          <div className="space-y-3">
            <Label htmlFor="welcome-message" className="text-base font-medium">
              Welcome Message
            </Label>
            <p className="text-sm text-muted-foreground">
              The first message students will see when they start chatting with your AI tutor.
            </p>
            <Textarea
              id="welcome-message"
              placeholder="Hi! I'm your AI tutor. I'm here to help you learn and understand complex topics. What would you like to explore today?"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Separator />

          {/* Sample Scenarios Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Sample Questions & Responses
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Provide example questions students might ask and how you would typically respond. 
                  This helps the AI learn your teaching style and communication patterns.
                </p>
              </div>
              <Button onClick={addScenario} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Scenario
              </Button>
            </div>

            <div className="space-y-4">
              {scenarios.map((scenario, index) => (
                <Card key={scenario.id} className="border-dashed">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Scenario {index + 1}</Label>
                      {scenarios.length > 1 && (
                        <Button
                          onClick={() => removeScenario(scenario.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`question-${scenario.id}`} className="text-sm">
                          Student Question
                        </Label>
                        <Input
                          id={`question-${scenario.id}`}
                          placeholder="e.g., Can you explain photosynthesis?"
                          value={scenario.question}
                          onChange={(e) => updateScenario(scenario.id, 'question', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`response-${scenario.id}`} className="text-sm">
                          Your Typical Response
                        </Label>
                        <Textarea
                          id={`response-${scenario.id}`}
                          placeholder="e.g., Great question! Let me break down photosynthesis step by step. First, plants need three key ingredients..."
                          value={scenario.expectedResponse}
                          onChange={(e) => updateScenario(scenario.id, 'expectedResponse', e.target.value)}
                          className="mt-1 min-h-[80px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} className="px-8">
              Save Interaction Model
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Better Interactions</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific in your responses to help the AI understand your teaching style</li>
            <li>• Include different types of questions (conceptual, practical, troubleshooting)</li>
            <li>• Show how you break down complex topics into simpler parts</li>
            <li>• Demonstrate your tone - encouraging, patient, or challenging as appropriate</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractionModel;
