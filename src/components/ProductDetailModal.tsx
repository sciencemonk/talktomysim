import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X402PaymentModal } from "./X402PaymentModal";
import { Package, DollarSign, Info } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url?: string;
  image_urls?: string[];
  is_active: boolean;
  delivery_info?: string;
  store_id: string;
  checkout_fields?: {
    email?: boolean;
    name?: boolean;
    phone?: boolean;
    address?: boolean;
    wallet?: boolean;
  };
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  storeWalletAddress: string;
  storeName: string;
}

export const ProductDetailModal = ({
  product,
  isOpen,
  onClose,
  storeWalletAddress,
  storeName,
}: ProductDetailModalProps) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) return null;

  const images = product.image_urls && Array.isArray(product.image_urls) 
    ? product.image_urls 
    : product.image_url 
    ? [product.image_url] 
    : [];

  const handlePurchase = () => {
    if (!storeWalletAddress) {
      toast.error("Store wallet not configured");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (sessionId: string) => {
    console.log("Payment successful:", sessionId);
    toast.success("Purchase successful! Check your email for delivery details.");
    setShowPaymentModal(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !showPaymentModal} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{product.title}</DialogTitle>
            <DialogDescription className="sr-only">
              Product details and purchase information
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Images */}
            <div className="space-y-4">
              {images.length > 0 ? (
                <>
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                    <img
                      src={images[selectedImageIndex]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`aspect-square overflow-hidden rounded border-2 transition-colors ${
                            selectedImageIndex === idx
                              ? "border-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.title} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Price and Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">
                    ${formatPrice(product.price)}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    {product.currency}
                  </span>
                </div>
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? "Available" : "Unavailable"}
                </Badge>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Delivery Info */}
              {product.delivery_info && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Delivery Information</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {product.delivery_info}
                  </p>
                </div>
              )}

              {/* Purchase Button */}
              <Button
                onClick={handlePurchase}
                disabled={!product.is_active}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {product.is_active ? "Purchase with x402" : "Currently Unavailable"}
              </Button>

              {/* Payment Info */}
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>Secure payment via x402 protocol on Solana</p>
                <p>Payment will be sent to: {storeName}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* X402 Payment Modal */}
      <X402PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        simName={`${storeName} - ${product.title}`}
        price={product.price}
        walletAddress={storeWalletAddress}
        product={{
          id: product.id,
          title: product.title,
          checkout_fields: product.checkout_fields
        }}
        storeId={product.store_id}
      />
    </>
  );
};
