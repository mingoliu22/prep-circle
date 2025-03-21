
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function getInitials(name: string): string {
  if (!name) return '';
  const nameParts = name.split(' ');
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Helper function to determine if we're on a mobile device
export function isMobileDevice(): boolean {
  return window.innerWidth < 768;
}

// Animation helper - adds appropriate animation class based on the type
export function getAnimationClass(type: 'fade' | 'slide' | 'scale' | 'blur' = 'fade'): string {
  switch (type) {
    case 'fade':
      return 'animate-fade-in';
    case 'slide':
      return 'animate-slide-in-right';
    case 'scale':
      return 'animate-scale-in';
    case 'blur':
      return 'animate-blur-in';
    default:
      return 'animate-fade-in';
  }
}
