import React from 'react';

interface IconAIAtomOrbitProps {
  size?: number;
  className?: string;
}

export const IconAIAtomOrbit: React.FC<IconAIAtomOrbitProps> = ({ size = 24, className = "", 
  ...props  }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={className}
      aria-label="AI Atom Orbit Thick Icon"
      role="img"
      {...props}
    >
      <defs>
        <linearGradient id="coreGradReact" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#0253a5" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="accentGradReact" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#0253a5" />
        </linearGradient>
      </defs>

      {/* Inti AI */}
      <g transform="translate(50, 50)">
        
        {/* Layer 1: Orbit Atom Berputar ke KANAN SANGAT PELAN (40s) */}
        <g>
          <animateTransform 
            attributeName="transform" 
            type="rotate" 
            from="0 0 0" 
            to="360 0 0" 
            dur="40s" 
            repeatCount="indefinite" 
          />
          {/* Garis Lingkaran Dalam */}
          <circle cx="0" cy="0" r="28" fill="none" stroke="url(#accentGradReact)" strokeWidth="2" strokeDasharray="4 4" opacity="0.7"/>
          
          {/* Garis Orbit Elips Lebih Tebal (strokeWidth=3.5) */}
          <ellipse cx="0" cy="0" rx="44" ry="13" fill="none" stroke="url(#coreGradReact)" strokeWidth="3.5" />
          <ellipse cx="0" cy="0" rx="44" ry="13" fill="none" stroke="url(#coreGradReact)" strokeWidth="3.5" transform="rotate(60)" />
          <ellipse cx="0" cy="0" rx="44" ry="13" fill="none" stroke="url(#coreGradReact)" strokeWidth="3.5" transform="rotate(120)" />
        </g>

        {/* Layer 2: Inti Pusat Lebih Tebal */}
        <circle cx="0" cy="0" r="12" fill="url(#coreGradReact)" opacity="0.9" />
        <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
      </g>
    </svg>

  );
};
