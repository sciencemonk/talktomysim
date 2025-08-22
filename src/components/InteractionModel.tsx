
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const InteractionModel = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Interaction Model</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Define how your sim communicates and interacts. Set communication style, tone, and behavioral patterns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractionModel;
