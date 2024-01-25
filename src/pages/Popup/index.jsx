import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

// manifest.jsonに「"default_popup": "popup.html",」を記述していないため、以下のコードは実行されない
// 今後使うかもなので削除はしない
const container = document.getElementById('app-container');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
// root.render(<Popup />);
