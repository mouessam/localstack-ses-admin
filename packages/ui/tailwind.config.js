/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: 'var(--bg-app)',
        panel: 'var(--bg-panel)',
        card: 'var(--bg-card)',
        input: 'var(--bg-input)',
        subtle: 'var(--bg-subtle)',
        hover: 'var(--bg-hover)',
        active: 'var(--bg-active)',
        border: {
          subtle: 'var(--border-subtle)',
          default: 'var(--border-default)',
          focus: 'var(--border-focus)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
        },
        primary: {
          DEFAULT: 'var(--accent-primary)',
          hover: 'var(--accent-hover)',
          subtle: 'var(--accent-subtle)',
        },
        danger: {
          DEFAULT: 'var(--danger-primary)',
          hover: 'var(--danger-hover)',
          subtle: 'var(--danger-subtle)',
          text: 'var(--danger-text)',
        },
        success: {
          DEFAULT: 'var(--success-primary)',
          hover: 'var(--success-hover)',
          subtle: 'var(--success-subtle)',
          text: 'var(--success-text)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
};
