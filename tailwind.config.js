/** @type {import('tailwindcss').Config} */
function v(name) {
  return `rgb(var(${name}) / <alpha-value>)`;
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Backgrounds
        'bg-page':      v('--color-bg-page'),
        'bg-surface':   v('--color-bg-surface'),
        'bg-elevated':  v('--color-bg-elevated'),
        'bg-subtle':    v('--color-bg-subtle'),

        // Brand
        'brand':        v('--color-brand-primary'),
        'brand-hover':  v('--color-brand-hover'),
        'brand-muted':  v('--color-brand-muted'),
        'brand-dark':   v('--color-brand-dark'),
        'brand-subtle': v('--color-brand-subtle'),

        // Text
        'text-primary':   v('--color-text-primary'),
        'text-secondary': v('--color-text-secondary'),
        'text-muted':     v('--color-text-muted'),
        'text-link':      v('--color-text-link'),

        // Borders
        'border-default': v('--color-border-default'),
        'border-subtle':  v('--color-border-subtle'),
        'border-active':  v('--color-border-active'),

        // Status
        'status-clean':    v('--color-status-clean'),
        'status-rebuilt':  v('--color-status-rebuilt'),
        'status-salvage':  v('--color-status-salvage'),
        'status-live':     v('--color-status-live'),
        'status-ended':    v('--color-status-ended'),
        'status-upcoming': v('--color-status-upcoming'),

        // Condition
        'condition-excellent': v('--color-condition-excellent'),
        'condition-good':      v('--color-condition-good'),
        'condition-fair':      v('--color-condition-fair'),
        'condition-poor':      v('--color-condition-poor'),
      },
    },
  },
  plugins: [],
}
