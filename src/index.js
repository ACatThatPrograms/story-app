import React from 'react';
import { render } from 'react-dom';
import App from './App';
// import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap styling if you need it

/* Redux Store */
import { Provider } from 'react-redux';
import store from 'redux/store/index.js'; // Redux store if using

// Render the App!
render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
);
