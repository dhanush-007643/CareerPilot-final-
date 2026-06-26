import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0D1530',
            color: '#F1F5F9',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '12px',
          },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);
