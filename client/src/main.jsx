import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/index.js';
import { injectStore } from './services/api.js';
import App from './App.jsx';
import './index.css';

// Wire the Redux store into the Axios interceptors (avoids circular imports)
injectStore(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
