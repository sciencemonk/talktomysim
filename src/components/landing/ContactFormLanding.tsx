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
    <section className="bg-white py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-black mb-4 font-montserrat">
            Request Access
          </h2>
          <p className="text-xl text-gray-600">
            Tell us about your store and we'll get you started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={100}
              className="h-12"
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
              className="h-12"
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
              className="h-12"
            />
          </div>

          <div>
            <Textarea
              placeholder="Tell us about your store and what you're looking for..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              maxLength={1000}
              className="min-h-32"
            />
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-black text-white hover:bg-gray-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </div>
    </section>
  );
};
