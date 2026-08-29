import React from 'react';

interface PhishGuardLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

export const PhishGuardLogo: React.FC<PhishGuardLogoProps> = ({
  size = 'md',
  className = '',
  showGlow = true,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const pixelMap = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  };

  const dim = pixelMap[size];

  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 group ${className}`}
      style={{ width: dim, height: dim }}
    >
      {/* Background Neon Halo Glow */}
      {showGlow && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/40 via-blue-600/30 to-purple-600/40 blur-md opacity-80 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Futuristic Vector Shield SVG Emblem */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative w-full h-full drop-shadow-[0_4px_12px_rgba(6,182,212,0.4)] transform group-hover:scale-105 transition-transform duration-300`}
      >
        <defs>
          {/* Primary Gradient */}
          <linearGradient id="pgShieldGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          {/* Dark Glass Inset Gradient */}
          <linearGradient id="pgDarkPlate" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Neon Core Glow */}
          <radialGradient id="pgCoreGlow" cx="50" cy="50" r="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Heavy Aegis Cyber Shield */}
        <path
          d="M50 8L86 22V52C86 73.5 70.8 90.2 50 96C29.2 90.2 14 73.5 14 52V22L50 8Z"
          fill="url(#pgShieldGrad)"
          stroke="#00E5FF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Inner Dark Carbon Armor Plate */}
        <path
          d="M50 14L80 26V50C80 68 67.2 82.5 50 88C32.8 82.5 20 68 20 50V26L50 14Z"
          fill="url(#pgDarkPlate)"
          stroke="#1e293b"
          strokeWidth="1"
        />

        {/* Cyber Grid Lines / Tech Pattern */}
        <path
          d="M50 16V86M24 40H76M28 58H72"
          stroke="#00E5FF"
          strokeWidth="1"
          strokeOpacity="0.25"
          strokeDasharray="2 2"
        />

        {/* Central Neural Radar & Sentinel Core Glow */}
        <circle cx="50" cy="48" r="22" fill="url(#pgCoreGlow)" />

        {/* Tactical Hex Core Node */}
        <polygon
          points="50,34 62,41 62,55 50,62 38,55 38,41"
          fill="#0c1322"
          stroke="#00E5FF"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Glowing Neural Sentinel Eye */}
        <circle cx="50" cy="48" r="6" fill="#00E5FF" className="animate-pulse" />
        <circle cx="50" cy="48" r="2.5" fill="#ffffff" />

        {/* Protective Cyber Claws / Nodes */}
        <path
          d="M38 41L28 32M62 41L72 32M38 55L28 64M62 55L72 64"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
