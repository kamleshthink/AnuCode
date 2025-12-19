/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'vscode-bg': '#1e1e1e',
        'vscode-sidebar': '#252526',
        'vscode-activitybar': '#333333',
        'vscode-panel': '#1e1e1e',
        'vscode-statusbar': '#007acc',
        'vscode-border': '#3e3e42',
        'vscode-hover': '#2a2d2e',
        'vscode-selection': '#264f78',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
