import React from 'react';

export const MockTestLogoNode = ({ size = 64 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B5BDB" />
        <stop offset="100%" stopColor="#7048E8" />
      </linearGradient>
    </defs>
    
    {/* Base Shape */}
    <rect width="100" height="100" rx="24" fill="url(#ai-gradient)" />
    
    {/* Connecting Nodes */}
    <circle cx="25" cy="25" r="4" fill="white" opacity="0.8" />
    <circle cx="75" cy="25" r="6" fill="white" opacity="0.9" />
    <circle cx="25" cy="75" r="5" fill="white" opacity="0.5" />
    <circle cx="75" cy="75" r="4" fill="white" opacity="0.6" />
    
    <path d="M25 25L75 75M75 25L25 75" stroke="white" strokeWidth="1.5" strokeOpacity="0.2" />
    
    {/* MT Text */}
    <text 
      x="50%" 
      y="54%" 
      dominantBaseline="middle" 
      textAnchor="middle" 
      fill="white" 
      fontSize="38" 
      fontWeight="900" 
      fontFamily="system-ui, sans-serif"
      letterSpacing="-1"
    >
      MT
    </text>
  </svg>
);