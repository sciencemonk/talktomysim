
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  AlertTriangle, 
  Users, 
  Clock, 
  Mail, 
  Phone, 
  CheckCircle,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { escalationService, ConversationCapture } from '@/services/escalationService';
import { conversationService } from '@/services/conversationService';
import { toast } from 'sonner';

interface ConversationsDashboardProps {
  advisorId: string;
}

interface ConversationSummary {
  id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  latest_message: string;
  avg_score: number;
  highest_score: number;
  intents: string[];
  escalated: boolean;
}

export const ConversationsDashboard = ({ advisorId }: ConversationsDashboardProps) => {
  const [captures, setCaptures] = useState<ConversationCapture[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('captures');

  useEffect(() => {
    loadData();
  }, [advisorId]);

  const loadData = async () => {
    setIsLoading(true);
    
    // Load conversation captures
    const captureData = await escalationService.getConversationCaptures(advisorId);
    setCaptures(captureData);

    // For now, we'll create mock conversation summaries
    // In a real implementation, you'd query the conversations and messages tables
    const mockConversations: ConversationSummary[] = [
      {
        id: '1',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        message_count: 8,
        latest_message: "I'm the CEO of a startup and we need to discuss a potential partnership deal...",
        avg_score: 8.5,
        highest_score: 10,
        intents: ['vip_inquiry', 'sales_inquiry'],
        escalated: true,
      },
      {
        id: '2',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        message_count: 12,
        latest_message: "This is urgent! I need help with my purchase order before the deadline...",
        avg_score: 7.2,
        highest_score: 9,
        intents: ['urgent_request', 'sales_inquiry'],
        escalated: true,
      },
      {
        id: '3',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        message_count: 5,
        latest_message: "Can you help me understand your pricing structure?",
        avg_score: 4.2,
        highest_score: 6,
        intents: ['general'],
        escalated: false,
      },
    ];
    
    setConversations(mockConversations);
    setIsLoading(false);
  };

  const handleUpdateCaptureStatus = async (captureId: string, status: ConversationCapture['status']) => {
    const success = await escalationService.updateCaptureStatus(captureId, status);
    
    if (success) {
      setCaptures(captures.map(capture => 
        capture.id === captureId ? { ...capture, status } : capture
      ));
      toast.success(`Contact marked as ${status}`);
    } else {
      toast.error('Failed to update contact status');
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 6) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getIntentBadgeColor = (intent: string) => {
    switch (intent) {
      case 'vip_inquiry':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sales_inquiry':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'urgent_request':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Conversations & Leads
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Monitor escalated conversations and captured contact information
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
            <TabsTrigger value="captures" className="flex items-center gap-2 py-3 px-4 text-xs sm:text-sm">
              <Users className="h-4 w-4" />
              <span className="truncate">Contacts ({captures.length})</span>
            </TabsTrigger>
            <TabsTrigger value="escalated" className="flex items-center gap-2 py-3 px-4 text-xs sm:text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span className="truncate">Escalated ({conversations.filter(c => c.escalated).length})</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2 py-3 px-4 text-xs sm:text-sm">
              <MessageSquare className="h-4 w-4" />
              <span className="truncate">All ({conversations.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="captures" className="mt-6">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {captures.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No captured contacts yet</p>
                    <p className="text-sm text-muted-foreground">
                      Contacts will appear here when conversations meet your escalation criteria
                    </p>
                  </div>
                ) : (
                  captures.map((capture) => (
                    <Card key={capture.id} className="p-4">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0 w-full sm:w-auto">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={getScoreBadgeColor(capture.conversation_score)}
                            >
                              Score: {capture.conversation_score}
                            </Badge>
                            <Badge variant="outline">
                              {capture.message_count} messages
                            </Badge>
                            <Badge 
                              variant={capture.status === 'new' ? 'destructive' : 'secondary'}
                            >
                              {capture.status}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            {capture.name && (
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 flex-shrink-0" />
                                <span className="font-medium truncate">{capture.name}</span>
                              </div>
                            )}
                            {capture.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{capture.email}</span>
                              </div>
                            )}
                            {capture.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{capture.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <strong>Trigger:</strong> {capture.trigger_reason}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(capture.created_at)}
                          </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                          {capture.status === 'new' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateCaptureStatus(capture.id, 'contacted')}
                              className="flex-1 sm:flex-none"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Contacted
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="flex-shrink-0">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="escalated" className="mt-6">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {conversations.filter(c => c.escalated).map((conversation) => (
                  <Card key={conversation.id} className="p-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0 w-full sm:w-auto">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={getScoreBadgeColor(conversation.highest_score)}
                          >
                            Peak Score: {conversation.highest_score}
                          </Badge>
                          <Badge variant="outline">
                            {conversation.message_count} messages
                          </Badge>
                          {conversation.intents.map((intent) => (
                            <Badge 
                              key={intent}
                              variant="outline" 
                              className={getIntentBadgeColor(intent)}
                            >
                              {intent.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {conversation.latest_message}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Updated {formatTimeAgo(conversation.updated_at)}
                        </div>
                      </div>

                      <Button size="sm" variant="outline" className="w-full sm:w-auto flex-shrink-0">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        View Chat
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <Card key={conversation.id} className="p-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0 w-full sm:w-auto">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={getScoreBadgeColor(conversation.avg_score)}
                          >
                            Avg Score: {conversation.avg_score}
                          </Badge>
                          <Badge variant="outline">
                            {conversation.message_count} messages
                          </Badge>
                          {conversation.escalated && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Escalated
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {conversation.latest_message}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Updated {formatTimeAgo(conversation.updated_at)}
                        </div>
                      </div>

                      <Button size="sm" variant="outline" className="w-full sm:w-auto flex-shrink-0">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        View Chat
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
