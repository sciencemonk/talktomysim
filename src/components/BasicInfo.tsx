
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BasicInfo = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Set up your sim's basic information including name, background, education, and personal details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInfo;
