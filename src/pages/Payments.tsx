import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Wallet, TrendingUp, DollarSign, Copy, AlertCircle, Save, Package, Clock, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const solanaAddressSchema = z.string()
  .trim()
  .min(32, "Solana address must be at least 32 characters")
  .max(44, "Solana address must be at most 44 characters")
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address format");

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
  custom_field_data: any;
  payment_signature: string | null;
  status: string;
  updated_at: string | null;
  products: {
    id: string;
    title: string;
    description: string;
    price: number;
  };
}

interface PaymentsProps {
  store: any;
}

export default function Payments({ store: initialStore }: PaymentsProps) {
  const { user } = useAuth();
  const { connection } = useConnection();
  const [store, setStore] = useState<any>(initialStore);
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    transactions: 0
  });
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [editingWallet, setEditingWallet] = useState(false);
  const [newSolanaWallet, setNewSolanaWallet] = useState("");
  const [savingWallet, setSavingWallet] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

  useEffect(() => {
    if (user) {
      console.log('Current user:', user.id);
      loadEarningsData();
    }
  }, [user]);

  useEffect(() => {
    if (store?.crypto_wallet) {
      loadWalletBalance();
    }
  }, [store?.crypto_wallet]);

  useEffect(() => {
    if (store?.id) {
      console.log('Store loaded:', { id: store.id, user_id: store.user_id, username: store.x_username });
      loadOrders();
    }
  }, [store?.id]);

  // Reload orders when page becomes visible (user returns from another tab/window)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && store?.id) {
        console.log('Page visible, reloading orders...');
        loadOrders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [store?.id]);

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      console.log('Loading orders for store:', store.id);
      
      const { data, error } = await (supabase as any)
        .from('orders')
        .select(`
          *,
          products (
            id,
            title,
            description,
            price
          )
        `)
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

      console.log('Orders query result:', { data, error, count: data?.length });
      
      if (error) {
        console.error('Orders query error:', error);
        throw error;
      }
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
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
      loadEarningsData(); // Refresh earnings after status change
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const loadWalletBalance = async () => {
    if (!store?.crypto_wallet) return;
    
    try {
      const walletPubkey = new PublicKey(store.crypto_wallet);
      const tokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        walletPubkey
      );

      const accountInfo = await getAccount(connection, tokenAccount);
      const balance = Number(accountInfo.amount) / 1_000_000; // USDC has 6 decimals
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
      setWalletBalance(0);
    }
  };

  const handleSaveSolanaWallet = async () => {
    try {
      // Validate the Solana address
      const validation = solanaAddressSchema.safeParse(newSolanaWallet);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      // Verify it's a valid Solana public key
      try {
        new PublicKey(newSolanaWallet);
      } catch {
        toast.error("Invalid Solana address format");
        return;
      }

      setSavingWallet(true);

      const { error } = await supabase
        .from('stores')
        .update({ crypto_wallet: newSolanaWallet })
        .eq('id', store.id);

      if (error) throw error;

      setStore({ ...store, crypto_wallet: newSolanaWallet });
      setEditingWallet(false);
      toast.success("Solana wallet address saved successfully");
      loadWalletBalance();
    } catch (error) {
      console.error('Error saving wallet:', error);
      toast.error("Failed to save wallet address");
    } finally {
      setSavingWallet(false);
    }
  };

  const handleCopySolanaWallet = async () => {
    if (!store?.crypto_wallet) return;
    
    try {
      await navigator.clipboard.writeText(store.crypto_wallet);
      toast.success('Wallet address copied!');
    } catch (error) {
      toast.error('Failed to copy wallet address');
    }
  };

  const loadEarningsData = async () => {
    try {
      setLoading(true);

      // Load store data
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

      // Load orders for earnings calculation
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('amount, created_at, status')
        .eq('store_id', storeData.id)
        .eq('status', 'completed');

      if (ordersError) throw ordersError;

      // Calculate earnings
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalEarnings = orders?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
      const monthlyEarnings = orders?.filter(o => new Date(o.created_at) >= startOfMonth)
        .reduce((sum, o) => sum + Number(o.amount), 0) || 0;

      setEarnings({
        total: totalEarnings,
        thisMonth: monthlyEarnings,
        transactions: orders?.length || 0
      });

    } catch (error) {
      console.error('Error loading earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Track your store revenue and payment wallet
        </p>
      </div>

      {/* Solana Payment Wallet Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Solana Payment Wallet
          </CardTitle>
          <CardDescription>
            Your store receives USDC payments on Solana. Connect a Phantom or Solflare wallet address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!store?.crypto_wallet && !editingWallet && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Required:</strong> Add your Solana wallet address to receive payments. You cannot create products without this.
              </AlertDescription>
            </Alert>
          )}

          {editingWallet || !store?.crypto_wallet ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="solana-wallet">Solana Wallet Address</Label>
                <Input
                  id="solana-wallet"
                  type="text"
                  placeholder="Enter your Solana wallet address (32-44 characters)"
                  value={newSolanaWallet}
                  onChange={(e) => setNewSolanaWallet(e.target.value.trim())}
                  className="font-mono"
                  maxLength={44}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be a valid Solana address from Phantom, Solflare, or another Solana wallet
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveSolanaWallet}
                  disabled={savingWallet || !newSolanaWallet}
                >
                  {savingWallet ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Wallet
                    </>
                  )}
                </Button>
                {store?.crypto_wallet && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingWallet(false);
                      setNewSolanaWallet("");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <code className="flex-1 text-sm font-mono break-all">
                  {store.crypto_wallet}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopySolanaWallet}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Solana Mainnet • Configured</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingWallet(true);
                    setNewSolanaWallet(store.crypto_wallet);
                  }}
                >
                  Update Wallet
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Earnings Overview */}
      <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${earnings.total.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                USDC on Base
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Month
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${earnings.thisMonth.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transactions
              </CardTitle>
              <Badge variant="secondary">{earnings.transactions}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {earnings.transactions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed sales
              </p>
            </CardContent>
        </Card>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Orders</h3>
            <p className="text-sm text-muted-foreground">
              Track and manage your store orders
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={ordersLoading}
          >
            {ordersLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-muted-foreground">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
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
                      <CardTitle className="text-base">
                        {order.products?.title || "Product"}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={order.status === "completed" ? "default" : "secondary"}
                    >
                      {order.status === "completed" ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-semibold">
                      {order.amount} {order.currency}
                    </span>
                  </div>

                  {order.buyer_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Customer</span>
                      <span className="text-sm">{order.buyer_name}</span>
                    </div>
                  )}

                  {order.buyer_email && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="text-sm">{order.buyer_email}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {order.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(order, "completed")}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {order.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(order, "pending")}
                      >
                        Mark Pending
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information about this order
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Product Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Product:</span>{" "}
                      <span>{selectedOrder.products?.title}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Description:</span>{" "}
                      <p className="mt-1">{selectedOrder.products?.description}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>{" "}
                      <span>${selectedOrder.products?.price}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Customer Details</h4>
                  <div className="space-y-2 text-sm">
                    {selectedOrder.buyer_name && (
                      <div>
                        <span className="text-muted-foreground">Name:</span>{" "}
                        <span>{selectedOrder.buyer_name}</span>
                      </div>
                    )}
                    {selectedOrder.buyer_email && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        <span>{selectedOrder.buyer_email}</span>
                      </div>
                    )}
                    {selectedOrder.buyer_phone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span>{" "}
                        <span>{selectedOrder.buyer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedOrder.buyer_address && (
                <div>
                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                  <div className="text-sm space-y-1">
                    <p>{selectedOrder.buyer_address.street}</p>
                    <p>
                      {selectedOrder.buyer_address.city}, {selectedOrder.buyer_address.state}{" "}
                      {selectedOrder.buyer_address.zip}
                    </p>
                    <p>{selectedOrder.buyer_address.country}</p>
                  </div>
                </div>
              )}

              {selectedOrder.custom_field_data && Object.keys(selectedOrder.custom_field_data).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Additional Information</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(selectedOrder.custom_field_data).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-muted-foreground">{key}:</span>{" "}
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Payment Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>{" "}
                    <span className="font-semibold">
                      {selectedOrder.amount} {selectedOrder.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <Badge variant={selectedOrder.status === "completed" ? "default" : "secondary"}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  {selectedOrder.payment_signature && (
                    <div className="break-all">
                      <span className="text-muted-foreground">Transaction:</span>{" "}
                      <a
                        href={`https://solscan.io/tx/${selectedOrder.payment_signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View on Solscan
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
