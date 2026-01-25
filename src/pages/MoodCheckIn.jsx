import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { getTranslation } from '../lib/translations'
import { saveMoodEntry } from '../lib/supabase'
import styles from './MoodCheckIn.module.css'

const moods = [
  { value: 5, emoji: '😄', label: 'Great', color: '#4ade80' },
  { value: 4, emoji: '🙂', label: 'Good', color: '#a3e635' },
  { value: 3, emoji: '😐', label: 'Okay', color: '#facc15' },
  { value: 2, emoji: '😔', label: 'Low', color: '#fb923c' },
  { value: 1, emoji: '😢', label: 'Bad', color: '#f87171' },
]

function MoodCheckIn() {
  const navigate = useNavigate()
  const { language, user, setTodayMood, addMoodEntry } = useStore()
  const t = (key) => getTranslation(language, key)

  const [selectedMood, setSelectedMood] = useState(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const getMoodLabel = (value) => {
    const labels = {
      5: t('moodGreat'),
      4: t('moodGood'),
      3: t('moodOkay'),
      2: t('moodLow'),
      1: t('moodBad'),
    }
    return labels[value]
  }

  const handleMoodSelect = (value) => {
    setSelectedMood(value)
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const handleSave = async () => {
    if (!selectedMood || !user) return

    setSaving(true)

    try {
      const { data, error } = await saveMoodEntry(user.id, selectedMood, note)

      if (!error && data) {
        setTodayMood(selectedMood)
        addMoodEntry(data[0])
        setSaved(true)

        if (navigator.vibrate) {
          navigator.vibrate([50, 100, 50])
        }

        setTimeout(() => {
          navigate('/')
        }, 1500)
      }
    } catch (err) {
      console.error('Error saving mood:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {!saved ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <header className={styles.header}>
              <h1 className={styles.title}>{t('howAreYou')}</h1>
            </header>

            <div className={styles.moodGrid}>
              {moods.map((mood, index) => (
                <motion.button
                  key={mood.value}
                  className={`${styles.moodBtn} ${selectedMood === mood.value ? styles.moodBtnActive : ''}`}
                  style={{
                    '--mood-color': mood.color,
                  }}
                  onClick={() => handleMoodSelect(mood.value)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, type: 'spring', damping: 15 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    className={styles.moodEmoji}
                    animate={selectedMood === mood.value ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {mood.emoji}
                  </motion.span>
                  <span className={styles.moodLabel}>{getMoodLabel(mood.value)}</span>
                  
                  {selectedMood === mood.value && (
                    <motion.div
                      className={styles.moodGlow}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layoutId="moodGlow"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            <motion.div
              className={styles.noteSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: selectedMood ? 1 : 0.5, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <textarea
                className={styles.noteInput}
                placeholder={t('addNote')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={!selectedMood}
              />
            </motion.div>

            <motion.button
              className="btn-primary"
              style={{
                width: '100%',
                marginTop: 'var(--space-lg)',
                opacity: selectedMood ? 1 : 0.5
              }}
              onClick={handleSave}
              disabled={!selectedMood || saving}
              whileHover={selectedMood ? { scale: 1.02 } : {}}
              whileTap={selectedMood ? { scale: 0.98 } : {}}
            >
              {saving ? t('loading') : t('saveMood')}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            className={styles.success}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <motion.div
              className={styles.successEmoji}
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.6 }}
            >
              {moods.find(m => m.value === selectedMood)?.emoji}
            </motion.div>
            <h2 className={styles.successText}>{t('moodSaved')}</h2>
            
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className={styles.particle}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                }}
                animate={{
                  x: Math.cos((i / 8) * Math.PI * 2) * 80,
                  y: Math.sin((i / 8) * Math.PI * 2) * 80,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                }}
              >
                {moods.find(m => m.value === selectedMood)?.emoji}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MoodCheckIn