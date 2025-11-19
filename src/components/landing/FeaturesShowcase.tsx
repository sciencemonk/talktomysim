import { Globe, Lock, Zap, BarChart3, Headphones, Code2 } from "lucide-react";

export const FeaturesShowcase = () => {
  const features = [
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Communicate with customers worldwide in their native language. Automatic translation and cultural adaptation included.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Lock,
      title: "Enterprise-Grade Security",
      description: "Bank-level encryption, SOC 2 compliance, and GDPR ready. Your data and your customers' data are always protected.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Response times under 100ms. Your customers never wait. Powered by edge computing and optimized infrastructure.",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track conversions, customer satisfaction, and revenue impact in real-time. Make data-driven decisions.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Headphones,
      title: "24/7 Expert Support",
      description: "Our team of AI specialists is always available to help optimize your agent and maximize your ROI.",
      color: "from-violet-500 to-purple-500"
    },
    {
      icon: Code2,
      title: "Easy Integration",
      description: "Works with Shopify, WooCommerce, Magento, and custom platforms. No code required, full API access available.",
      color: "from-rose-500 to-red-500"
    }
  ];

  return (
    <section className="relative bg-gradient-to-b from-white to-primary/5 py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
            ✨ Enterprise Features
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 font-montserrat">
            Built for Scale
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade infrastructure with the simplicity of a plug-and-play solution. 
            Everything you need to scale your business.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="relative bg-white rounded-3xl p-8 border border-primary/10"
            >
              {/* Icon */}
              <div className="mb-6">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-foreground mb-3 font-montserrat">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
