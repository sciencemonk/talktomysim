
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MessageCircle, BookOpen, ExternalLink, Settings, Globe, Lock } from "lucide-react";
import { useSim } from "@/hooks/useSim";
import SimProgress from './SimProgress';

const MySim = () => {
  const {
    sim,
    completionStatus,
    isLoading,
    makeSimPublic
  } = useSim();

  const handleMakePublic = async () => {
    try {
      await makeSimPublic(!sim?.is_public);
    } catch (error) {
      console.error('Error updating sim visibility:', error);
    }
  };

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
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Sim Overview Card */}
        <Card className="flex-1">
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
                  <Badge variant={sim?.is_public ? "default" : "secondary"} className="text-xs">
                    {sim?.is_public ? <>
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </> : <>
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </>}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleMakePublic} variant={sim?.is_public ? "outline" : "default"} disabled={isLoading} size="sm">
                {sim?.is_public ? "Make Private" : "Make Public"}
              </Button>
              {sim?.is_public && sim?.custom_url && <Button variant="outline" asChild size="sm">
                  <a href={`/${sim.custom_url}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Page
                  </a>
                </Button>}
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <div className="lg:w-80">
          <SimProgress completionStatus={completionStatus} />
        </div>
      </div>

      {/* Setup Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${completionStatus.basic_info ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <User className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm md:text-base">Basic Info</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {completionStatus.basic_info ? 'Complete' : 'Not started'}
                </p>
              </div>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-4 leading-relaxed">
              Set up your personal details, background, and profile information.
            </p>
            <Badge variant={completionStatus.basic_info ? "default" : "secondary"} className="text-xs">
              {completionStatus.basic_info ? 'Complete' : 'Pending'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${completionStatus.interaction_model ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm md:text-base">Interaction Model</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {completionStatus.interaction_model ? 'Complete' : 'Not started'}
                </p>
              </div>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-4 leading-relaxed">
              Define how your sim communicates and responds to questions.
            </p>
            <Badge variant={completionStatus.interaction_model ? "default" : "secondary"} className="text-xs">
              {completionStatus.interaction_model ? 'Complete' : 'Pending'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${completionStatus.core_knowledge ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm md:text-base">Core Knowledge</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {completionStatus.core_knowledge ? 'Complete' : 'Not started'}
                </p>
              </div>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-4 leading-relaxed">
              Upload documents and knowledge base for your sim's expertise.
            </p>
            <Badge variant={completionStatus.core_knowledge ? "default" : "secondary"} className="text-xs">
              {completionStatus.core_knowledge ? 'Complete' : 'Pending'}
            </Badge>
          </CardContent>
        </Card>
      </div>

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
                  {sim.is_public ? 'Yes' : 'No'}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">Public Status</p>
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
