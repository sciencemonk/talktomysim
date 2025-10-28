import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSimLike, getLikeCount, isSimLiked } from "@/services/simLikesService";
import { cn } from "@/lib/utils";

interface SimLikeButtonProps {
  simId: string;
  initialLiked?: boolean;
  initialCount?: number;
  variant?: 'default' | 'compact';
  className?: string;
  onLikeChange?: (liked: boolean, count: number) => void;
}

export const SimLikeButton = ({ 
  simId, 
  initialLiked = false, 
  initialCount = 0,
  variant = 'default',
  className,
  onLikeChange
}: SimLikeButtonProps) => {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load initial state
    const loadLikeState = async () => {
      const [isLikedResult, countResult] = await Promise.all([
        isSimLiked(simId),
        getLikeCount(simId)
      ]);
      setLiked(isLikedResult);
      setCount(countResult);
    };
    
    loadLikeState();
  }, [simId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const result = await toggleSimLike(simId);
      setLiked(result.liked);
      setCount(result.count);
      
      if (onLikeChange) {
        onLikeChange(result.liked, result.count);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-1 text-xs transition-all",
          liked ? "text-red-500" : "text-muted-foreground hover:text-red-500",
          isLoading && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Heart 
          className={cn(
            "h-3.5 w-3.5 transition-all",
            liked && "fill-current"
          )} 
        />
        <span className="font-medium">{count}</span>
      </button>
    );
  }

  return (
    <Button
      onClick={handleLike}
      disabled={isLoading}
      variant="ghost"
      size="sm"
      className={cn(
        "gap-2 transition-all",
        liked && "text-red-500 hover:text-red-600",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-all",
          liked && "fill-current"
        )} 
      />
      <span className="text-sm font-medium">{count}</span>
    </Button>
  );
};
