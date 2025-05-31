import React from 'react';

export function FinStackLogo({ className }: { className?: string }) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M85 50C85 71.0051 69.0051 89 50 89C30.9949 89 15 71.0051 15 50C15 28.9949 30.9949 11 50 11"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 50C50 62.8528 39.8528 74 29 74"
        stroke="hsl(var(--background))"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="40"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="var(--font-lato), sans-serif"
      >
        F
      </text>
    </svg>
  );
}
