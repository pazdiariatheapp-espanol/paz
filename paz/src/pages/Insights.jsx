import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useStore } from '../store/useStore'
import { getTranslation } from '../lib/translations'
import { getMoodEntries, getJournalEntries } from '../lib/supabase'
import styles from './Insights.module.css'

function Insights() {
  const { language, user, moodEntries, setMoodEntries, streak } = useStore()
  const t = (key) => getTranslation(language, key)
  
  const [loading, setLoading] = useState(true)
  const [weeklyData, setWeeklyData] = useState([])
  const [stats, setStats] = useState({
    average: 0,
    entries: 0,
    streak: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      try {
        const { data: moods } = await getMoodEntries(user.id, 30)
        
        if (moods) {
          setMoodEntries(moods)
          
          // Process for weekly chart
          const last7Days = getLast7Days()
          const chartData = last7Days.map(day => {
            const dayMoods = moods.filter(m => 
              new Date(m.created_at).toDateString() === day.date.toDateString()
            )
            const avgMood = dayMoods.length > 0
              ? dayMoods.reduce((sum, m) => sum + m.mood, 0) / dayMoods.length
              : null
            
            return {
              day: day.label,
              mood: avgMood,
              fullDate: day.date.toDateString()
            }
          })
          
          setWeeklyData(chartData)
          
          // Calculate stats
          const weekMoods = moods.filter(m => {
            const moodDate = new Date(m.created_at)
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return moodDate >= weekAgo
          })
          
          const avgMood = weekMoods.length > 0
            ? (weekMoods.reduce((sum, m) => sum + m.mood, 0) / weekMoods.length).toFixed(1)
            : 0
          
          setStats({
            average: avgMood,
            entries: weekMoods.length,
            streak: streak
          })
        }
      } catch (err) {
        console.error('Error fetching insights:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user, setMoodEntries, streak])

  const getLast7Days = () => {
    const days = []
    const dayNames = language === 'en' 
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push({
        date,
        label: dayNames[date.getDay()]
      })
    }
    return days
  }

  const getMoodEmoji = (value) => {
    if (!value) return '—'
    if (value >= 4.5) return '😄'
    if (value >= 3.5) return '🙂'
    if (value >= 2.5) return '😐'
    if (value >= 1.5) return '😔'
    return '😢'
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length && payload[0].value) {
      return (
        <div className={styles.tooltip}>
          <span className={styles.tooltipEmoji}>
            {getMoodEmoji(payload[0].value)}
          </span>
          <span className={styles.tooltipValue}>
            {payload[0].value.toFixed(1)}
          </span>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('insightsTitle')}</h1>
      </header>

      {/* Stats Cards */}
      <motion.div 
        className={styles.statsGrid}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statEmoji}>{getMoodEmoji(stats.average)}</span>
          <span className={styles.statValue}>{stats.average || '—'}</span>
          <span className={styles.statLabel}>{t('averageMood')}</span>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statIcon}>📊</span>
          <span className={styles.statValue}>{stats.entries}</span>
          <span className={styles.statLabel}>{t('entriesCount')}</span>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statIcon}>🔥</span>
          <span className={styles.statValue}>{stats.streak}</span>
          <span className={styles.statLabel}>{t('streak')}</span>
        </div>
      </motion.div>

      {/* Weekly Chart */}
      <motion.div 
        className={`${styles.chartCard} glass-card`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className={styles.chartTitle}>{t('weeklyMood')}</h2>
        
        {weeklyData.some(d => d.mood !== null) ? (
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                />
                <YAxis 
                  domain={[1, 5]} 
                  hide 
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="var(--accent-calm)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--accent-calm)', strokeWidth: 0, r: 6 }}
                  activeDot={{ r: 8, fill: 'var(--accent-peace)' }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={styles.emptyChart}>
            <p className={styles.emptyText}>
              {language === 'en' 
                ? 'Start tracking your mood to see insights here!'
                : '¡Empieza a registrar tu ánimo para ver tu progreso aquí!'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Recent Entries */}
      <motion.div 
        className={styles.recentSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className={styles.sectionTitle}>
          {language === 'en' ? 'Recent Check-ins' : 'Registros Recientes'}
        </h2>
        
        {moodEntries.length > 0 ? (
          <div className={styles.entriesList}>
            {moodEntries.slice(0, 5).map((entry, index) => (
              <div key={entry.id || index} className={`${styles.entryItem} glass-card`}>
                <span className={styles.entryEmoji}>{getMoodEmoji(entry.mood)}</span>
                <div className={styles.entryContent}>
                  <span className={styles.entryMood}>
                    {entry.mood === 5 ? t('moodGreat') :
                     entry.mood === 4 ? t('moodGood') :
                     entry.mood === 3 ? t('moodOkay') :
                     entry.mood === 2 ? t('moodLow') : t('moodBad')}
                  </span>
                  <span className={styles.entryDate}>
                    {formatDate(entry.created_at, language)}
                  </span>
                </div>
                {entry.note && (
                  <p className={styles.entryNote}>{entry.note}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyText}>
            {language === 'en' 
              ? 'No entries yet. Start your wellness journey!'
              : '¡Aún no hay entradas. Comienza tu viaje de bienestar!'}
          </p>
        )}
      </motion.div>
    </div>
  )
}

function formatDate(dateString, language) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return language === 'en' ? 'Today' : 'Hoy'
  } else if (days === 1) {
    return language === 'en' ? 'Yesterday' : 'Ayer'
  } else if (days < 7) {
    return language === 'en' ? `${days} days ago` : `Hace ${days} días`
  } else {
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', {
      month: 'short',
      day: 'numeric'
    })
  }
}

export default Insights
