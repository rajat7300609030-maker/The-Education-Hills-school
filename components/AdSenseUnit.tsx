import React, { useEffect, useRef } from 'react';

interface AdSenseUnitProps {
  clientId: string;
  unitId: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  testMode?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseUnit: React.FC<AdSenseUnitProps> = ({ 
  clientId, 
  unitId, 
  format = 'auto', 
  style = { display: 'block', minWidth: '250px' },
  className = "",
  testMode = false
}) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (testMode) return;

    const pushAd = () => {
      try {
        // Check if the script is loaded and the element exists
        if (window.adsbygoogle && adRef.current) {
          // Only push if the element hasn't been processed yet
          // AdSense adds data-adsbygoogle-status once it starts processing
          const status = adRef.current.getAttribute('data-adsbygoogle-status');
          if (!status) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        }
      } catch (e: any) {
        // Silently catch "All 'ins' elements already have ads" error
        if (e.message && e.message.includes('already have ads')) {
          return;
        }
        console.error('AdSense push error:', e);
      }
    };

    // Use a small delay to ensure the container has width and is visible
    const timer = setTimeout(() => {
      // requestAnimationFrame ensures we are in the next paint cycle
      requestAnimationFrame(pushAd);
    }, 500);

    return () => clearTimeout(timer);
  }, [unitId]);

  if (testMode) {
    return (
      <div className={`adsense-container overflow-hidden rounded-2xl bg-orange-50 border-2 border-dashed border-orange-200 flex flex-col items-center justify-center min-h-[100px] w-full p-4 ${className}`}>
        <div className="text-orange-400 text-2xl mb-1">💰</div>
        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">AdSense Test Mode</p>
        <p className="text-[8px] text-orange-300 font-bold mt-1">Slot: {unitId}</p>
      </div>
    );
  }

  return (
    <div className={`adsense-container overflow-hidden rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center justify-center min-h-[100px] w-full ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={clientId}
        data-ad-slot={unitId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseUnit;
