import '@smart-tv/tailwind-config';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const mountEl = document.querySelector('#root');
if (mountEl) {
	const root = createRoot(mountEl);
	root.render(<App />);
} else {
	// no root element found — nothing to mount
	// keep silent to avoid throwing in legacy browsers where DOM may differ
}
