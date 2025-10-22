import { useTheme } from "@/hooks/useTheme";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        className="data-[state=checked]:bg-primary"
      />
      <Label htmlFor="theme-toggle" className="text-sm cursor-pointer">
        {isDark ? "Dark" : "Light"}
      </Label>
    </div>
  );
}
