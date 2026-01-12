import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Pricing.module.css';

export default function PricingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleFreeTrial = () => {
    setIsLoading(true);
    // Navigate to sign up with free trial
    navigate('/auth?mode=signup&trial=true');
  };

  const handlePlanSelect = (link) => {
    setIsLoading(true);
    window.location.href = link;
  };

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
      type: 'premium'
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
      type: 'premium-plus',
      highlight: true
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.backgroundBlob1}></div>
      <div className={styles.backgroundBlob2}></div>
      <div className={styles.backgroundBlob3}></div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Choose Your Plan</h1>
          <p className={styles.subtitle}>Start your journey to daily peace</p>
        </div>

        {/* Free Trial Card */}
        <div className={styles.freeTrialCard}>
          <div className={styles.freeTrialBadge}>🎁 FREE</div>
          <h2 className={styles.freeTrialTitle}>3-Day Free Trial</h2>
          <p className={styles.freeTrialSubtitle}>Experience all features with no commitment</p>
          <ul className={styles.freeTrialFeatures}>
            <li>✓ Full access to all features</li>
            <li>✓ No credit card required</li>
            <li>✓ Cancel anytime</li>
          </ul>
          <button
            onClick={handleFreeTrial}
            disabled={isLoading}
            className={styles.freeTrialButton}
          >
            {isLoading ? 'Loading...' : 'Start Free Trial'}
          </button>
        </div>

        <div className={styles.divider}>
          <span>Or choose a plan</span>
        </div>

        <div className={styles.plansGrid}>
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`${styles.planCard} ${plan.highlight ? styles.planCardHighlight : ''}`}
            >
              {plan.badge && (
                <div className={styles.badge}>
                  <span className={styles[`badge-${plan.type}`]}>{plan.badge}</span>
                </div>
              )}

              <div className={styles.planHeader}>
                <h2 className={styles[`planName-${plan.type}`]}>{plan.name}</h2>
                <p className={styles[`planSubtitle-${plan.type}`]}>{plan.subtitle}</p>
              </div>

              <ul className={styles.featuresList}>
                {plan.features.map((feature, i) => (
                  <li key={i} className={styles.feature}>
                    <span className={styles.checkmark}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.buttons}>
                <button
                  onClick={() => handlePlanSelect(plan.monthly.link)}
                  disabled={isLoading}
                  className={`${styles.button} ${styles[`buttonPrimary-${plan.type}`]}`}
                >
                  <span>Monthly</span>
                  <span className={styles.price}>{plan.monthly.price}/mo</span>
                </button>

                <button
                  onClick={() => handlePlanSelect(plan.yearly.link)}
                  disabled={isLoading}
                  className={styles.buttonSecondary}
                >
                  <div className={styles.yearlyInfo}>
                    <span>Yearly</span>
                    <span className={styles[`save-${plan.type}`]}>{plan.yearly.save}</span>
                  </div>
                  <span className={styles.price}>{plan.yearly.price}/yr</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <p>💳 All paid plans include a 3-day trial • Secure payment • Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}