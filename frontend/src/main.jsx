import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { TursoProvider } from './context/TursoContext';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './lib/queryClient';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TursoProvider>
        <App />
      </TursoProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
