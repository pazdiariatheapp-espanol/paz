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
      gradient: 'from-cyan-500 via-blue-500 to-blue-600',
      iconGradient: 'from-cyan-400 to-blue-500',
      glowColor: 'shadow-blue-500/30'
    },
    {
      name: 'Premium Plus',
      subtitle: 'No Ads',
      badge: '✨ Most Popular',
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
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      iconGradient: 'from-purple-400 to-pink-500',
      glowColor: 'shadow-purple-500/40',
      highlight: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-3 animate-gradient">
            Choose Your Plan
          </h1>
          <p className="text-purple-200 text-lg font-medium">
            Start your journey to daily peace
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-6">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`relative bg-white/5 backdrop-blur-xl rounded-3xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                plan.highlight 
                  ? 'border-purple-400 shadow-2xl shadow-purple-500/50' 
                  : 'border-blue-400/40 hover:border-blue-400'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className={`bg-gradient-to-r ${plan.gradient} text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-5 mt-2">
                <h2 className={`text-3xl font-extrabold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent mb-1`}>
                  {plan.name}
                </h2>
                <p className={`text-sm font-semibold bg-gradient-to-r ${plan.iconGradient} bg-clip-text text-transparent`}>
                  {plan.subtitle}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-blue-50">
                    <span className={`text-green-400 mr-2.5 text-lg font-bold flex-shrink-0`}>✓</span>
                    <span className="text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Pricing Options */}
              <div className="space-y-2.5">
                {/* Monthly */}
                <button
                  onClick={() => window.location.href = plan.monthly.link}
                  className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white py-3.5 px-5 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg ${plan.glowColor}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">Monthly</span>
                    <span className="text-xl font-extrabold">{plan.monthly.price}/mo</span>
                  </div>
                </button>

                {/* Yearly */}
                <button
                  onClick={() => window.location.href = plan.yearly.link}
                  className="w-full bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white py-3.5 px-5 rounded-2xl font-bold transition-all border-2 border-white/20 hover:border-white/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                      <span className="text-base">Yearly</span>
                      <span className={`text-xs font-bold bg-gradient-to-r ${plan.iconGradient} bg-clip-text text-transparent`}>
                        {plan.yearly.save}
                      </span>
                    </div>
                    <span className="text-xl font-extrabold">{plan.yearly.price}/yr</span>
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-purple-200 text-sm font-medium bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 inline-block border border-purple-300/30">
            🎁 All plans include a 3-day free trial • Cancel anytime
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}