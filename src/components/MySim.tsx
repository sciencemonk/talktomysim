
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { User, MessageCircle, BookOpen, ExternalLink, Settings, Globe, FileText } from "lucide-react";
import { useSim } from "@/hooks/useSim";
import { promptGenerationService } from "@/services/promptGenerationService";
import SimProgress from './SimProgress';

const MySim = () => {
  const {
    sim,
    completionStatus,
    isLoading
  } = useSim();
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Generate the current system prompt for the sim
  const generatedPrompt = sim ? promptGenerationService.generateSystemPrompt(sim) : null;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your sim...</p>
        </div>
      </div>;
  }

  return <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="flex items-start gap-3 md:gap-4">
            <Avatar className="h-12 w-12 md:h-16 md:w-16 flex-shrink-0">
              <AvatarImage src={sim?.avatar_url} alt={sim?.name || "Sim Avatar"} />
              <AvatarFallback>
                {sim?.name?.charAt(0)?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2 min-w-0">
              <h3 className="text-lg md:text-xl font-semibold truncate">
                {sim?.name || "Unnamed Sim"}
              </h3>
              {sim?.professional_title && <p className="text-sm md:text-base text-muted-foreground truncate">{sim.professional_title}</p>}
              {sim?.description && <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                  {sim.description}
                </p>}
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" asChild size="sm">
              <a href={`/${sim?.custom_url || sim?.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Share Sim
              </a>
            </Button>
            
            <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Edit Master Prompt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Master Prompt for {sim?.name || "Your Sim"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      This is the system prompt that defines how your Sim behaves and responds in conversations.
                    </p>
                  </div>
                  <Textarea
                    value={generatedPrompt?.systemPrompt || "No prompt generated yet"}
                    readOnly
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Progress Section */}
      <SimProgress completionStatus={completionStatus} />

      {/* Quick Stats */}
      {sim && <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-primary">
                  {Object.values(completionStatus).filter(Boolean).length}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">Steps Complete</p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-primary">
                  {Math.round(Object.values(completionStatus).filter(Boolean).length / 3 * 100)}%
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">Setup Progress</p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-primary">
                  Public
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">Status</p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-primary">
                  {sim.custom_url ? 'Set' : 'None'}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">Custom URL</p>
              </div>
            </div>
          </CardContent>
        </Card>}
    </div>;
};

export default MySim;
