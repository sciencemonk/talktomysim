import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MessageCircle, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CreditUsageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserCredits {
  total_credits: number;
  used_credits: number;
  reset_date: string;
}

interface UsageLog {
  id: string;
  credits_used: number;
  usage_type: string;
  created_at: string;
  conversation_id: string | null;
}

export const CreditUsageModal = ({ open, onOpenChange }: CreditUsageModalProps) => {
  const { data: credits, isLoading } = useQuery({
    queryKey: ['user-credits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If user doesn't have credits record, create one
        const { data: newCredits, error: insertError } = await supabase
          .from('user_credits')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        return newCredits as UserCredits;
      }

      return data as UserCredits;
    },
    enabled: open,
  });

  const { data: usageLogs } = useQuery({
    queryKey: ['credit-usage-log'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('credit_usage_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as UsageLog[];
    },
    enabled: open,
  });

  const percentageRemaining = credits
    ? ((credits.total_credits - credits.used_credits) / credits.total_credits) * 100
    : 100;

  const remainingCredits = credits
    ? credits.total_credits - credits.used_credits
    : 0;

  const resetDate = credits
    ? new Date(credits.reset_date)
    : new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chat Credits Usage</DialogTitle>
          <DialogDescription>
            Track your monthly chat credit usage and history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Credits Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credits Remaining</p>
                <p className="text-3xl font-bold">{remainingCredits}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-semibold">{credits?.total_credits || 1000}</p>
              </div>
            </div>

            <Progress value={percentageRemaining} className="h-3" />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{credits?.used_credits || 0} credits used</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Resets {formatDistanceToNow(resetDate, { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Usage Breakdown */}
          {usageLogs && usageLogs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recent Activity
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {usageLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {log.usage_type === 'owner_chat' && 'Your Chat'}
                          {log.usage_type === 'public_chat' && 'Public Chat'}
                          {log.usage_type === 'chat' && 'Chat Message'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">-{log.credits_used}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">How Credits Work</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 1 credit per message sent or received</li>
              <li>• Credits reset monthly on {resetDate.toLocaleDateString()}</li>
              <li>• Track your usage to stay within your limit</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
