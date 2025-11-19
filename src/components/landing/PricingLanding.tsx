import { Check } from "lucide-react";

export const PricingLanding = () => {
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4 font-montserrat">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Launch your AI agent and start selling
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-black">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-black mb-2">$495</div>
              <div className="text-gray-600">One-time setup fee</div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-black flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Complete catalog conversion to vector embeddings</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-black flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Custom AI agent training and personalization</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-black flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Full integration and deployment support</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-black flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Pay-as-you-go chat credits after launch</span>
              </li>
            </ul>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Chat credits are charged based on usage after your agent launches
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
