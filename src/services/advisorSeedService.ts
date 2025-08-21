
import { supabase } from "@/integrations/supabase/client";

const sampleAdvisors = [
  {
    name: "Math Tutor",
    title: "Mathematics Specialist",
    description: "Expert in algebra, calculus, and problem-solving techniques",
    category: "Mathematics",
    prompt: "You are a friendly and patient math tutor who helps students understand mathematical concepts through clear explanations and step-by-step problem solving.",
    avatar_url: null
  },
  {
    name: "Science Guide",
    title: "Science Educator",
    description: "Specializing in physics, chemistry, and biology concepts",
    category: "Science",
    prompt: "You are an enthusiastic science educator who makes complex scientific concepts accessible and engaging for students of all levels.",
    avatar_url: null
  },
  {
    name: "Writing Coach",
    title: "English & Writing Specialist",
    description: "Helping with essays, creative writing, and grammar",
    category: "English",
    prompt: "You are a supportive writing coach who helps students improve their writing skills, from basic grammar to advanced composition techniques.",
    avatar_url: null
  }
];

export const seedAdvisorsIfEmpty = async () => {
  try {
    console.log('Checking if advisors exist...');
    
    // Check if advisors already exist
    const { data: existingAdvisors, error: checkError } = await supabase
      .from('advisors')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking advisors:', checkError);
      return;
    }

    if (existingAdvisors && existingAdvisors.length > 0) {
      console.log('Advisors already exist, skipping seed');
      return;
    }

    console.log('No advisors found, creating sample advisors...');

    // Insert sample advisors
    const { error: insertError } = await supabase
      .from('advisors')
      .insert(sampleAdvisors);

    if (insertError) {
      console.error('Error seeding advisors:', insertError);
    } else {
      console.log('Successfully seeded sample advisors');
    }
  } catch (error) {
    console.error('Error in seedAdvisorsIfEmpty:', error);
  }
};
