
import React from 'react';

const TopWave = () => (
  <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -z-[1]">
    <svg
      width="100%"
      viewBox="0 0 1440 200" // ViewBox from your provided SVG
      preserveAspectRatio="none" // Ensure it scales non-uniformly if needed, or "xMidYMax meet" to maintain aspect ratio and cover bottom
      xmlns="http://www.w3.org/2000/svg"
      className="relative block w-full h-[120px] sm:h-[150px] md:h-[180px]" // Responsive height
    >
      <defs>
        <linearGradient id="wavyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" /> 
          <stop offset="50%" stopColor="hsl(var(--accent))" /> 
          <stop offset="100%" stopColor="hsl(var(--primary))" /> 
        </linearGradient>
      </defs>
      <path
        d="M0 80 C 180 150, 360 10, 540 80 C 720 150, 900 10, 1080 80 C 1260 150, 1440 10, 1440 80 V 200 H 0 V 80 Z"
        fill="url(#wavyGradient)"
      />
    </svg>
  </div>
);

export default TopWave;
