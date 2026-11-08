import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  variant?: 'gold' | 'light' | 'monochrome';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  variant = 'gold',
}) => {
  const sizeMap = {
    sm: { logo: 88, sub: 'text-[8px]' },
    md: { logo: 108, sub: 'text-[9px]' },
    lg: { logo: 142, sub: 'text-[10px]' },
    xl: { logo: 184, sub: 'text-xs' },
  };
  const currentSize = sizeMap[size];
  const gradientId = React.useId().replace(/:/g, '');
  const goldStops = variant === 'light'
    ? ['#FFFFFF', '#F1E5C4', '#FFFFFF']
    : variant === 'monochrome'
      ? ['#C5A059', '#A98338', '#886523']
      : ['#FFF1CC', '#D4AF37', '#A98338'];

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        width={currentSize.logo}
        height={Math.round(currentSize.logo * 104 / 220)}
        viewBox="0 0 220 104"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="حُرّ HURR"
        className="shrink-0"
      >
        <defs>
          <linearGradient id={gradientId} x1="35" y1="12" x2="185" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={goldStops[0]} />
            <stop offset="0.48" stopColor={goldStops[1]} />
            <stop offset="1" stopColor={goldStops[2]} />
          </linearGradient>
        </defs>

        <g fill="none" stroke={`url(#${gradientId})`} strokeLinecap="round" strokeWidth="2.2">
          <path d="M88 45C68 41 53 27 43 10C60 16 76 26 91 38" />
          <path d="M87 46C67 47 52 39 36 29" />
          <path d="M86 50C65 54 48 50 30 43" />
          <path d="M87 54C67 62 52 62 36 59" />
          <path d="M90 57C76 68 64 73 51 74" />
          <path d="M132 45C152 41 167 27 177 10C160 16 144 26 129 38" />
          <path d="M133 46C153 47 168 39 184 29" />
          <path d="M134 50C155 54 172 50 190 43" />
          <path d="M133 54C153 62 168 62 184 59" />
          <path d="M130 57C144 68 156 73 169 74" />
        </g>
        <text
          x="110"
          y="51"
          textAnchor="middle"
          direction="rtl"
          unicodeBidi="plaintext"
          fontFamily="'Amiri', 'Traditional Arabic', serif"
          fontSize="46"
          fontWeight="700"
          fill={`url(#${gradientId})`}
        >
          حُرّ
        </text>
        <text
          x="110"
          y="83"
          textAnchor="middle"
          fontFamily="'Cinzel', Georgia, serif"
          fontSize="18"
          fontWeight="600"
          letterSpacing="10"
          fill={`url(#${gradientId})`}
        >
          HURR
        </text>
        <path d="M58 96H94M126 96H162" stroke={`url(#${gradientId})`} strokeWidth="1.2" />
        <path d="M110 91L115 96L110 101L105 96Z" fill={`url(#${gradientId})`} />
      </svg>

      {showSubtitle && (
        <span className={`mt-0.5 text-center font-sans tracking-wide text-[#A69F90] leading-tight ${currentSize.sub}`}>
          هويةٌ عربية · أصالةٌ ووقار
        </span>
      )}
    </div>
  );
};
