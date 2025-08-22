
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MySim = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Sim</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is where you'll manage your personal AI sim. Configure your sim's personality, knowledge, and behavior patterns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MySim;
