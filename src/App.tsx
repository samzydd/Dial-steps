import { useState } from 'react';
import { SegmentedControl } from '@sakaniui/react';
import { DialSteps } from './DialSteps';

const STEPS = [
  { title: 'Instant', description: 'responds before you finish the gesture.' },
  { title: 'Quiet', description: 'speaks up only when it matters.' },
  { title: 'Ambient', description: 'already on and never turns off.' },
  { title: 'Personal', description: 'learns your rhythm, not your data.' },
  { title: 'Lasting', description: 'built to outlive the next update.' },
  { title: 'Open', description: 'plays well with the tools you already use.' },
];

export function App() {
  const [i, setI] = useState(2);
  const [theme, setTheme] = useState('light');
  return (
    <main className={`stage ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="bar">
        <div>
          <h1>Dial Steps</h1>
          <p>Scroll, drag, use the arrow keys or click a number. Both versions share one state.</p>
        </div>
        <SegmentedControl options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} value={theme} onChange={setTheme} />
      </header>
      {(['arc', 'straight'] as const).map((shape) => (
        <div className="row" key={shape}>
          <section className="frame frame--desktop" aria-label={`${shape} desktop`}>
            <span className="tag">{shape === 'arc' ? 'Arc' : 'Straight'} · Desktop · 760 × 640</span>
            <DialSteps steps={STEPS} value={i} onChange={setI} layout="desktop" shape={shape} />
          </section>
          <section className="frame frame--mobile" aria-label={`${shape} mobile`}>
            <span className="tag">{shape === 'arc' ? 'Arc' : 'Straight'} · Mobile · 390 × 640</span>
            <DialSteps steps={STEPS} value={i} onChange={setI} layout="mobile" shape={shape} />
          </section>
        </div>
      ))}
    </main>
  );
}
