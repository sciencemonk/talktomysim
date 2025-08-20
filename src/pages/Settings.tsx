
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

const Settings = () => {
  const { user } = useAuth();
  
  // Auto-save state
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Auto-save function (placeholder - would integrate with actual backend)
  const autoSave = (key: string, value: any) => {
    console.log(`Auto-saving ${key}:`, value);
    // Here you would implement the actual save logic
  };

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    autoSave('notifications', checked);
  };

  const handleEmailUpdatesChange = (checked: boolean) => {
    setEmailUpdates(checked);
    autoSave('emailUpdates', checked);
  };

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    autoSave('darkMode', checked);
  };

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    // Debounce auto-save for text inputs
    setTimeout(() => autoSave('displayName', value), 1000);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Update your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about important updates
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={handleNotificationsChange}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly email updates about your progress
              </p>
            </div>
            <Switch
              checked={emailUpdates}
              onCheckedChange={handleEmailUpdatesChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the application looks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={handleDarkModeChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
