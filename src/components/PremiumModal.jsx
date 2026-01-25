import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getTranslation } from '../lib/translations'
import styles from './PremiumModal.module.css'

function PremiumModal({ isOpen, onSubscribe }) {
  const { language } = useStore()
  const t = (key) => getTranslation(language, key)

  const plans = [
    {
      id: 'premium',
      name: 'Premium',
      price: '$4.99',
      period: '/month',
      features: [
        'Unlimited AI chats',
        'Advanced insights',
        'Export journal',
        'No ads'
      ]
    },
    {
      id: 'premium_plus',
      name: 'Premium Plus',
      price: '$9.99',
      period: '/month',
      features: [
        'Everything in Premium',
        'Voice coaching',
        'Priority support',
        'Custom themes',
        'Offline mode'
      ],
      featured: true
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.preventDefault()}
          />
          
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className={styles.header}>
              <Zap className={styles.icon} />
              <h2>{language === 'en' ? 'Upgrade to Premium' : 'Actualiza a Premium'}</h2>
              <p className={styles.subtitle}>
                {language === 'en' 
                  ? 'Keep using AI Chat and unlock premium features' 
                  : 'Sigue usando AI Chat y desbloquea funciones premium'}
              </p>
            </div>

            <div className={styles.plansContainer}>
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  className={`${styles.planCard} ${plan.featured ? styles.featured : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {plan.featured && (
                    <div className={styles.badge}>
                      {language === 'en' ? 'Recommended' : 'Recomendado'}
                    </div>
                  )}
                  
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.pricing}>
                    <span className={styles.price}>{plan.price}</span>
                    <span className={styles.period}>{plan.period}</span>
                  </div>
                  
                  <ul className={styles.features}>
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>
                        <Check size={16} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    className={`${styles.subscribeBtn} ${plan.featured ? styles.primary : ''}`}
                    onClick={() => onSubscribe(plan.id)}
                  >
                    {language === 'en' ? 'Subscribe Now' : 'Suscribirse Ahora'}
                  </button>
                </motion.div>
              ))}
            </div>

            <div className={styles.footer}>
              <p className={styles.disclaimer}>
                {language === 'en'
                  ? 'Cancel anytime. Auto-renews monthly unless cancelled.'
                  : 'Cancela en cualquier momento. Se renueva mensualmente a menos que lo canceles.'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default PremiumModal