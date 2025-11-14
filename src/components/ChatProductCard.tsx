import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ChatProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    image_url?: string;
    image_urls?: string[];
  };
  onViewProduct: (productId: string) => void;
}

export const ChatProductCard = ({ product, onViewProduct }: ChatProductCardProps) => {
  const imageUrl = product.image_urls?.[0] || product.image_url;

  return (
    <Card className="max-w-sm my-2 overflow-hidden border-2 hover:border-primary/50 transition-colors">
      <CardContent className="p-0">
        {imageUrl ? (
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-muted flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-semibold text-lg mb-1">{product.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="text-2xl font-bold">
              ${formatPrice(product.price)}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {product.currency}
              </span>
            </div>
            
            <Button
              onClick={() => onViewProduct(product.id)}
              size="sm"
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
