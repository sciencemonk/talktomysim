import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  website: z.string().trim().url("Invalid URL").max(500),
  message: z.string().trim().min(1, "Please tell us about your needs").max(1000)
});

export const ContactFormLanding = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = contactSchema.parse(formData);
      setIsSubmitting(true);

      // TODO: Save to database once contact_requests table is created
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Request submitted! We'll be in touch soon.");
      setFormData({ name: "", email: "", website: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to submit request. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-primary/5 to-white py-24 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
            ✨ Get Started
          </div>
          <h2 className="text-5xl font-bold text-black mb-6 font-montserrat">
            Request Access
          </h2>
          <p className="text-xl text-gray-600">
            Tell us about your store and we'll get you started
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 border border-primary/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={100}
                className="h-14 text-base border-primary/20 focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                maxLength={255}
                className="h-14 text-base border-primary/20 focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <Input
                type="url"
                placeholder="Store Website URL"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                required
                maxLength={500}
                className="h-14 text-base border-primary/20 focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <Textarea
                placeholder="Tell us about your store and what you're looking for..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                maxLength={1000}
                className="min-h-36 text-base border-primary/20 focus:border-primary focus:ring-primary resize-none"
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-14 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
