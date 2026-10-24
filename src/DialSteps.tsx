import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { IconButton } from '@sakaniui/react';

type IconProps = { size?: number | string; strokeWidth?: number | string; className?: string };
const chev = (d: string) => ({ size = 20, strokeWidth = 1.5, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d={d} /></svg>
);
const ChevUp = chev('M6 15l6 -6l6 6');
const ChevDown = chev('M6 9l6 6l6 -6');
const ChevLeft = chev('M15 6l-6 6l6 6');
const ChevRight = chev('M9 6l6 6l-6 6');

export type DialStep = { title: string; description: string };
export type DialStepsProps = {
  steps: DialStep[];
  /** Controlled index (optional). */
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  /** `desktop`: arc on the left, text to the right. `mobile`: arc across the top, text below. */
  layout?: 'desktop' | 'mobile';
  /** Radius of the dial in px. */
  radius?: number;
  /** `arc` (default) curves the steps round a dial; `straight` lays them along a straight line. */
  shape?: 'arc' | 'straight';
  /** Arc: degrees between steps. Straight: pixels between steps. */
  spacing?: number;
  /** Show previous / next buttons and a step counter. Defaults to true. */
  controls?: boolean;
  className?: string;
};

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A rotary step selector. The wheel turns so the active step sits on the reading line;
 * the others fan out along the arc, tilted with it. Scroll, drag, arrow keys or click to move.
 */
export function DialSteps({ steps, value, defaultValue = 0, onChange, layout = 'desktop', shape = 'arc', radius, spacing, controls = true, className }: DialStepsProps) {
  const [inner, setInner] = useState(defaultValue);
  const active = value ?? inner;
  const desktop = layout === 'desktop';
  const R = radius ?? (desktop ? 380 : 230);
  const straight = shape === 'straight';
  const gap = spacing ?? (straight ? (desktop ? 100 : 124) : desktop ? 22 : 26);
  const base = desktop ? 0 : -90; // direction of the reading line, in degrees
  const rootRef = useRef<HTMLDivElement>(null);

  const go = useCallback((i: number) => {
    const n = Math.max(0, Math.min(steps.length - 1, i));
    if (value === undefined) setInner(n);
    onChange?.(n);
  }, [steps.length, value, onChange]);

  // wheel / trackpad: one step per gesture tick, throttled
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let lock = 0;
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(d) < 4) return;
      e.preventDefault();
      const now = performance.now();
      if (now < lock) return;
      lock = now + 320;
      go(active + (d > 0 ? 1 : -1));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [active, go]);

  // drag: vertical on desktop, horizontal on mobile
  const drag = useRef<{ start: number; from: number; moved: boolean } | null>(null);
  const [dragDeg, setDragDeg] = useState(0);
  const suppressClick = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { start: desktop ? e.clientY : e.clientX, from: active, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const px = (desktop ? e.clientY : e.clientX) - d.start;
    if (Math.abs(px) > 4 && !d.moved) { d.moved = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }
    if (!d.moved) return;
    // arc: arc length -> degrees. straight: pixels as-is.
    setDragDeg(straight ? px : px / (R * Math.PI / 180));
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && d.moved) { go(d.from - Math.round(dragDeg / gap)); suppressClick.current = true; setTimeout(() => { suppressClick.current = false; }, 0); }
    setDragDeg(0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const next = desktop ? ['ArrowDown', 'ArrowRight'] : ['ArrowRight', 'ArrowDown'];
    const prev = desktop ? ['ArrowUp', 'ArrowLeft'] : ['ArrowLeft', 'ArrowUp'];
    if (next.includes(e.key)) { e.preventDefault(); go(active + 1); }
    else if (prev.includes(e.key)) { e.preventDefault(); go(active - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(steps.length - 1); }
  };

  const wheelDeg = -active * gap + dragDeg;
  const wheelTf = straight ? (desktop ? `translateY(${wheelDeg}px)` : `translateX(${wheelDeg}px)`) : `rotate(${wheelDeg}deg)`;
  const SM = 720; // half-extent of the straight grid
  const uid = `dg-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const RM = Math.round(R * 1.9);
  const fx = R * Math.cos((base * Math.PI) / 180);
  const fy = R * Math.sin((base * Math.PI) / 180);
  // spokes sit halfway between steps, so every number is centred in its own wedge
  const spokes = Array.from({ length: Math.ceil(360 / gap) + 2 }, (_, k) => (k - Math.ceil(180 / gap) - 1 + 0.5) * gap);
  const cur = steps[active];

  return (
    <div
      ref={rootRef}
      className={`dial dial--${layout} dial--${shape} ${drag.current ? 'is-dragging' : ''} ${className ?? ''}`}
      style={{ ['--R' as string]: `${R}px`, ['--RM' as string]: `${RM}px` }}
      tabIndex={0}
      role="group"
      aria-roledescription="dial"
      aria-label={`Step ${active + 1} of ${steps.length}: ${cur.title}`}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="dial-center">
        {straight ? (
          <>
            {/* straight grid: bands between steps that slide with the wheel, plus guide lines, faded around the focus point */}
            <svg className="dial-grid dial-grid--straight" width={SM * 2} height={SM * 2} viewBox={`${-SM} ${-SM} ${SM * 2} ${SM * 2}`} aria-hidden="true">
              <defs>
                <radialGradient id={`${uid}-sfade`} gradientUnits="userSpaceOnUse" cx="0" cy="0" r="560">
                  <stop offset="0" stopColor="#fff" stopOpacity="1" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
                <mask id={`${uid}-smask`} maskUnits="userSpaceOnUse" x={-SM} y={-SM} width={SM * 2} height={SM * 2}>
                  <rect x={-SM} y={-SM} width={SM * 2} height={SM * 2} fill={`url(#${uid}-sfade)`} />
                </mask>
              </defs>
              <g mask={`url(#${uid}-smask)`}>
                {[-300, -220, -150, -90, 90, 150, 220, 300].map((g) => (
                  <line key={g} className="dial-grid-ring" x1={desktop ? g : -SM} x2={desktop ? g : SM} y1={desktop ? -SM : g} y2={desktop ? SM : g} />
                ))}
                <g className={`dial-grid-spokes ${dragDeg ? 'is-live' : ''}`} style={{ transform: wheelTf }}>
                  {Array.from({ length: steps.length + 5 }, (_, k) => (k - 2 - 0.5) * gap).map((p) => (
                    <line key={p} className="dial-spoke" x1={desktop ? 0 : p} x2={desktop ? SM : p} y1={desktop ? p : 0} y2={desktop ? p : SM} />
                  ))}
                </g>
              </g>
            </svg>
            <span className="dial-line" aria-hidden="true" />
          </>
        ) : (
          <>
        <svg className="dial-grid" width={RM * 2} height={RM * 2} viewBox={`${-RM} ${-RM} ${RM * 2} ${RM * 2}`} aria-hidden="true">
          <defs>
            <radialGradient id={`${uid}-fade`} gradientUnits="userSpaceOnUse" cx={fx} cy={fy} r={R * 1.25}>
              <stop offset="0" stopColor="#fff" stopOpacity="1" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id={`${uid}-mask`} maskUnits="userSpaceOnUse" x={-RM} y={-RM} width={RM * 2} height={RM * 2}>
              <rect x={-RM} y={-RM} width={RM * 2} height={RM * 2} fill={`url(#${uid}-fade)`} />
            </mask>
          </defs>
          <g mask={`url(#${uid}-mask)`}>
            {[0.55, 0.7, 0.85, 1.15, 1.3, 1.5, 1.75].map((k) => (
              <circle key={k} r={R * k} className="dial-grid-ring" />
            ))}
            <g className={`dial-grid-spokes ${dragDeg ? 'is-live' : ''}`} style={{ transform: `rotate(${wheelDeg}deg)` }}>
              {spokes.map((deg) => (
                <line key={deg} x1={R * 0.55} y1="0" x2={RM} y2="0" transform={`rotate(${base + deg})`} className="dial-spoke"  />
              ))}
            </g>
          </g>
        </svg>
        <svg className="dial-ring" width={R * 2} height={R * 2} viewBox={`0 0 ${R * 2} ${R * 2}`} aria-hidden="true">
          <circle cx={R} cy={R} r={R - 0.5} fill="none" />
        </svg>
          </>
        )}
        {/* the black "main" dot stays on the reading line; grey dots slide through it and hand it on */}
        {/* the black main dot stays put; each new dot slides into it */}
        <span className="dial-main" aria-hidden="true">
          <span key={active} className="dial-main-dot">
            <i className="core" />
          </span>
        </span>
        <div className={`dial-wheel ${dragDeg ? 'is-live' : ''}`} style={{ transform: wheelTf }}>
          {steps.map((s, i) => {
            const off = i - active;
            const dist = Math.abs(off);
            return (
              <div
                key={s.title}
                className={`dial-item ${off === 0 ? 'is-active' : ''}`}
                style={{
                  transform: straight ? (desktop ? `translateY(${i * gap}px)` : `translateX(${i * gap}px)`) : `rotate(${base + i * gap}deg) translateX(${R}px) rotate(${-base}deg)`,
                  ['--dist' as string]: dist,
                }}
              >
                <span className="dial-dot" />
                <button
                  type="button"
                  className="dial-num"
                  tabIndex={-1}
                  aria-label={`Go to ${s.title}`}
                  aria-current={off === 0 ? 'step' : undefined}
                  onClick={() => { if (!suppressClick.current) go(i); }}
                >
                  {pad(i + 1)}
                </button>
                {/* the description rides with its number: carried round by the wheel, held upright by a matching counter-rotation */}
                <div
                  className={`dial-copy-wrap ${dragDeg ? 'is-live' : ''}`}
                  style={{ transform: straight ? undefined : `rotate(${-(wheelDeg + i * gap)}deg)` }}
                  aria-hidden="true"
                >
                  <div className={`dial-copy ${off === 0 ? 'is-active' : off < 0 ? 'is-before' : 'is-after'}`}>
                    <strong>{s.title}</strong>
                    <span>{s.description}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sr-only" aria-live="polite">{cur.title}: {cur.description}</div>

      {controls && (
        <div className="dial-nav" onPointerDown={(e) => e.stopPropagation()}>
          <IconButton icon={(desktop ? ChevUp : ChevLeft) as never} variant="outline" size="md" aria-label="Previous step" disabled={active === 0} onClick={() => go(active - 1)} />
          <span className="dial-count" aria-hidden="true"><b>{pad(active + 1)}</b> / {pad(steps.length)}</span>
          <IconButton icon={(desktop ? ChevDown : ChevRight) as never} variant="outline" size="md" aria-label="Next step" disabled={active === steps.length - 1} onClick={() => go(active + 1)} />
        </div>
      )}
    </div>
  );
}