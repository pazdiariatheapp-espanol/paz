import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { getTranslation } from '../lib/translations'
import styles from './Subscription.module.css'

function Subscription() {
  const navigate = useNavigate()
  const { language, subscription, setSubscription } = useStore()
  const t = (key) => getTranslation(language, key)
  
  const [selectedPlan, setSelectedPlan] = useState('premium_plus')
  const [processing, setProcessing] = useState(false)

  const handleSubscribe = async () => {
    setProcessing(true)
    
    // In production, this would integrate with Stripe/RevenueCat
    // For now, simulate subscription
    setTimeout(() => {
      setSubscription(selectedPlan)
      setProcessing(false)
      navigate('/settings')
    }, 1500)
  }

  const plans = [
    {
      id: 'premium',
      name: t('premium'),
      price: '$2.99',
      period: language === 'en' ? '/month' : '/mes',
      yearlyPrice: '$19.99',
      yearlyPeriod: language === 'en' ? '/year' : '/año',
      features: [
        language === 'en' ? 'Unlimited mood tracking' : 'Registro de ánimo ilimitado',
        language === 'en' ? 'Daily prompts & insights' : 'Reflexiones e insights diarios',
        language === 'en' ? 'Breathing exercises' : 'Ejercicios de respiración',
        language === 'en' ? 'Gratitude journal' : 'Diario de gratitud',
        language === 'en' ? 'Weekly insights' : 'Progreso semanal',
      ],
      note: language === 'en' ? 'Includes ads' : 'Incluye anuncios',
      color: 'var(--accent-calm)'
    },
    {
      id: 'premium_plus',
      name: t('premiumPlus'),
      price: '$4.99',
      period: language === 'en' ? '/month' : '/mes',
      yearlyPrice: '$39.99',
      yearlyPeriod: language === 'en' ? '/year' : '/año',
      features: [
        language === 'en' ? 'Everything in Premium' : 'Todo lo de Premium',
        language === 'en' ? 'No ads ever' : 'Sin anuncios nunca',
        language === 'en' ? 'Priority support' : 'Soporte prioritario',
        language === 'en' ? 'Early access to new features' : 'Acceso anticipado a novedades',
      ],
      highlight: true,
      badge: language === 'en' ? 'Best Value' : 'Mejor Valor',
      color: 'var(--accent-peace)'
    }
  ]

  return (
    <div className={styles.container}>
      <button className={styles.closeBtn} onClick={() => navigate(-1)}>
        ✕
      </button>
      
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={styles.title}>{t('subscriptionTitle')}</h1>
        <p className={styles.subtitle}>
          {language === 'en' 
            ? 'Invest in your mental wellness' 
            : 'Invierte en tu bienestar mental'}
        </p>
      </motion.header>

      <div className={styles.plans}>
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            className={`${styles.planCard} ${selectedPlan === plan.id ? styles.planCardSelected : ''} ${plan.highlight ? styles.planCardHighlight : ''}`}
            style={{ '--plan-color': plan.color }}
            onClick={() => setSelectedPlan(plan.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileTap={{ scale: 0.98 }}
          >
            {plan.badge && (
              <span className={styles.badge}>{plan.badge}</span>
            )}
            
            <div className={styles.planHeader}>
              <h2 className={styles.planName}>{plan.name}</h2>
              <div className={styles.planPrice}>
                <span className={styles.price}>{plan.price}</span>
                <span className={styles.period}>{plan.period}</span>
              </div>
              <div className={styles.yearlyPrice}>
                {language === 'en' ? 'or ' : 'o '}{plan.yearlyPrice}{plan.yearlyPeriod}
              </div>
            </div>
            
            <ul className={styles.features}>
              {plan.features.map((feature, i) => (
                <li key={i} className={styles.feature}>
                  <span className={styles.checkmark}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            
            {plan.note && (
              <p className={styles.note}>{plan.note}</p>
            )}
            
            <div className={`${styles.selector} ${selectedPlan === plan.id ? styles.selectorActive : ''}`}>
              <div className={styles.selectorInner} />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className={styles.cta}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button 
          className="btn-primary"
          style={{ width: '100%', padding: '18px' }}
          onClick={handleSubscribe}
          disabled={processing}
        >
          {processing 
            ? t('loading')
            : `${t('subscribe')} - ${selectedPlan === 'premium' ? '$2.99' : '$4.99'}${language === 'en' ? '/mo' : '/mes'}`
          }
        </button>
        
        <p className={styles.terms}>
          {language === 'en'
            ? 'Cancel anytime. Subscription auto-renews monthly.'
            : 'Cancela cuando quieras. La suscripción se renueva mensualmente.'}
        </p>
      </motion.div>
    </div>
  )
}

export default Subscription
