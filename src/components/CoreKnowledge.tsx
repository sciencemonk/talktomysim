
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CoreKnowledge = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Core Knowledge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Upload and manage the knowledge base for your sim. Add documents, expertise areas, and specialized information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoreKnowledge;
