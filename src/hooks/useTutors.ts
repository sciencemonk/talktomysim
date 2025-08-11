
import { useState, useEffect } from 'react';
import { fetchTutors } from '@/services/tutorService';
import { AgentType } from '@/types/agent';

// Helper function to generate a random email based on tutor name
const generateRandomEmail = (id: string, name: string) => {
  const domains = ['school.edu', 'tutors.ai', 'learn.org', 'education.net'];
  const safeId = id.padEnd(4, 'a');
  const domainIndex = safeId.charCodeAt(3) % domains.length;
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const idPart = safeId.length >= 3 ? safeId.slice(0, 3) : safeId;
  
  return `${normalizedName}${idPart}@${domains[domainIndex]}`;
};

export const useTutors = (filter: string = 'all-tutors') => {
  const [tutors, setTutors] = useState<AgentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTutors = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTutors(filter);
        
        // Transform tutors to be education-focused
        const enhancedData = data.map(tutor => ({
          ...tutor,
          email: generateRandomEmail(tutor.id, tutor.name),
          // Add education-specific fields
          studentsSaved: tutor.studentsSaved || Math.floor(Math.random() * 50) + 10,
          helpfulnessScore: tutor.helpfulnessScore || Math.round((Math.random() * 2 + 8) * 10) / 10,
          // Map business types to education types
          type: mapToEducationType(tutor.type),
          subject: tutor.subject || getSubjectFromType(tutor.type),
          gradeLevel: tutor.gradeLevel || "6-8",
          teachingStyle: tutor.teachingStyle || "encouraging"
        }));
        
        setTutors(enhancedData);
        setError(null);
      } catch (err) {
        setError("Failed to load tutors");
        console.error("Error loading tutors:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTutors();
  }, [filter]);

  return { tutors, isLoading, error };
};

// Helper function to map business types to education types
const mapToEducationType = (originalType: string): any => {
  const typeMap: Record<string, any> = {
    "Customer Service": "General Tutor",
    "Sales & Marketing": "Study Buddy",
    "Technical Support": "Math Tutor",
    "IT Helpdesk": "Science Tutor",
    "Lead Generation": "Reading Assistant",
    "Appointment Booking": "Homework Helper",
    "FAQ & Knowledge Base": "Quiz Master",
    "Customer Onboarding": "Writing Coach",
    "Billing & Payments": "Language Arts Tutor",
    "Feedback Collection": "History Tutor",
    "Other Function": "General Tutor"
  };
  
  return typeMap[originalType] || "General Tutor";
};

// Helper function to get subject from type
const getSubjectFromType = (type: string): string => {
  if (type.includes("Math")) return "math";
  if (type.includes("Science")) return "science";
  if (type.includes("Language") || type.includes("Writing")) return "english";
  if (type.includes("History")) return "history";
  if (type.includes("Reading")) return "reading";
  return "other";
};
