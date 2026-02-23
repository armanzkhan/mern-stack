'use client';

import { useEffect, useState } from 'react';
import { pushNotificationService } from '@/services/pushNotificationService';

interface PWAProviderProps {
  children: React.ReactNode;
}

export default function PWAProvider({ children }: PWAProviderProps) {
  const [isPWAReady, setIsPWAReady] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isClient, setIsClient] = useState(false);
  const [showPWAInstallPrompt, setShowPWAInstallPrompt] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const initializePWA = async () => {
      try {
        console.log('🚀 Initializing PWA...');
        
        // Register service worker
        const registration = await pushNotificationService.registerServiceWorker();
        if (registration) {
          console.log('✅ Service worker registered');
        }

        // Check notification permission
        const permission = Notification.permission;
        setNotificationPermission(permission);
        console.log('🔔 Notification permission:', permission);

        // Request notification permission if not granted
        if (permission === 'default') {
          const newPermission = await Notification.requestPermission();
          setNotificationPermission(newPermission);
          console.log('🔔 Notification permission requested:', newPermission);
        }

        // Subscribe to push notifications if permission is granted
        if (permission === 'granted' || Notification.permission === 'granted') {
          try {
            const subscription = await pushNotificationService.subscribeToPush();
            if (subscription) {
              console.log('✅ Push notifications subscribed');
            }
          } catch (error) {
            console.warn('⚠️ Push notification subscription failed:', error);
          }
        }

        setIsPWAReady(true);
        console.log('✅ PWA initialization complete');
      } catch (error) {
        console.error('❌ PWA initialization failed:', error);
        setIsPWAReady(true); // Continue anyway
      }
    };

    initializePWA();
  }, [isClient]);

  // Show notification permission prompt if needed
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Subscribe to push notifications
        await pushNotificationService.subscribeToPush();
        console.log('✅ Notification permission granted and subscribed');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  return (
    <>
      {children}
      
      {/* Only render prompts on client side to prevent hydration issues */}
      {isClient && (
        <>
          {/* Notification permission prompt */}
          {notificationPermission === 'denied' && (
            <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    Notifications are blocked. Please enable them in your browser settings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {notificationPermission === 'default' && (
            <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg shadow-lg z-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    Enable notifications to receive real-time updates.
                  </p>
                  <button
                    onClick={requestNotificationPermission}
                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Enable Notifications
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PWA install prompt */}
          {isPWAReady && showPWAInstallPrompt && (
            <div className="fixed top-4 right-4 left-4 sm:left-auto bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm sm:max-w-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">
                    PWA is ready! You can install this app on your device.
                  </p>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <button
                    onClick={() => setShowPWAInstallPrompt(false)}
                    className="text-green-500 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-full p-1 transition-colors duration-200"
                    aria-label="Close PWA install prompt"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
