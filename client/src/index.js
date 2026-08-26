import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { ToastProvider } from './context/ToastContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { registerServiceWorker } from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ToastProvider>
          <AuthModalProvider>
            <App />
          </AuthModalProvider>
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

registerServiceWorker();
