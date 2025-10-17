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

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Already connected');
      return;
    }

    console.log('Connecting to PumpPortal WebSocket...');
    const ws = new WebSocket('wss://pumpportal.fun/api/data');

    ws.onopen = () => {
      console.log('Connected to PumpPortal');
      setIsConnected(true);
      
      // Subscribe to trades for this specific token
      ws.send(JSON.stringify({
        method: 'subscribeTokenTrade',
        keys: [tokenAddress]
      }));
      
      console.log(`Subscribed to trades for token: ${tokenAddress}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;
        
        if (data.txType === 'create' || data.txType === 'buy' || data.txType === 'sell') {
          const trade: TradeEvent = {
            signature: data.signature,
            mint: data.mint,
            sol_amount: data.solAmount / 1e9, // Convert lamports to SOL
            token_amount: data.tokenAmount,
            is_buy: data.isBuy,
            user: data.user,
            timestamp: data.timestamp,
            market_cap_sol: data.marketCapSol / 1e9
          };
          
          console.log('New trade:', trade);
          setLatestTrade(trade);
          setTrades(prev => [trade, ...prev].slice(0, 50)); // Keep last 50 trades
        }
      } catch (error) {
        console.error('Error parsing trade data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from PumpPortal');
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [tokenAddress]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    trades,
    isConnected,
    latestTrade,
    reconnect: connect
  };
};
