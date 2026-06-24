import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const LocationTracker: React.FC = () => {
  const { user, userProfile } = useAuth();
  const trackingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTrackingRef = useRef(false);

  const pushLocation = async () => {
    if (isTrackingRef.current) return;
    const allowedRoles = ['engineer', 'trainer', 'operation_manager'];
    if (!user || !userProfile || !allowedRoles.includes(userProfile.role)) return;

    try {
      isTrackingRef.current = true;

      // Check if geolocation is available
      if (!navigator.geolocation) {
        return;
      }

      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        });
      });

      // Insert into location_tracking table
      await supabase.from('location_tracking').insert({
        user_id: user.id,
        job_id: null,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        recorded_at: new Date().toISOString(),
      });
    } catch (_) {
      // Ignore errors silently
    } finally {
      isTrackingRef.current = false;
    }
  };

  const startTracking = () => {
    if (trackingIntervalRef.current) return;
    pushLocation();
    trackingIntervalRef.current = setInterval(pushLocation, 30000); // Every 30 seconds
  };

  const stopTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  };

  useEffect(() => {
    const allowedRoles = ['engineer', 'trainer', 'operation_manager'];
    if (user && userProfile && allowedRoles.includes(userProfile.role)) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [user, userProfile]);

  // Also handle visibility change
  useEffect(() => {
    const allowedRoles = ['engineer', 'trainer', 'operation_manager'];
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user && userProfile && allowedRoles.includes(userProfile.role)) {
        pushLocation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, userProfile]);

  return null; // This component doesn't render anything
};
