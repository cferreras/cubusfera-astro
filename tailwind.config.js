/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
  // Brand palette (variables definidas en global.css) - nombres estandarizados con guiones
  'brand-green': 'var(--brand-green)',
  'brand-green-fg': 'var(--brand-green-fg-dark)',
  'brand-bg-1': 'var(--brand-bg-1)',
  'brand-bg-2': 'var(--brand-bg-2)',
  'brand-accent-1': 'var(--brand-accent-1)',
  'brand-border': 'var(--brand-border)',
  'brand-muted': 'var(--brand-muted)',
  // Alias legacy (temporal) para evitar roturas si quedan clases antiguas
  'brand-bg1': 'var(--brand-bg-1)',
  'brand-bg2': 'var(--brand-bg-2)',
  'brand-accent1': 'var(--brand-accent-1)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}