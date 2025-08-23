
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { User, MessageCircle, BookOpen, ExternalLink, Settings, Globe, FileText, BarChart3 } from "lucide-react";
import { useSim } from "@/hooks/useSim";
import { promptGenerationService } from "@/services/promptGenerationService";
import { toast } from "sonner";
import { ConversationsDashboard } from './ConversationsDashboard';

const MySim = () => {
  const {
    sim,
    completionStatus,
    isLoading,
    updateBasicInfo
  } = useSim();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your sim...</p>
        </div>
      </div>;
  }

  return <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Compact Header Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={sim?.avatar_url} alt={sim?.name || "Sim Avatar"} />
              <AvatarFallback>
                {sim?.name?.charAt(0)?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">
                {sim?.name || "Unnamed Sim"}
              </h3>
              {sim?.professional_title && (
                <p className="text-sm text-muted-foreground truncate">{sim.professional_title}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              </div>
            </div>
            <Button variant="outline" asChild size="sm" className="flex-shrink-0">
              <a href={`/${sim?.custom_url || sim?.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Talk to Your Sim
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conversations Section */}
      <ConversationsDashboard advisorId={sim?.id || 'demo'} />

      {/* Analytics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Advanced analytics and insights will be available here
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground">
              Detailed conversation analytics, conversion rates, and performance metrics coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};

export default MySim;
