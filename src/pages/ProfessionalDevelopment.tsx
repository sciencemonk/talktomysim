import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Award, Clock, Bell, ArrowRight } from "lucide-react";
const ProfessionalDevelopment = () => {
  return <div className="space-y-8">
      

      {/* Coming Soon Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="text-center py-12">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Clock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Coming Soon!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            We're developing comprehensive professional development courses to help educators effectively integrate AI tutors into their teaching practice.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Bell className="h-4 w-4 mr-2" />
            Notify Me When Available
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg w-fit">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-lg">AI Integration Fundamentals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Learn the basics of incorporating AI tutors into your curriculum and classroom management.
            </p>
            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
              <span>Self-paced course</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg w-fit">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-lg">Collaborative Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Strategies for using AI tutors to facilitate peer-to-peer learning and group activities.
            </p>
            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
              <span>Interactive workshops</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg w-fit">
              <Award className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-lg">Certification Program</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Earn credentials in AI-assisted teaching and demonstrate your expertise to administrators.
            </p>
            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
              <span>Professional certification</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What You'll Learn Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">What You'll Learn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Pedagogical Integration</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Aligning AI tutors with learning objectives</li>
                <li>• Differentiated instruction strategies</li>
                <li>• Assessment and feedback techniques</li>
                <li>• Student engagement best practices</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Technical Skills</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Creating effective AI tutor prompts</li>
                <li>• Customizing tutors for your subject area</li>
                <li>• Monitoring student interactions</li>
                <li>• Data-driven instruction insights</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default ProfessionalDevelopment;