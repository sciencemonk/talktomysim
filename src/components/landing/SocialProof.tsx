import { Star } from "lucide-react";

export const SocialProof = () => {
  const testimonials = [
    {
      quote: "Our conversion rate increased by 340% in the first month. The AI agent handles customer questions 24/7 and never misses a sale.",
      author: "Sarah Chen",
      role: "CEO",
      company: "ModernStyle Boutique",
      rating: 5
    },
    {
      quote: "Implementation took less than 5 minutes. The ROI was immediate. Our customers love the instant, personalized responses.",
      author: "Michael Rodriguez",
      role: "Head of E-commerce",
      company: "TechGear Pro",
      rating: 5
    },
    {
      quote: "Game changer for our business. The AI understands our products better than most of our sales team. Highly recommend.",
      author: "Emily Watson",
      role: "Founder",
      company: "Artisan Collective",
      rating: 5
    }
  ];

  const stats = [
    { value: "500+", label: "Active Stores" },
    { value: "2M+", label: "Conversations/Month" },
    { value: "$50M+", label: "Sales Enabled" },
    { value: "4.9/5", label: "Average Rating" }
  ];

  return (
    <section className="relative bg-gradient-to-b from-primary/5 to-white py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-8 bg-white rounded-2xl border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl"
            >
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2 font-montserrat">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
            ⭐ Customer Success Stories
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 font-montserrat">
            Loved by Businesses
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what store owners are saying about their AI agents
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-3xl p-8 border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:scale-105"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground leading-relaxed mb-6 text-lg">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="pt-6 border-t border-primary/10">
                <div className="font-bold text-foreground">
                  {testimonial.author}
                </div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role} at {testimonial.company}
                </div>
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-12 opacity-60">
          <div className="text-sm font-semibold text-muted-foreground">
            SOC 2 Certified
          </div>
          <div className="w-px h-6 bg-border"></div>
          <div className="text-sm font-semibold text-muted-foreground">
            GDPR Compliant
          </div>
          <div className="w-px h-6 bg-border"></div>
          <div className="text-sm font-semibold text-muted-foreground">
            99.9% Uptime SLA
          </div>
          <div className="w-px h-6 bg-border"></div>
          <div className="text-sm font-semibold text-muted-foreground">
            Enterprise Ready
          </div>
        </div>
      </div>
    </section>
  );
};
