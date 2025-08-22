import React, { useState } from 'react';
import BasicInfo from './BasicInfo';
import InteractionModel from './InteractionModel';
import CoreKnowledge from './CoreKnowledge';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, MessageCircle, BookOpen } from "lucide-react";

import { useSim } from "@/hooks/useSim";
import SimProgress from './SimProgress';

const MySim = () => {
  const { sim, completionStatus, isLoading, makeSimPublic } = useSim();
  const [activeTab, setActiveTab] = useState('basic-info');

  const handleMakePublic = async () => {
    try {
      await makeSimPublic(!sim?.is_public);
    } catch (error) {
      console.error('Error updating sim visibility:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'basic-info':
        return <BasicInfo />;
      case 'interaction-model':
        return <InteractionModel />;
      case 'core-knowledge':
        return <CoreKnowledge advisorId={sim?.id} advisorName={sim?.name} />;
      default:
        return <BasicInfo />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
      {/* Left Sidebar - Navigation & Progress */}
      <div className="lg:w-80 space-y-6">
        {/* Progress Card */}
        <SimProgress completionStatus={completionStatus} />
        
        {/* Sim Status Card */}
        {sim && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Sim Status</h3>
                  <Badge variant={sim.is_public ? "default" : "secondary"}>
                    {sim.is_public ? "Public" : "Private"}
                  </Badge>
                </div>
                
                {sim.custom_url && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">URL: </span>
                    <span className="font-mono">/{sim.custom_url}</span>
                  </div>
                )}
                
                <Button 
                  onClick={handleMakePublic}
                  variant={sim.is_public ? "outline" : "default"}
                  disabled={isLoading}
                  className="w-full"
                >
                  {sim.is_public ? "Make Private" : "Make Public"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Tabs */}
        <Card>
          <CardContent className="p-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('basic-info')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'basic-info'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <User className="inline-block w-4 h-4 mr-2" />
                Basic Info
              </button>
              <button
                onClick={() => setActiveTab('interaction-model')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'interaction-model'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <MessageCircle className="inline-block w-4 h-4 mr-2" />
                Interaction Model
              </button>
              <button
                onClick={() => setActiveTab('core-knowledge')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'core-knowledge'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <BookOpen className="inline-block w-4 h-4 mr-2" />
                Core Knowledge
              </button>
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default MySim;
