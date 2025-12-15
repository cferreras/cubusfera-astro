import React from 'react';

export const DiscordIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="32" 
    height="32" 
    viewBox="0 0 14 14" 
    className={className}
  >
    {/* Icon from Streamline by Streamline - https://creativecommons.org/licenses/by/4.0/ */}
    <g fill="none" stroke="currentColor">
      <path d="M4.112 6.5a.5.5 0 1 0 1 0a.5.5 0 1 0-1 0m4.5 0a.5.5 0 1 0 1 0a.5.5 0 1 0-1 0"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M.858 9.864c0-2.401.858-5.574 1.715-6.86c0 0 .858-.43 4.289-.43s4.288.43 4.288.43c.858 1.286 1.715 4.459 1.715 6.86c-.285.43-1.286 1.373-3.001 1.716l-1.51-1.886a6.6 6.6 0 0 1-2.985 0L3.86 11.58c-1.715-.343-2.716-1.287-3.002-1.716"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.86 9.007c.261.261.81.523 1.509.687a6.6 6.6 0 0 0 2.986 0c.699-.164 1.247-.426 1.509-.687"/>
    </g>
  </svg>
);
