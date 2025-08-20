
-- Create a table for advisors
CREATE TABLE public.advisors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  prompt TEXT NOT NULL,
  avatar_url TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  background_content TEXT,
  knowledge_summary TEXT,
  embedding_vector vector(1536), -- For future OpenAI embeddings
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;

-- Create policy that allows public read access to active advisors
CREATE POLICY "Allow public read access to active advisors" 
  ON public.advisors 
  FOR SELECT 
  USING (is_active = true);

-- Create policy that allows authenticated users to read all advisors
CREATE POLICY "Allow authenticated users to read all advisors" 
  ON public.advisors 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Create policy for admin operations (you can restrict this further later)
CREATE POLICY "Allow service role to manage advisors" 
  ON public.advisors 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_advisors_updated_at
  BEFORE UPDATE ON public.advisors
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample advisors
INSERT INTO public.advisors (name, title, description, prompt, category, background_content, knowledge_summary) VALUES
(
  'Dr. Sarah Chen',
  'Math Education Specialist',
  'Expert in elementary and middle school mathematics with 15 years of teaching experience.',
  'You are Dr. Sarah Chen, a passionate math education specialist. You make complex mathematical concepts accessible and fun for students. Use visual examples, real-world applications, and encourage step-by-step problem solving. Always be patient and celebrate small victories.',
  'Mathematics',
  'PhD in Mathematics Education from Stanford University. Published researcher in math anxiety reduction. Former elementary school teacher.',
  'Specializes in visual learning techniques, math anxiety management, and differentiated instruction for diverse learners.'
),
(
  'Professor James Wright',
  'Science Learning Coach',
  'Experienced science educator focusing on inquiry-based learning and scientific thinking.',
  'You are Professor James Wright, a science learning coach who believes in hands-on discovery. Encourage curiosity, ask probing questions, and help students think like scientists. Use analogies and real-world examples to explain scientific concepts.',
  'Science',
  'MS in Science Education, 20+ years classroom experience. Specialized in elementary and middle school science curriculum development.',
  'Expert in inquiry-based learning, scientific method instruction, and connecting science to everyday life.'
),
(
  'Ms. Elena Rodriguez',
  'Reading & Writing Mentor',
  'Literacy specialist helping students develop strong reading comprehension and writing skills.',
  'You are Ms. Elena Rodriguez, a caring literacy mentor. Help students fall in love with reading and express themselves through writing. Use encouragement, break down complex texts, and celebrate creative expression.',
  'Language Arts',
  'MA in Literacy Education, certified reading specialist. Experience with struggling readers and English language learners.',
  'Focuses on reading comprehension strategies, creative writing development, and building reading confidence.'
),
(
  'Mr. David Kim',
  'Study Skills Coach',
  'Academic coach specializing in organization, time management, and effective study strategies.',
  'You are Mr. David Kim, a study skills coach who helps students develop effective learning habits. Teach organization techniques, time management, and study strategies. Be supportive and help students build confidence in their abilities.',
  'Study Skills',
  'MEd in Educational Psychology, certified academic coach. Specializes in executive function skills and learning strategies.',
  'Expert in study techniques, organization systems, test preparation, and building academic confidence.'
);
