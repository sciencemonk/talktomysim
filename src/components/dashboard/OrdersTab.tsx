import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { Package, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Order {
  id: string;
  created_at: string;
  product_id: string;
  amount: number;
  currency: string;
  buyer_email: string | null;
  buyer_name: string | null;
  buyer_phone: string | null;
  buyer_address: any;
  payment_signature: string | null;
  status: string;
  updated_at: string | null;
  products: {
    id: string;
    name: string;
    description: string;
    price: number;
  };
}

interface OrdersTabProps {
  store: any;
}

export const OrdersTab = ({ store }: OrdersTabProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (store?.id) {
      loadOrders();
    }
  }, [store?.id]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('orders')
        .select(`
          *,
          products (
            id,
            name,
            description,
            price
          )
        `)
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success(`Order marked as ${newStatus}`);
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">
          Manage and track your store orders
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {order.products.name}
                    </CardTitle>
                    <CardDescription>
                      Order placed {format(new Date(order.created_at), 'PPp')}
                    </CardDescription>
                  </div>
                  <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                    {order.status === "completed" ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {order.status}
                      </span>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{order.amount} {order.currency}</span>
                  </div>
                  {order.buyer_name && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Customer:</span>
                      <span>{order.buyer_name}</span>
                    </div>
                  )}
                  {order.buyer_email && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-xs">{order.buyer_email}</span>
                    </div>
                  )}
                  {order.payment_signature && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment:</span>
                      <span className="font-mono text-xs">
                        {order.payment_signature.slice(0, 8)}...
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    {order.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleUpdateStatus(order, "completed")}
                        className="flex-1"
                      >
                        Mark as Completed
                      </Button>
                    )}
                    {order.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(order, "pending")}
                        className="flex-1"
                      >
                        Mark as Pending
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openOrderDetails(order)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View and manage order information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Product</h4>
                <p className="text-sm">{selectedOrder.products.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedOrder.products.description}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Order Information</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{selectedOrder.amount} {selectedOrder.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span>{selectedOrder.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit Price:</span>
                    <span>${selectedOrder.products.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {(selectedOrder.buyer_name || selectedOrder.buyer_email || selectedOrder.buyer_phone) && (
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    {selectedOrder.buyer_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{selectedOrder.buyer_name}</span>
                      </div>
                    )}
                    {selectedOrder.buyer_email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="text-xs">{selectedOrder.buyer_email}</span>
                      </div>
                    )}
                    {selectedOrder.buyer_phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{selectedOrder.buyer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {selectedOrder.payment_signature && (
                <div>
                  <h4 className="font-semibold mb-2">Payment Signature</h4>
                  <p className="text-xs font-mono break-all bg-muted p-2 rounded">
                    {selectedOrder.payment_signature}
                  </p>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
