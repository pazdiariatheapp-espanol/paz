import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getTranslation } from '../lib/translations'
import styles from './Layout.module.css'

// Refined XR-inspired icons
const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5l9-7.5 9 7.5v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <path d="M9 22v-8h6v8"/>
  </svg>
)

const MoodIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.5"/>
    <path d="M8 14c.5 1.5 2 2.5 4 2.5s3.5-1 4-2.5"/>
    <circle cx="9" cy="9.5" r="1"/>
    <circle cx="15" cy="9.5" r="1"/>
  </svg>
)

const BreatheIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5"/>
    <path d="M12 7v10M7 12h10" strokeWidth="1.5"/>
  </svg>
)

const JournalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
    <path d="M8 8h8M8 12h8M8 16h4"/>
  </svg>
)

const HealingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>
    <circle cx="12" cy="12" r="5"/>
    <circle cx="12" cy="12" r="2"/>
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