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
      fontSize: {
        // ── Auction bid display ────────────────────────────────────────────
        'bid-amount':        ['1.125rem', { lineHeight: '1', fontWeight: '700' }],
        'bid-label':         ['0.625rem', { lineHeight: '1', fontWeight: '500', letterSpacing: '0.06em' }],
        'bid-winning':       ['0.9rem',   { lineHeight: '1', fontWeight: '700', letterSpacing: '0.05em' }],
        'bid-dot':           ['1rem',     { lineHeight: '1' }],
        'drawer-bid-amount': ['1.5rem',   { lineHeight: '1', fontWeight: '700' }],
        // ── Card text ─────────────────────────────────────────────────────
        'card-title':  ['0.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        'card-meta':   ['0.75rem',  { lineHeight: '1.4' }],
        'card-label':  ['0.625rem', { lineHeight: '1', letterSpacing: '0.06em' }],
        'card-count':  ['0.75rem',  { lineHeight: '1' }],
      },
      transitionDuration: {
        '250': '250ms',
      },
      colors: {
        'bg-page':      v('--color-bg-page'),
        'bg-surface':   v('--color-bg-surface'),
        'bg-elevated':  v('--color-bg-elevated'),
        'bg-subtle':    v('--color-bg-subtle'),
        'brand':        v('--color-brand-primary'),
        'brand-hover':  v('--color-brand-hover'),
        'brand-muted':  v('--color-brand-muted'),
        'brand-dark':   v('--color-brand-dark'),
        'brand-subtle': v('--color-brand-subtle'),
        'text-primary':   v('--color-text-primary'),
        'text-secondary': v('--color-text-secondary'),
        'text-muted':     v('--color-text-muted'),
        'text-link':      v('--color-text-link'),
        'border-default': v('--color-border-default'),
        'border-subtle':  v('--color-border-subtle'),
        'border-active':  v('--color-border-active'),
        'status-clean':    v('--color-status-clean'),
        'status-rebuilt':  v('--color-status-rebuilt'),
        'status-salvage':  v('--color-status-salvage'),
        'status-live':     v('--color-status-live'),
        'status-ended':    v('--color-status-ended'),
        'status-upcoming': v('--color-status-upcoming'),
        'condition-excellent': v('--color-condition-excellent'),
        'condition-good':      v('--color-condition-good'),
        'condition-fair':      v('--color-condition-fair'),
        'condition-poor':      v('--color-condition-poor'),
      },
    },
  },
  safelist: [
    'transition-[width]', 'transition-[height]', 'w-[440px]',
    'text-bid-amount', 'text-bid-label', 'text-bid-winning', 'text-bid-dot',
    'text-drawer-bid-amount',
    'text-card-title', 'text-card-meta', 'text-card-label', 'text-card-count',
  ],
  plugins: [],
}
