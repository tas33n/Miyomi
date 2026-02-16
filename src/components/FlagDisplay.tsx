import React from 'react';
import { Globe } from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';

interface FlagDisplayProps {
  region: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function FlagDisplay({ region, size = 'medium', className = '' }: FlagDisplayProps) {
  // Parse region string to extract country codes
  const parseRegion = (regionStr: string): string[] => {
    if (!regionStr) return [];
    
    // Handle special case for "ALL" or global
    if (regionStr.toUpperCase() === 'ALL') {
      return ['all']; // Return lowercase for consistency
    }
    
    // Split by comma for multiple countries (e.g., "BR,TR")
    return regionStr.split(',').map(code => code.trim().toLowerCase());
  };

  const countryCodes = parseRegion(region);
  
  // Size mapping for flag display
  const sizeClasses = {
    small: 'w-5 h-4',
    medium: 'w-6 h-5',
    large: 'w-8 h-6',
  };

  // Handle ALL/Global region
  if (countryCodes.includes('all')) {
    return (
      <span className={`inline-flex items-center gap-1 text-sm ${className}`}>
        <Globe className="w-4 h-4 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-secondary)]">Global</span>
      </span>
    );
  }

  // Render country flags using CSS flag-icons
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {countryCodes.map((code, index) => (
        <span
          key={index}
          className={`fi fi-${code} ${sizeClasses[size]} inline-block rounded-sm`}
          title={code.toUpperCase()}
          aria-label={`${code.toUpperCase()} flag`}
          style={{ 
            boxShadow: '0 0 1px rgba(0,0,0,0.2)',
            verticalAlign: 'middle'
          }}
        />
      ))}
    </span>
  );
}
