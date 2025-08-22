
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
            Define how your digital sim communicates and interacts with people. Set your personality, 
            tone, and response patterns so others can chat with a digital version of you.
          </p>

          {/* Welcome Message Section */}
          <div className="space-y-3">
            <Label htmlFor="welcome-message" className="text-base font-medium">
              Welcome Message
            </Label>
            <p className="text-sm text-muted-foreground">
              The first message people will see when they start chatting with your digital sim.
            </p>
            <Textarea
              id="welcome-message"
              placeholder="Hey there! I'm the digital version of [Your Name]. I'm here to chat about whatever's on your mind. What would you like to talk about?"
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
                  Sample Questions & Your Responses
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Provide example questions people might ask you and how you would typically respond. 
                  This helps your digital sim learn your personality, communication style, and way of thinking.
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
                          Question Someone Might Ask You
                        </Label>
                        <Input
                          id={`question-${scenario.id}`}
                          placeholder="e.g., What's your favorite hobby? or What do you think about...?"
                          value={scenario.question}
                          onChange={(e) => updateScenario(scenario.id, 'question', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`response-${scenario.id}`} className="text-sm">
                          How You Would Respond
                        </Label>
                        <Textarea
                          id={`response-${scenario.id}`}
                          placeholder="e.g., I'm really into photography! I love capturing moments and experimenting with different lighting..."
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
            <li>• Be authentic in your responses to capture your real personality</li>
            <li>• Include different types of questions (personal, professional, casual, deep)</li>
            <li>• Show your unique way of explaining things or sharing thoughts</li>
            <li>• Demonstrate your tone - whether you're humorous, thoughtful, direct, or encouraging</li>
            <li>• Include your interests, opinions, and experiences to make conversations feel genuine</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractionModel;
