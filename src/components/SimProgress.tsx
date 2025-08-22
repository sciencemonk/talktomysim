import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, BookOpen, MessageCircle, User } from "lucide-react";
import { SimCompletionStatus } from '@/services/simService';

interface SimProgressProps {
  completionStatus: SimCompletionStatus;
  className?: string;
}

const SimProgress: React.FC<SimProgressProps> = ({ completionStatus, className = "" }) => {
  const steps = [
    {
      key: 'basic_info' as keyof SimCompletionStatus,
      title: 'Context Window',
      description: 'Personal details and background',
      icon: User
    },
    {
      key: 'interaction_model' as keyof SimCompletionStatus,
      title: 'Interaction Model',
      description: 'Communication style and responses',
      icon: MessageCircle
    },
    {
      key: 'core_knowledge' as keyof SimCompletionStatus,
      title: 'Vector Embedding',
      description: 'Knowledge base and expertise',
      icon: BookOpen
    }
  ];

  const completedSteps = Object.values(completionStatus).filter(Boolean).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Sim Setup Progress</h3>
            <Badge variant={completedSteps === totalSteps ? "default" : "secondary"}>
              {completedSteps}/{totalSteps} Complete
            </Badge>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
          
          <div className="space-y-3">
            {steps.map((step) => {
              const isCompleted = completionStatus[step.key];
              const Icon = step.icon;
              
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {completedSteps === totalSteps && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                🎉 Your sim is ready! You can now make it public for others to interact with.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimProgress;
