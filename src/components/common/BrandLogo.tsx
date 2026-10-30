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
        height={Math.round(currentSize.logo * 136 / 220)}
        viewBox="0 0 220 136"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="حُرّ HURR"
        className="shrink-0"
      >
        <defs>
          <linearGradient id={gradientId} x1="35" y1="24" x2="185" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={goldStops[0]} />
            <stop offset="0.48" stopColor={goldStops[1]} />
            <stop offset="1" stopColor={goldStops[2]} />
          </linearGradient>
        </defs>

        <text
          x="110"
          y="68"
          textAnchor="middle"
          direction="rtl"
          unicodeBidi="plaintext"
          fontFamily="'Amiri', 'Traditional Arabic', serif"
          fontSize="70"
          fontWeight="700"
          fill={`url(#${gradientId})`}
        >
          حُرّ
        </text>
        <text
          x="110"
          y="105"
          textAnchor="middle"
          fontFamily="'Cinzel', Georgia, serif"
          fontSize="26"
          fontWeight="600"
          letterSpacing="10"
          fill="url(#hurrWordmarkGold)"
        >
          HURR
        </text>
        <path d="M34 123H88M132 123H186" stroke={`url(#${gradientId})`} strokeWidth="1.5" />
        <path d="M110 116L117 123L110 130L103 123L110 116Z" fill="url(#hurrWordmarkGold)" />
      </svg>

      {showSubtitle && (
        <span className={`mt-0.5 text-center font-sans tracking-wide text-[#A69F90] leading-tight ${currentSize.sub}`}>
          دار العطور الشرقية الفاخرة · القاهرة
        </span>
      )}
    </div>
  );
};
