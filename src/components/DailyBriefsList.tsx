import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Calendar, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DailyBrief {
  id: string;
  topic: string;
  brief_content: string;
  sources: any[];
  created_at: string;
  scheduled_time: string;
  read: boolean;
}

interface DailyBriefsListProps {
  advisorId: string;
}

const DailyBriefsList = ({ advisorId }: DailyBriefsListProps) => {
  const [briefs, setBriefs] = useState<DailyBrief[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBriefs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('daily-briefs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_briefs',
          filter: `advisor_id=eq.${advisorId}`
        },
        (payload) => {
          console.log('Daily brief change:', payload);
          if (payload.eventType === 'INSERT') {
            setBriefs(prev => [payload.new as DailyBrief, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setBriefs(prev => prev.map(b => b.id === payload.new.id ? payload.new as DailyBrief : b));
          } else if (payload.eventType === 'DELETE') {
            setBriefs(prev => prev.filter(b => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [advisorId]);

  const fetchBriefs = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('daily_briefs')
        .select('*')
        .eq('advisor_id', advisorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched briefs:', data);
      setBriefs((data || []) as DailyBrief[]);
    } catch (error) {
      console.error('Error fetching briefs:', error);
      toast({
        title: "Error",
        description: "Failed to load daily briefs",
        variant: "destructive"
      });
      setBriefs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (briefId: string) => {
    try {
      const { error } = await supabase
        .from('daily_briefs')
        .delete()
        .eq('id', briefId);

      if (error) throw error;

      setBriefs(briefs.filter(b => b.id !== briefId));
      toast({
        title: "Success",
        description: "Brief deleted"
      });
    } catch (error) {
      console.error('Error deleting brief:', error);
      toast({
        title: "Error",
        description: "Failed to delete brief",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsRead = async (briefId: string) => {
    try {
      const { error } = await supabase
        .from('daily_briefs')
        .update({ read: true })
        .eq('id', briefId);

      if (error) throw error;

      setBriefs(briefs.map(b => 
        b.id === briefId ? { ...b, read: true } : b
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (briefs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No daily briefs yet. They will appear here once generated.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {briefs.map((brief) => (
        <div
          key={brief.id}
          className={`p-4 rounded-lg border ${
            brief.read ? 'bg-background' : 'bg-muted/50'
          }`}
          onClick={() => !brief.read && handleMarkAsRead(brief.id)}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {!brief.read && (
                <Badge variant="default" className="text-xs">New</Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(brief.created_at).toLocaleDateString()} at{' '}
                {new Date(brief.created_at).toLocaleTimeString()}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Scheduled: {brief.scheduled_time}
              </span>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete brief?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this daily brief.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(brief.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="mb-3">
            <h4 className="font-semibold text-sm mb-1">Topic: {brief.topic}</h4>
          </div>

          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-6 mb-3 text-foreground" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-semibold mt-5 mb-3 text-foreground" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-4 mb-2 text-foreground" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-muted-foreground" {...props} />,
                ul: ({node, ...props}) => <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />,
                ol: ({node, ...props}) => <ol className="mb-4 ml-6 list-decimal space-y-2" {...props} />,
                li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                a: ({node, ...props}) => <a className="text-[#76da9a] hover:underline" {...props} target="_blank" rel="noopener noreferrer" />,
              }}
            >
              {brief.brief_content}
            </ReactMarkdown>
          </div>

          {brief.sources && brief.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-semibold mb-2 text-muted-foreground">Sources:</p>
              <ul className="text-xs space-y-1">
                {brief.sources.map((source: any, idx: number) => (
                  <li key={idx}>
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {source.title || source.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DailyBriefsList;
