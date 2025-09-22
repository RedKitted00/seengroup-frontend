// Type declarations for Google Analytics gtag function
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: {
        [key: string]: string | number | boolean;
      }
    ) => void;
  }
}

export {};
