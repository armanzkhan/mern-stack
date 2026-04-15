"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/Auth/user-context';
import { BellRing, CheckCircle2, Info, Package2, X } from 'lucide-react';

interface ManagerNotificationPopupProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: 'order' | 'status' | 'info';
    data?: {
      orderId?: string;
      orderNumber?: string;
      categories?: string[];
      entityType?: string;
      entityId?: string;
      action?: string;
      url?: string;
    };
    timestamp: string;
  };
  onClose: () => void;
  onNavigate: (orderId: string) => void;
}

export default function ManagerNotificationPopup({ 
  notification, 
  onClose, 
  onNavigate 
}: ManagerNotificationPopupProps) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();
  const { user, isCustomer } = useUser();

  // Auto-dismiss timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsVisible(false);
          setTimeout(() => onClose(), 300); // Allow fade out animation
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  // Handle notification click
  const handleNotificationClick = () => {
    // For customers, always redirect to customer notifications page
    if (user && isCustomer()) {
      router.push('/customer-notifications');
      onClose();
      return;
    }
    
    if (notification.data?.orderId) {
      // Navigate to orders page with order highlighted
      onNavigate(notification.data.orderId);
      onClose();
    } else if (notification.data?.url) {
      // Navigate to specific URL
      router.push(notification.data.url);
      onClose();
    } else {
      // Default: go to orders page
      router.push('/orders');
      onClose();
    }
  };

  // Handle close button
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  // Get notification icon based on type
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'order':
        return <Package2 className="h-5 w-5 text-sky-300" />;
      case 'status':
        return <CheckCircle2 className="h-5 w-5 text-emerald-300" />;
      default:
        return <Info className="h-5 w-5 text-amber-300" />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = () => {
    switch (notification.type) {
      case 'order':
        return 'from-sky-600/30 to-blue-500/10';
      case 'status':
        return 'from-emerald-500/30 to-emerald-500/10';
      default:
        return 'from-amber-500/30 to-amber-500/10';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-4 z-50 w-[min(92vw,390px)]">
      <div 
        className={`
          relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-slate-100 shadow-2xl backdrop-blur-xl
          transform transition-all duration-300 ease-in-out
          hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.55)]
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
        onClick={handleNotificationClick}
      >
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${getNotificationColor()}`} />

        {/* Header */}
        <div className="relative mb-2 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <BellRing className="h-4 w-4 text-slate-200" />
            </div>
            {getNotificationIcon()}
            <div>
              <h4 className="line-clamp-1 text-sm font-semibold text-white">
                {notification.title}
              </h4>
              <p className="text-xs text-slate-300">Manager Notification</p>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="rounded-full border border-white/20 bg-white/10 p-1 text-slate-300 transition-colors hover:text-white"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message */}
        <p className="relative mb-3 line-clamp-2 text-sm text-slate-200/95">
          {notification.message}
        </p>

        {/* Order info if available */}
        {notification.data?.orderNumber && (
          <div className="relative mb-2 text-xs text-slate-300/90">
            Order: {notification.data.orderNumber}
          </div>
        )}

        {/* Categories info if available */}
        {notification.data?.categories && notification.data.categories.length > 0 && (
          <div className="relative mb-2 text-xs text-slate-300/90">
            Categories: {notification.data.categories.join(', ')}
          </div>
        )}

        {/* Manager categories info */}
        {user?.isManager && user?.managerProfile?.assignedCategories && (
          <div className="relative mb-2 text-xs text-sky-300">
            Your Categories: {user.managerProfile.assignedCategories.join(', ')}
          </div>
        )}

        {/* Footer with timer and action */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-sky-300 animate-pulse"></div>
            <span className="text-xs text-slate-300/90">
              Auto-dismiss in {timeLeft}s
            </span>
          </div>
          
          <div className="text-xs font-medium text-sky-300">
            Click to view →
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-2 h-1 w-full rounded-full bg-white/20">
          <div 
            className="h-1 rounded-full bg-sky-300 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 60) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
