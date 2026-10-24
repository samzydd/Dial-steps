import { createRoot } from 'react-dom/client';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@sakaniui/react/tokens.css';
import '@sakaniui/react/style.css';
import './app.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);
