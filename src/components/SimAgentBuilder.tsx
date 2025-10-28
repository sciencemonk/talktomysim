import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface SimAgentBuilderProps {
  simId: string;
  editCode: string;
}

export function SimAgentBuilder({ simId, editCode }: SimAgentBuilderProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Agent Builder</CardTitle>
          <CardDescription>
            Advanced agent customization features are coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Custom trigger-response interactions</li>
            <li>• Conversation flow builders</li>
            <li>• Integration with external APIs</li>
            <li>• Advanced personality tuning</li>
            <li>• Custom function calling</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
