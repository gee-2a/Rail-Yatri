import { useEffect, useRef } from 'react';

export default function TrainAnimation() {
  const moverRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const updateTrain = () => {
      const mover = moverRef.current;
      const progress = progressRef.current;
      if (!mover || !progress) return;
      const totalH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = totalH > 0 ? Math.min(Math.max(window.scrollY / totalH, 0), 1) : 0;
      const maxX = window.innerWidth - 175;
      mover.style.transform = `translate3d(${pct * maxX}px, 0, 0)`;
      progress.style.width = `${pct * 100}%`;
    };
    window.addEventListener('scroll', updateTrain, { passive: true });
    window.addEventListener('resize', updateTrain, { passive: true });
    setTimeout(updateTrain, 50);
    return () => {
      window.removeEventListener('scroll', updateTrain);
      window.removeEventListener('resize', updateTrain);
    };
  }, []);

  return (
    <div
      data-testid="train-animation"
      style={{ position: 'fixed', bottom: 0, left: 0, width: '100vw', height: '100px', zIndex: 9999, pointerEvents: 'none' }}
    >
      <svg viewBox="0 0 1536 24" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '20px' }}>
        <rect x="0" y="4" width="1536" height="3" rx="1.5" fill="#E5E5E5" />
        <rect x="0" y="14" width="1536" height="3" rx="1.5" fill="#E5E5E5" />
      </svg>
      <div ref={progressRef} style={{ position: 'absolute', bottom: '5px', left: 0, height: '3px', background: 'linear-gradient(to right, #E63946, #1D3557)', borderRadius: '2px', transition: 'width 0.1s linear' }} />
      <div ref={moverRef} style={{ position: 'absolute', bottom: '16px', left: 0, willChange: 'transform', transition: 'transform 0.05s linear' }}>
        <svg width="150" height="80" viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
          <circle className="smoke1" cx="28" cy="18" r="7" fill="rgba(29,53,87,0.3)" />
          <circle className="smoke2" cx="22" cy="12" r="5" fill="rgba(29,53,87,0.2)" />
          <circle className="smoke3" cx="35" cy="8" r="4" fill="rgba(29,53,87,0.15)" />
          <rect x="22" y="28" width="10" height="14" rx="2" fill="#1D3557" />
          <rect x="10" y="38" width="90" height="36" rx="8" fill="#E63946" />
          <rect x="95" y="30" width="52" height="44" rx="6" fill="#1D3557" />
          <rect x="100" y="36" width="18" height="14" rx="3" fill="#FAFAFA" opacity="0.9" />
          <rect x="123" y="36" width="18" height="14" rx="3" fill="#FAFAFA" opacity="0.9" />
          <rect x="101" y="37" width="5" height="4" rx="1" fill="white" opacity="0.6" />
          <rect x="124" y="37" width="5" height="4" rx="1" fill="white" opacity="0.6" />
          <ellipse cx="50" cy="38" rx="14" ry="8" fill="#C1121F" />
          <circle cx="10" cy="52" r="5" fill="#F0C38E" />
          <circle cx="10" cy="52" r="3" fill="white" />
          <rect x="0" y="66" width="12" height="4" rx="2" fill="#1D3557" />
          <rect x="148" y="66" width="12" height="4" rx="2" fill="#1D3557" />
          <g transform="translate(30,72)">
            <circle className="wheel-spin" cx="0" cy="0" r="12" fill="#1D3557" />
            <circle cx="0" cy="0" r="5" fill="#457B9D" />
            <line className="wheel-spin" x1="-10" y1="0" x2="10" y2="0" stroke="#FAFAFA" strokeWidth="2" />
            <line className="wheel-spin" x1="0" y1="-10" x2="0" y2="10" stroke="#FAFAFA" strokeWidth="2" />
          </g>
          <g transform="translate(62,72)">
            <circle className="wheel-spin" cx="0" cy="0" r="12" fill="#1D3557" />
            <circle cx="0" cy="0" r="5" fill="#457B9D" />
            <line className="wheel-spin" x1="-10" y1="0" x2="10" y2="0" stroke="#FAFAFA" strokeWidth="2" />
            <line className="wheel-spin" x1="0" y1="-10" x2="0" y2="10" stroke="#FAFAFA" strokeWidth="2" />
          </g>
          <g transform="translate(105,72)">
            <circle className="wheel-spin" cx="0" cy="0" r="10" fill="#1D3557" />
            <circle cx="0" cy="0" r="4" fill="#457B9D" />
            <line className="wheel-spin" x1="-8" y1="0" x2="8" y2="0" stroke="#FAFAFA" strokeWidth="2" />
            <line className="wheel-spin" x1="0" y1="-8" x2="0" y2="8" stroke="#FAFAFA" strokeWidth="2" />
          </g>
          <g transform="translate(133,72)">
            <circle className="wheel-spin" cx="0" cy="0" r="10" fill="#1D3557" />
            <circle cx="0" cy="0" r="4" fill="#457B9D" />
            <line className="wheel-spin" x1="-8" y1="0" x2="8" y2="0" stroke="#FAFAFA" strokeWidth="2" />
            <line className="wheel-spin" x1="0" y1="-8" x2="0" y2="8" stroke="#FAFAFA" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}
