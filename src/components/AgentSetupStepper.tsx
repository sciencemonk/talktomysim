
import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, BookOpen, MessageSquare, Users, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AgentSetupStepperProps {
  agent: any;
}

type StepStatus = 'not-started' | 'in-progress' | 'completed';

interface StepState {
  status: StepStatus;
  active: boolean;
}

export const AgentSetupStepper: React.FC<AgentSetupStepperProps> = ({ agent }) => {
  const [steps, setSteps] = useState({
    training: { status: 'not-started' as StepStatus, active: true },
    testing: { status: 'not-started' as StepStatus, active: false },
    deployment: { status: 'not-started' as StepStatus, active: false }
  });

  const [expanded, setExpanded] = useState({
    training: true,
    testing: false,
    deployment: false
  });

  const toggleExpanded = (stepName: keyof typeof steps) => {
    setExpanded(prev => ({
      ...prev,
      [stepName]: !prev[stepName]
    }));
  };

  const totalSteps = Object.keys(steps).length;
  const completedSteps = Object.values(steps).filter(step => step.status === 'completed').length;
  const overallProgress = Math.round((completedSteps / totalSteps) * 100);

  const handleStepComplete = (stepName: keyof typeof steps) => {
    setSteps(prevSteps => {
      const newSteps = { ...prevSteps };
      
      // Mark current step as completed
      newSteps[stepName].status = 'completed' as StepStatus;
      newSteps[stepName].active = false;

      // Find next incomplete step
      const stepKeys = Object.keys(steps) as Array<keyof typeof steps>;
      const currentIndex = stepKeys.indexOf(stepName);
      const nextStep = stepKeys[currentIndex + 1];

      if (nextStep) {
        newSteps[nextStep].status = 'in-progress' as StepStatus;
        newSteps[nextStep].active = true;
        
        // Auto-collapse completed step and expand next step
        setExpanded(prev => ({
          ...prev,
          [stepName]: false,
          [nextStep]: true
        }));
      }

      return newSteps;
    });
  };

  const handleStepStart = (stepName: keyof typeof steps) => {
    setSteps(prevSteps => ({
      ...prevSteps,
      [stepName]: {
        ...prevSteps[stepName],
        status: 'in-progress' as StepStatus
      }
    }));
  };

  const getStepIcon = (stepName: string, status: StepStatus) => {
    if (status === 'completed') return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === 'in-progress') return <Clock className="h-5 w-5 text-blue-600" />;
    
    switch (stepName) {
      case 'training': return <BookOpen className="h-5 w-5 text-muted-foreground" />;
      case 'testing': return <MessageSquare className="h-5 w-5 text-muted-foreground" />;
      case 'deployment': return <Users className="h-5 w-5 text-muted-foreground" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: StepStatus) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress': return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default: return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-foreground">Tutor Setup</h2>
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2 text-muted-foreground">{overallProgress}% Complete</span>
            <Progress value={overallProgress} className="w-24 h-2" />
          </div>
        </div>
        
        <p className="text-muted-foreground">
          Complete these steps to prepare your AI tutor for students
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Training Step */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleExpanded('training')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStepIcon('training', steps.training.status)}
                <div>
                  <CardTitle className="text-lg">1. Train Your Tutor</CardTitle>
                  <CardDescription>Provide examples and teaching materials</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(steps.training.status)}
              </div>
            </div>
          </CardHeader>
          
          {expanded.training && (
            <CardContent className="pt-0">
              {steps.training.status === 'not-started' && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Upload teaching materials, example conversations, or subject content to help your tutor learn your teaching style and subject matter.
                  </p>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleStepStart('training')} className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      Start Training
                    </Button>
                  </div>
                </div>
              )}
              
              {steps.training.status === 'in-progress' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Training in Progress</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your tutor is learning from the materials you've provided. This typically takes 5-10 minutes.
                    </p>
                    <div className="flex items-center space-x-2">
                      <Progress value={75} className="flex-1" />
                      <span className="text-sm">75%</span>
                    </div>
                  </div>
                  <Button onClick={() => handleStepComplete('training')} variant="outline">
                    Complete Training
                  </Button>
                </div>
              )}
              
              {steps.training.status === 'completed' && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Training Complete!</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your tutor has been trained and is ready for testing with sample student interactions.
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Testing Step */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleExpanded('testing')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStepIcon('testing', steps.testing.status)}
                <div>
                  <CardTitle className="text-lg">2. Test with Sample Questions</CardTitle>
                  <CardDescription>Try different student scenarios</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(steps.testing.status)}
              </div>
            </div>
          </CardHeader>
          
          {expanded.testing && (
            <CardContent className="pt-0">
              {steps.testing.status === 'not-started' && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Test your tutor with various student questions and scenarios to ensure it responds appropriately.
                  </p>
                  <Button 
                    onClick={() => handleStepStart('testing')} 
                    disabled={steps.training.status !== 'completed'}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Testing
                  </Button>
                </div>
              )}
              
              {steps.testing.status === 'in-progress' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Testing Scenarios</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Easy questions</span>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Challenging problems</span>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Student confusion scenarios</span>
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => handleStepComplete('testing')} variant="outline">
                    Complete Testing
                  </Button>
                </div>
              )}
              
              {steps.testing.status === 'completed' && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Testing Complete!</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your tutor performed well across different scenarios and is ready for students.
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Deployment Step */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleExpanded('deployment')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStepIcon('deployment', steps.deployment.status)}
                <div>
                  <CardTitle className="text-lg">3. Deploy to Students</CardTitle>
                  <CardDescription>Make your tutor available to students</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(steps.deployment.status)}
              </div>
            </div>
          </CardHeader>
          
          {expanded.deployment && (
            <CardContent className="pt-0">
              {steps.deployment.status === 'not-started' && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Share your tutor with students via a link, embed it in your learning management system, or provide direct access.
                  </p>
                  <Button 
                    onClick={() => handleStepStart('deployment')} 
                    disabled={steps.testing.status !== 'completed'}
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Deploy Tutor
                  </Button>
                </div>
              )}
              
              {steps.deployment.status === 'in-progress' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Deployment Options</h4>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span>Share via student link</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span>Embed in LMS</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span>Direct classroom access</span>
                      </label>
                    </div>
                  </div>
                  <Button onClick={() => handleStepComplete('deployment')} variant="outline">
                    Complete Deployment
                  </Button>
                </div>
              )}
              
              {steps.deployment.status === 'completed' && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Tutor is Live!</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your AI tutor is now available to help students. Monitor usage and feedback in the analytics section.
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};
