import React from 'react';
import { Capacitor } from '@capacitor/core';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import './styles/app.css';

// Mark native Capacitor runs so safe-area fixes do not change the web layout.
if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add('capacitor-native');
}
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><AuthProvider><AppRoutes/></AuthProvider></BrowserRouter></React.StrictMode>);
