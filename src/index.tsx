import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * Boots the app into `#root`.
 *
 * The element is declared in `public/index.html`, so its absence means the
 * page shell is broken and there is nothing useful to render.
 */
const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Missing #root element; cannot start.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
