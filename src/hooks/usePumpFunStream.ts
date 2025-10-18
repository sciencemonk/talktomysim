import { useState, useEffect, useCallback, useRef } from 'react';

interface TradeEvent {
  signature: string;
  mint: string;
  sol_amount: number;
  token_amount: number;
  is_buy: boolean;
  user: string;
  timestamp: number;
  market_cap_sol: number;
}

interface StreamEvent {
  txType: string;
  signature: string;
  mint: string;
  solAmount: number;
  tokenAmount: number;
  isBuy: boolean;
  user: string;
  timestamp: number;
  marketCapSol: number;
}

export const usePumpFunStream = (tokenAddress: string) => {
  const [trades, setTrades] = useState<TradeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [latestTrade, setLatestTrade] = useState<TradeEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    // Prevent duplicate connections
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    console.log(`[WebSocket] Connecting to PumpPortal... (Attempt ${reconnectAttemptsRef.current + 1})`);
    const ws = new WebSocket('wss://pumpportal.fun/api/data');

    ws.onopen = () => {
      console.log('[WebSocket] ✅ Connected to PumpPortal');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0; // Reset reconnection counter on success
      
      // Subscribe to trades for this specific token
      const subscribeMessage = {
        method: 'subscribeTokenTrade',
        keys: [tokenAddress]
      };
      
      ws.send(JSON.stringify(subscribeMessage));
      console.log(`[WebSocket] 📡 Subscribed to token: ${tokenAddress}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Log EVERYTHING we receive
        console.log('[WebSocket] 📨 Raw message received:', JSON.stringify(data, null, 2));
        
        // Check for various trade message patterns
        // PumpPortal might send txType, signature, or other identifying fields
        const isTradeMessage = data.txType || data.signature || data.sig || data.txHash || 
                              (data.mint && (data.solAmount || data.tokenAmount));
        
        if (isTradeMessage) {
          console.log('[WebSocket] 🎯 Trade detected! All fields:', Object.keys(data));
          
          const trade: TradeEvent = {
            signature: data.signature || data.sig || data.txHash || `trade_${Date.now()}`,
            mint: data.mint || tokenAddress,
            sol_amount: Number((data.solAmount || data.sol_amount || data.sol || 0).toFixed(3)),
            token_amount: Math.round(data.tokenAmount || data.token_amount || data.amount || 0),
            is_buy: data.txType === 'buy' || data.isBuy === true || data.is_buy === true || data.type === 'buy',
            user: data.user || data.traderPublicKey || data.trader || data.wallet || 'unknown',
            timestamp: data.timestamp || Date.now() / 1000,
            market_cap_sol: data.marketCapSol || data.market_cap_sol || data.marketCap || 0
          };
          
          console.log('[WebSocket] 🔔 Processed trade:', {
            type: trade.is_buy ? 'BUY' : 'SELL',
            tokenAmount: trade.token_amount,
            solAmount: trade.sol_amount,
            signature: trade.signature.substring(0, 20) + '...',
            allData: data
          });
          
          setLatestTrade(trade);
          setTrades(prev => [trade, ...prev].slice(0, 50));
        } else {
          console.log('[WebSocket] ℹ️ Non-trade message. Type:', data.type || 'unknown', 'Fields:', Object.keys(data));
        }
      } catch (error) {
        console.error('[WebSocket] ❌ Error parsing message:', error);
        console.log('[WebSocket] Raw event data:', event.data);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] ❌ WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      console.log(`[WebSocket] 🔌 Disconnected from PumpPortal (Code: ${event.code}, Reason: ${event.reason || 'none'})`);
      setIsConnected(false);
      wsRef.current = null;
      
      // Implement exponential backoff reconnection
      const maxReconnectAttempts = 10;
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000); // Max 30 seconds
        console.log(`[WebSocket] 🔄 Reconnecting in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        console.error('[WebSocket] ⛔ Max reconnection attempts reached. Please refresh the page.');
      }
    };

    wsRef.current = ws;
  }, [tokenAddress]);

  const disconnect = useCallback(() => {
    console.log('[WebSocket] 🛑 Manual disconnect');
    
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      // Clean up on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [tokenAddress]); // Only reconnect when token address changes

  return {
    trades,
    isConnected,
    latestTrade,
    reconnect: connect
  };
};
