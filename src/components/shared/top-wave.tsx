
import React from 'react';

const TopWave = () => (
  <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -z-[1]">
    <svg
      viewBox="0 0 1440 320"
      xmlns="http://www.w3.org/2000/svg"
      className="relative block w-full h-[220px] sm:h-[280px] md:h-[320px]"
    >
      <path
        fill="hsl(195, 47%, 32%)"
        fillOpacity="1"
        d="M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,186.7C672,160,768,128,864,122.7C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
      ></path>
    </svg>
  </div>
);

export default TopWave;
