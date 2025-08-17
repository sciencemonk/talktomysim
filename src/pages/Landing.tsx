
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Users, BookOpen, BarChart } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const handleStartFree = () => {
    // Bypass Google Sign-In for testing and go directly to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Agent Hub</span>
          </div>
          <Button variant="outline" onClick={handleStartFree}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Create Powerful AI Tutors
            <span className="block text-blue-600">For Your Students</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Build personalized AI tutoring agents that help your students learn better. 
            No coding required - just describe what you want and let AI do the rest.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            onClick={handleStartFree}
          >
            Start Free with Google
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <Users className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Student-Centered Learning
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create AI tutors that adapt to each student's learning style and pace, providing personalized guidance.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <BookOpen className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Subject Expertise
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Build specialized tutors for math, science, language arts, and more. Each agent becomes an expert in your curriculum.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <BarChart className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Learning Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track student progress and identify areas where they need additional support through detailed analytics.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
