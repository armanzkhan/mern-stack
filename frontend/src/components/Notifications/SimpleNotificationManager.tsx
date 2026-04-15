'use client';

import { Bell, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useUser } from '@/components/Auth/user-context';
import ManagerNotificationPopup from './ManagerNotificationPopup';

interface SimpleNotificationManagerProps {
  children: React.ReactNode;
}

// Navigate without useRouter to avoid "invariant expected app router to be mounted"
// when this component is rendered in layouts before the App Router context is ready.
function navigateTo(path: string) {
  if (typeof window !== 'undefined') {
    window.location.href = path;
  }
}

export default function SimpleNotificationManager({ children }: SimpleNotificationManagerProps) {
  const { notifications, isConnected } = useRealtimeNotifications();
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const lastShownKeyRef = useRef<string | null>(null);
  const { user, isCustomer } = useUser();

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      const latestKey = `${latestNotification.type}|${latestNotification.title}|${latestNotification.timestamp}`;
      if (lastShownKeyRef.current === latestKey) {
        return;
      }
      lastShownKeyRef.current = latestKey;

      setCurrentNotification(latestNotification);
      setShowNotification(true);
      // Auto-hide after 60 seconds for managers, 5 seconds for others
      const autoHideDelay = user?.isManager ? 60000 : 5000;
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [notifications, user?.isManager]);

  // Ensure we're on the client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle notification navigation
  const handleNotificationNavigate = (orderId: string) => {
    // For customers, always redirect to customer notifications page
    if (user && isCustomer()) {
      navigateTo('/customer-notifications');
      return;
    }
    // Navigate to orders page with order highlighted
    navigateTo(`/orders?highlight=${orderId}`);
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setShowNotification(false);
    setCurrentNotification(null);
  };

  return (
    <>
      {children}
      
      {/* Manager-specific popup or default notification */}
      {isClient && showNotification && currentNotification && (
        <>
          {/* Manager-specific popup */}
          {user?.isManager ? (
            <ManagerNotificationPopup
              notification={currentNotification}
              onClose={handleNotificationClose}
              onNavigate={handleNotificationNavigate}
            />
          ) : (
            /* Default notification for non-managers */
            <div className="fixed right-4 top-4 z-[9999] w-[min(92vw,380px)]">
              <div 
                className="group cursor-pointer overflow-hidden rounded-2xl border border-white/25 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-slate-100 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.55)] dark:border-slate-700/60"
                onClick={() => {
                  // For customers, redirect to customer notifications page
                  if (user && isCustomer()) {
                    navigateTo('/customer-notifications');
                    handleNotificationClose();
                  } else {
                    // For non-customers, navigate to orders page if order-related
                    if (currentNotification.data?.orderId) {
                      handleNotificationNavigate(currentNotification.data.orderId);
                    } else {
                      navigateTo('/orders');
                      handleNotificationClose();
                    }
                  }
                }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.35),transparent_45%)]" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      <Bell className="h-4 w-4 text-sky-300" />
                      <h4 className="line-clamp-1 text-sm font-semibold text-white">
                        {currentNotification.title}
                      </h4>
                      <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-200">
                        New
                      </span>
                    </div>
                    <p className="mb-2 line-clamp-2 text-sm text-slate-200/90">
                      {currentNotification.message}
                    </p>
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-300/80">
                      {isClient ? new Date(currentNotification.timestamp).toLocaleTimeString() : 'Loading...'}
                      <span className="font-medium text-sky-300 group-hover:text-sky-200">Open</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClose();
                    }}
                    className="ml-1 rounded-full border border-white/20 bg-white/10 p-1 text-slate-300 transition-colors hover:text-white"
                    aria-label="Close notification"
                  >
                    <X className="h-4 w-4" />
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
