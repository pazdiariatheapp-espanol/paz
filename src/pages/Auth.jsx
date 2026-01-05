import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { getTranslation } from '../lib/translations'
import { signIn, signUp } from '../lib/supabase'
import styles from './Auth.module.css'

function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { language } = useStore()
  const t = (key) => getTranslation(language, key)
  
  const [isSignIn, setIsSignIn] = useState(searchParams.get('mode') === 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const { error: authError } = isSignIn 
        ? await signIn(email, password)
        : await signUp(email, password)
      
      if (authError) {
        setError(authError.message)
      } else if (!isSignIn) {
        // Show success message for sign up
        setError(language === 'en' 
          ? 'Check your email to confirm your account!' 
          : '¡Revisa tu correo para confirmar tu cuenta!')
      }
    } catch (err) {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate('/welcome')}>
        ← {language === 'en' ? 'Back' : 'Volver'}
      </button>
      
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.title}>
          {isSignIn ? t('signIn') : t('signUp')}
        </h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              required
              autoComplete="email"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={isSignIn ? 'current-password' : 'new-password'}
            />
          </div>
          
          {error && (
            <div className={styles.error}>{error}</div>
          )}
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: 'var(--space-md)' }}
          >
            {loading ? t('loading') : (isSignIn ? t('signIn') : t('signUp'))}
          </button>
        </form>
        
        <div className={styles.switch}>
          <span className={styles.switchText}>
            {isSignIn ? t('noAccount') : t('hasAccount')}
          </span>
          <button 
            className={styles.switchBtn}
            onClick={() => setIsSignIn(!isSignIn)}
          >
            {isSignIn ? t('signUp') : t('signIn')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default Auth
