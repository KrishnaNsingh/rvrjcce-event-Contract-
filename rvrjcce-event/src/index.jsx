import React from './core/react.js';
import { App } from './App.jsx';

console.log('[RVRJCCE] Initializing App mounting...');
const container = document.getElementById('root');
if (container) {
  try {
    React.render(React.createElement(App, null), container);
    console.log('[RVRJCCE] App mounted! Root child nodes:', container.childNodes.length);
    console.log('[RVRJCCE] Root innerHTML length:', container.innerHTML.length);
    const headings = Array.from(container.querySelectorAll('h1, h2, h3')).map(h => h.textContent.trim());
    console.log('[RVRJCCE] Rendered Headings:', JSON.stringify(headings));
  } catch (err) {
    console.error('[RVRJCCE] Error during render:', err);
  }
}
