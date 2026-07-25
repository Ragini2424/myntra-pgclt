import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CityThemeProvider } from './contexts/CityThemeContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CityThemeProvider>
      <App />
    </CityThemeProvider>
  </StrictMode>,
);
