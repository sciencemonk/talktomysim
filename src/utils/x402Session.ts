/**
 * Validates and retrieves x402 payment session
 * Returns null if session is invalid or expired
 */
export const validateX402Session = (walletAddress: string): string | null => {
  try {
    const sessionKey = `x402_session_${walletAddress}`;
    const storedData = localStorage.getItem(sessionKey);
    
    if (!storedData) {
      return null;
    }

    const sessionData = JSON.parse(storedData);
    
    // Validate required fields - support both legacy (transactionHash) and Corbits (signature) formats
    const hasTransactionProof = sessionData.transactionHash || sessionData.signature;
    if (!sessionData.sessionId || !hasTransactionProof || !sessionData.expiresAt) {
      console.log('Invalid session data format - missing required fields');
      localStorage.removeItem(sessionKey);
      return null;
    }

    // Validate session ID format (should start with "x402_" or "corbits_")
    if (!sessionData.sessionId.startsWith('x402_') && !sessionData.sessionId.startsWith('corbits_')) {
      console.log('Invalid session ID format');
      localStorage.removeItem(sessionKey);
      return null;
    }

    // Check if session has expired
    if (Date.now() > sessionData.expiresAt) {
      console.log('Session expired');
      localStorage.removeItem(sessionKey);
      return null;
    }

    // Validate amount and wallet match
    if (sessionData.to?.toLowerCase() !== walletAddress.toLowerCase()) {
      console.log('Session wallet mismatch');
      localStorage.removeItem(sessionKey);
      return null;
    }

    console.log('Valid x402 session found:', {
      sessionId: sessionData.sessionId,
      proof: sessionData.transactionHash || sessionData.signature,
      provider: sessionData.provider || 'legacy',
      expiresIn: Math.round((sessionData.expiresAt - Date.now()) / (1000 * 60 * 60)) + ' hours'
    });

    return sessionData.sessionId;
  } catch (error) {
    console.error('Error validating x402 session:', error);
    return null;
  }
};
