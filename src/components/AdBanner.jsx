import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './AdBanner.module.css'

function AdBanner() {
  const navigate = useNavigate()
  
  // In production, this would be replaced with actual AdMob integration
  // For now, showing a placeholder that promotes upgrading
  
  return (
    <div className={styles.container}>
      <div className={styles.banner} onClick={() => navigate('/subscription')}>
        <span className={styles.text}>✨ Upgrade to Premium Plus for ad-free experience</span>
      </div>
    </div>
  )
}

export default AdBanner

/*
  AdMob Integration Notes:
  
  For production, replace this component with actual AdMob integration:
  
  1. Install: npm install @capacitor-community/admob (for Capacitor)
     or react-native-google-mobile-ads (for React Native)
  
  2. Initialize AdMob in your app:
     AdMob.initialize({
       requestTrackingAuthorization: true,
     });
  
  3. Show banner ad:
     const options = {
       adId: 'YOUR_AD_UNIT_ID',
       adSize: BannerAdSize.ADAPTIVE_BANNER,
       position: BannerAdPosition.BOTTOM_CENTER,
     };
     AdMob.showBanner(options);
  
  4. Test ad unit IDs:
     - iOS: ca-app-pub-3940256099942544/2934735716
     - Android: ca-app-pub-3940256099942544/6300978111
*/
