import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { hzGenerator, HEALING_SOUNDS } from '../lib/hzGenerator'
import { soundManager } from '../lib/sounds'
import styles from './HealingSounds.module.css'

function HealingSounds() {
  const { language, soundEnabled } = useStore()
  const [activeSound, setActiveSound] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [volume, setVolume] = useState(30)
  const natureAudioRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hzGenerator.stop()
      if (natureAudioRef.current) {
        natureAudioRef.current.pause()
        natureAudioRef.current = null
      }
    }
  }, [])

  // Update volume
  useEffect(() => {
    hzGenerator.setVolume(volume / 100)
    if (natureAudioRef.current) {
      natureAudioRef.current.volume = volume / 100
    }
  }, [volume])

  const handlePlay = (category, sound) => {
    // If same sound is playing, stop it
    if (activeSound === sound.id) {
      stopAll()
      return
    }

    // Stop any current sound
    stopAll()

    if (soundEnabled === false) return

    setActiveSound(sound.id)
    setActiveCategory(category)

    if (category === 'binaural') {
      // Play binaural beat
      hzGenerator.playBinauralBeat(sound.baseHz, sound.hz)
    } else if (category === 'hertz' || category === 'chakra') {
      // Play pure frequency
      hzGenerator.playFrequency(sound.hz)
    } else if (category === 'nature') {
      // Play audio file
      const audio = new Audio(sound.url)
      audio.loop = true
      audio.volume = volume / 100
      audio.play().catch(err => console.log('Audio blocked:', err))
      natureAudioRef.current = audio
    }
  }

  const stopAll = () => {
    hzGenerator.stop()
    if (natureAudioRef.current) {
      natureAudioRef.current.pause()
      natureAudioRef.current.currentTime = 0
      natureAudioRef.current = null
    }
    setActiveSound(null)
    setActiveCategory(null)
  }

  const renderCategory = (categoryKey, category) => (
    <motion.section
      key={categoryKey}
      className={styles.category}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={styles.categoryHeader}>
        <h2 className={styles.categoryTitle}>{category.title[language]}</h2>
        <p className={styles.categorySubtitle}>{category.subtitle[language]}</p>
      </div>

      <div className={styles.soundGrid}>
        {category.sounds.map((sound) => (
          <motion.button
            key={sound.id}
            className={`${styles.soundCard} ${activeSound === sound.id ? styles.soundCardActive : ''}`}
            style={sound.color ? { '--sound-color': sound.color } : {}}
            onClick={() => handlePlay(categoryKey, sound)}
            whileTap={{ scale: 0.95 }}
          >
            <span className={styles.soundIcon}>{sound.icon}</span>
            <span className={styles.soundName}>{sound.name[language]}</span>
            {sound.label && <span className={styles.soundHz}>{sound.label}</span>}
            {activeSound === sound.id && (
              <motion.div
                className={styles.playingIndicator}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <div className={styles.playingDot} />
                <div className={styles.playingDot} />
                <div className={styles.playingDot} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.section>
  )

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {language === 'en' ? 'Healing Sounds' : 'Sonidos Sanadores'}
        </h1>
        <p className={styles.subtitle}>
          {language === 'en' 
            ? 'Tap to play, tap again to stop' 
            : 'Toca para reproducir, toca de nuevo para detener'}
        </p>
      </header>

      {/* Volume control */}
      <div className={styles.volumeControl}>
        <span className={styles.volumeIcon}>🔈</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(parseInt(e.target.value))}
          className={styles.volumeSlider}
        />
        <span className={styles.volumeIcon}>🔊</span>
      </div>

      {/* Now Playing */}
      <AnimatePresence>
        {activeSound && (
          <motion.div
            className={styles.nowPlaying}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.nowPlayingContent}>
              <span className={styles.nowPlayingLabel}>
                {language === 'en' ? 'Now Playing' : 'Reproduciendo'}
              </span>
              <button className={styles.stopBtn} onClick={stopAll}>
                {language === 'en' ? '⏹ Stop' : '⏹ Detener'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      <div className={styles.categories}>
        {Object.entries(HEALING_SOUNDS).map(([key, category]) => 
          renderCategory(key, category)
        )}
      </div>

      {/* Headphones reminder for binaural */}
      <div className={styles.reminder}>
        <span>🎧</span>
        <p>
          {language === 'en'
            ? 'Use headphones for binaural beats to work properly'
            : 'Usa audífonos para que los ritmos binaurales funcionen correctamente'}
        </p>
      </div>
    </div>
  )
}

export default HealingSounds
