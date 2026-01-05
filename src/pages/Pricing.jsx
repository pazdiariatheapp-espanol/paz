
import React from 'react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Premium',
      subtitle: 'With Ads',
      features: [
        'Daily mood tracking',
        'Breathing exercises',
        'Gratitude journal',
        'Healing sounds',
        'Insights & analytics'
      ],
      monthly: {
        price: '$2.99',
        link: 'https://buy.stripe.com/bJe00k1862KCfXRdtT08g01'
      },
      yearly: {
        price: '$19.99',
        save: 'Save 44%',
        link: 'https://buy.stripe.com/4gM5kEbMK1Gy7rl9dD08g02'
      },
      color: 'from-blue-400 to-blue-600'
    },
    {
      name: 'Premium Plus',
      subtitle: 'No Ads',
      badge: 'Most Popular',
      features: [
        'Everything in Premium',
        'Ad-free experience',
        'Priority support',
        'Exclusive content',
        'Advanced insights'
      ],
      monthly: {
        price: '$4.99',
        link: 'https://buy.stripe.com/dRm28saIG70S5jd1Lb08g03'
      },
      yearly: {
        price: '$39.99',
        save: 'Save 33%',
        link: 'https://buy.stripe.com/eVq8wQ4ki9905jdexX08g04'
      },
      color: 'from-purple-400 to-purple-600',
      highlight: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-blue-200 text-lg">
            Start your journey to daily peace
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 ${
                plan.highlight ? 'border-purple-400 shadow-2xl shadow-purple-500/50' : 'border-blue-400/30'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className={`text-3xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent mb-2`}>
                  {plan.name}
                </h2>
                <p className="text-blue-200 text-sm">{plan.subtitle}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-blue-100">
                    <span className="text-green-400 mr-3 text-lg">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Pricing Options */}
              <div className="space-y-3">
                {/* Monthly */}
                <button
                  onClick={() => window.location.href = plan.monthly.link}
                  className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <span>Monthly</span>
                    <span className="text-xl">{plan.monthly.price}/mo</span>
                  </div>
                </button>

                {/* Yearly */}
                <button
                  onClick={() => window.location.href = plan.yearly.link}
                  className="w-full bg-white/20 hover:bg-white/30 text-white py-4 px-6 rounded-xl font-semibold transition-all border-2 border-white/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                      <span>Yearly</span>
                      <span className="text-xs text-green-300">{plan.yearly.save}</span>
                    </div>
                    <span className="text-xl">{plan.yearly.price}/yr</span>
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-blue-300 text-sm">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}