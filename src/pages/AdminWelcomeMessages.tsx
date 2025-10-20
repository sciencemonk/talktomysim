import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminWelcomeMessages() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const generateWelcomeMessages = async () => {
    setIsGenerating(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-welcome-messages');

      if (error) throw error;

      setResults(data);
      toast.success(`Successfully updated ${data.updated} welcome messages!`);
    } catch (error) {
      console.error('Error generating welcome messages:', error);
      toast.error('Failed to generate welcome messages');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Welcome Messages</CardTitle>
          <CardDescription>
            Generate unique welcome messages for all historical sims
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={generateWelcomeMessages} 
            disabled={isGenerating}
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Welcome Messages'
            )}
          </Button>

          {results && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold">Results:</h3>
              <p>Updated {results.updated} sims</p>
              {results.updates?.map((update: any) => (
                <div key={update.name} className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{update.name}</p>
                  <p className="text-sm text-muted-foreground">{update.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
