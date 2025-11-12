-- Create stores table for X authenticated users
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  x_username TEXT NOT NULL UNIQUE,
  x_display_name TEXT,
  x_profile_image TEXT,
  store_name TEXT NOT NULL,
  store_description TEXT,
  interaction_style TEXT,
  response_tone TEXT,
  primary_focus TEXT,
  greeting_message TEXT,
  crypto_wallet TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  delivery_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create store_conversations table
CREATE TABLE public.store_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  visitor_wallet TEXT,
  visitor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create store_messages table
CREATE TABLE public.store_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.store_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_messages ENABLE ROW LEVEL SECURITY;

-- Stores policies
CREATE POLICY "Anyone can view active stores"
ON public.stores FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can manage their own stores"
ON public.stores FOR ALL
USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Anyone can view active products"
ON public.products FOR SELECT
USING (is_active = true AND store_id IN (SELECT id FROM stores WHERE is_active = true));

CREATE POLICY "Store owners can manage their products"
ON public.products FOR ALL
USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Store conversations policies
CREATE POLICY "Anyone can create conversations"
ON public.store_conversations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Store owners can view their conversations"
ON public.store_conversations FOR SELECT
USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Store messages policies
CREATE POLICY "Anyone can create messages"
ON public.store_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view messages in conversations"
ON public.store_messages FOR SELECT
USING (true);

-- Create indexes for performance
CREATE INDEX idx_stores_user_id ON public.stores(user_id);
CREATE INDEX idx_stores_x_username ON public.stores(x_username);
CREATE INDEX idx_products_store_id ON public.products(store_id);
CREATE INDEX idx_store_conversations_store_id ON public.store_conversations(store_id);
CREATE INDEX idx_store_messages_conversation_id ON public.store_messages(conversation_id);

-- Create trigger for updated_at
CREATE TRIGGER update_stores_updated_at
BEFORE UPDATE ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_conversations_updated_at
BEFORE UPDATE ON public.store_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();