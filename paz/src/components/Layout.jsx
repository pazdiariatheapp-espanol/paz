import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getTranslation } from '../lib/translations'
import styles from './Layout.module.css'

// Icons as simple SVG components
const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const MoodIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
)

const BreatheIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="4"/>
  </svg>
)

const JournalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)

const InsightsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)

const HealingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
)

const navItems = [
  { path: '/', icon: HomeIcon, labelKey: 'home' },
  { path: '/mood', icon: MoodIcon, labelKey: 'mood' },
  { path: '/breathe', icon: BreatheIcon, labelKey: 'breathe' },
  { path: '/healing', icon: HealingIcon, labelKey: 'healing' },
  { path: '/journal', icon: JournalIcon, labelKey: 'journal' },
]

function Layout() {
  const { language, showAds } = useStore()
  const location = useLocation()
  const t = (key) => getTranslation(language, key)

  return (
    <div className={styles.container}>
      <main className={styles.main} style={{ 
        paddingBottom: showAds() ? '130px' : '90px' 
      }}>
        <Outlet />
      </main>
      
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          {navItems.map(({ path, icon: Icon, labelKey }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => 
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <Icon />
              <span className={styles.navLabel}>{t(labelKey)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default Layout
