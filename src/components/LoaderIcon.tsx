import { cn } from "@/lib/utils";
import aiLoadingGif from "@/assets/ai-loading.gif";

interface LoaderIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export function LoaderIcon({ className, size = 16, ...props }: LoaderIconProps) {
  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <img 
        src={aiLoadingGif} 
        alt="Loading..." 
        style={{ width: size, height: size }}
        className="object-contain"
      />
    </div>
  );
}
