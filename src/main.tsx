import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const initApp = () => {
  requestAnimationFrame(() => {
    createRoot(document.getElementById("root")!).render(<App />);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}