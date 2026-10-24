# Dial Steps

A rotary step component with **arc** and **straight** variants, each in **desktop** and **mobile** layouts. A custom component styled with [`@sakaniui/react`](https://www.npmjs.com/package/@sakaniui/react) tokens, using its `IconButton` for the navigation buttons.

**[Live demo](https://claude.ai/artifact/DrXrxhN6S6Ya1bmxTqyfif)**: arc and straight, desktop and mobile, light and dark.

## Run

```bash
npm install
npm run dev     # http://127.0.0.1:5177
npm run build
```

## Usage

```tsx
import { DialSteps } from './src/DialSteps';

<DialSteps
  steps={[{ title: 'Instant', description: 'responds before you notice.' }]}
  layout="desktop"   // 'desktop' | 'mobile'
  shape="arc"        // 'arc' | 'straight'
/>
```

| Prop | Type | Notes |
| --- | --- | --- |
| `steps` | `{ title, description }[]` | One entry per step |
| `value` / `defaultValue` / `onChange` | `number` | Controlled or uncontrolled active index |
| `layout` | `'desktop' \| 'mobile'` | Vertical dial/line on desktop, horizontal on mobile |
| `shape` | `'arc' \| 'straight'` | Curved dial or straight line |
| `radius` | `number` | Arc only |
| `spacing` | `number` | Arc: degrees between steps. Straight: pixels |
| `controls` | `boolean` | Show the prev/next buttons and counter (default `true`) |

Interactions: mouse wheel, drag, arrow keys, Home/End, clicking a number, and the nav buttons.

See `src/App.tsx` for the demo (arc and straight, desktop and mobile, light and dark).
