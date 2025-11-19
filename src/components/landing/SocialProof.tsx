export const SocialProof = () => {
  return (
    <section className="relative bg-gradient-to-b from-primary/5 to-white py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
            🚀 Limited Beta Access
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 font-montserrat">
            Join the Waitlist
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're accepting a limited number of beta users to revolutionize their e-commerce experience with AI-powered agents.
          </p>
        </div>
      </div>
    </section>
  );
};
