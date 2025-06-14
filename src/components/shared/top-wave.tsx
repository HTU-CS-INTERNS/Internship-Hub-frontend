
import React from 'react';

const TopWave = () => (
  <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -z-[1]">
    <svg
      viewBox="0 0 1440 320" // Standard viewBox for the wave
      xmlns="http://www.w3.org/2000/svg"
      className="relative block w-full h-[180px] sm:h-[220px] md:h-[260px]" // Adjusted height
    >
      <path
        fill="hsl(var(--primary))" // Changed to use theme's primary color
        fillOpacity="1"
        // A slightly less tall wave path to help with fitting content
        d="M0,128L60,133.3C120,139,240,149,360,160C480,171,600,181,720,176C840,171,960,149,1080,138.7C1200,128,1320,128,1380,128L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
      ></path>
    </svg>
  </div>
);

export default TopWave;
