import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
}

export function CheckCircleIcon({ size = 18, weight = 'fill', className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z" />
    </svg>
  );
}

export const CheckCircle = CheckCircleIcon;

export function CircleNotchIcon({ size = 18, weight = 'bold', className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight === 'bold' ? 24 : 16}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M168,40a96,96,0,1,1-80,0" />
    </svg>
  );
}

export const CircleNotch = CircleNotchIcon;

export function HouseIcon({ size = 14, weight = 'fill', className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M218.83,103.77l-80-75.59a13.93,13.93,0,0,0-17.66,0l-80,75.59A14,14,0,0,0,36,114v94a14,14,0,0,0,14,14H206a14,14,0,0,0,14-14V114A14,14,0,0,0,218.83,103.77Z" />
    </svg>
  );
}

export const House = HouseIcon;
