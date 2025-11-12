import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CoinbaseSignIn } from '@/components/CoinbaseSignIn';

const SignIn = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/directory');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return <CoinbaseSignIn />;
};

export default SignIn;
