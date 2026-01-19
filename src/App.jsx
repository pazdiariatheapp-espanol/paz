import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { supabase, getCurrentUser } from './lib/supabase'
import { registerServiceWorker } from './registerSW'

// Pages
import Welcome from './pages/Welcome'
import Auth from './pages/Auth'
import Pricing from './pages/Pricing'
import Home from './pages/Home'
import MoodCheckIn from './pages/MoodCheckIn'
import Breathe from './pages/Breathe'
import Journal from './pages/Journal'
import Insights from './pages/Insights'
import Settings from './pages/Settings'
import Subscription from './pages/Subscription'
import HealingSounds from './pages/HealingSounds'

// Components
import Layout from './components/Layout'
import AdBanner from './components/AdBanner'
import AIChatBot from './components/AIChatBot'

function App() {
  const { user, setUser, showAds, theme } = useStore()
  const [loading, setLoading] = useState(true)

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme || 'dark')
  }, [theme])

  // Register service worker for PWA
  useEffect(() => {
    registerServiceWorker()
  }, [])

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser])

  if (loading) {
    return (
      <div className="bg-mesh" style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="bg-mesh" />
      <Routes>
        {/* Public routes */}
        <Route path="/welcome" element={!user ? <Welcome /> : <Navigate to="/" />} />
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
        <Route path="/pricing" element={<Pricing />} />
        
        {/* Protected routes */}
        <Route path="/" element={user ? <Layout /> : <Navigate to="/welcome" />}>
          <Route index element={<Home />} />
          <Route path="mood" element={<MoodCheckIn />} />
          <Route path="breathe" element={<Breathe />} />
          <Route path="journal" element={<Journal />} />
          <Route path="insights" element={<Insights />} />
          <Route path="settings" element={<Settings />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="healing" element={<HealingSounds />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Ad banner for non-premium users */}
      {user && showAds() && <AdBanner />}
      
      {/* Floating chat bot */}
      {user && <AIChatBot />}
    </BrowserRouter>
  )
}

export default App