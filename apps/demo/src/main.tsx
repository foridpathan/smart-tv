import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOMClient from 'react-dom/client';
import App from './App';
// Import shared Tailwind styles from the monorepo package
import '@smart-tv/tailwind-config';

const element = document.querySelector('#root')

const root = ReactDOMClient.createRoot(element!);
root.render(<App />);
