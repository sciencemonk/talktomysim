import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, TrendingUp, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SimUsageStatsProps {
  simId: string;
}

interface Stats {
  totalConversations: number;
  totalMessages: number;
  uniqueUsers: number;
  avgMessagesPerConversation: number;
  lastActiveAt: string | null;
}

export function SimUsageStats({ simId }: SimUsageStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (simId) {
      loadStats();
    }
  }, [simId]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Get conversation count and unique users
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id, user_id, updated_at')
        .eq('tutor_id', simId);

      if (convError) throw convError;

      const totalConversations = conversations?.length || 0;
      const uniqueUsers = new Set(conversations?.map(c => c.user_id).filter(Boolean) || []).size;
      const lastActiveAt = conversations && conversations.length > 0
        ? conversations.sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )[0].updated_at
        : null;

      // Get message count
      const conversationIds = conversations?.map(c => c.id) || [];
      let totalMessages = 0;

      if (conversationIds.length > 0) {
        const { count, error: msgError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversationIds);

        if (msgError) throw msgError;
        totalMessages = count || 0;
      }

      const avgMessagesPerConversation = totalConversations > 0
        ? Math.round(totalMessages / totalConversations)
        : 0;

      setStats({
        totalConversations,
        totalMessages,
        uniqueUsers,
        avgMessagesPerConversation,
        lastActiveAt,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalConversations || 0}</div>
            <p className="text-xs text-muted-foreground">
              All-time conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.uniqueUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.avgMessagesPerConversation || 0} avg msgs/conv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(stats?.lastActiveAt || null)}</div>
            <p className="text-xs text-muted-foreground">
              Most recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
          <CardDescription>
            Statistics for your Sim's interactions with users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Engagement Rate</span>
              <span className="text-sm font-medium">
                {stats?.totalConversations && stats.uniqueUsers > 0
                  ? `${Math.round((stats.totalConversations / stats.uniqueUsers) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Messages per User</span>
              <span className="text-sm font-medium">
                {stats?.uniqueUsers && stats.totalMessages > 0
                  ? Math.round(stats.totalMessages / stats.uniqueUsers)
                  : 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Conversation Length</span>
              <span className="text-sm font-medium">
                {stats?.avgMessagesPerConversation || 0} messages
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
