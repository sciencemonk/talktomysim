-- Add foreign key constraints to debate_queue table
ALTER TABLE public.debate_queue
ADD CONSTRAINT debate_queue_sim1_id_fkey 
FOREIGN KEY (sim1_id) REFERENCES public.advisors(id) ON DELETE CASCADE;

ALTER TABLE public.debate_queue
ADD CONSTRAINT debate_queue_sim2_id_fkey 
FOREIGN KEY (sim2_id) REFERENCES public.advisors(id) ON DELETE CASCADE;