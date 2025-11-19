import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from "lucide-react";

interface Review {
  reviewer_name: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  productTitle: string;
}

export const ReviewModal = ({ isOpen, onClose, review, productTitle }: ReviewModalProps) => {
  if (!review) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Customer Review for {productTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-lg">{review.reviewer_name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(review.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-base leading-relaxed">{review.comment}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
