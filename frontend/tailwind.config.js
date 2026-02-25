/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        arcade: ['Orbitron', 'sans-serif'],
        mono: ['Share Tech Mono', 'JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: 'oklch(var(--border) / <alpha-value>)',
        input: 'oklch(var(--input) / <alpha-value>)',
        ring: 'oklch(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        'neon-cyan': 'var(--primary)',
        'neon-magenta': 'var(--neon-magenta)',
        'neon-green': 'var(--accent)',
        'neon-yellow': 'var(--neon-yellow)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        none: '0px',
        sharp: '2px',
      },
      boxShadow: {
        'glow-cyan': '0 0 12px oklch(0.78 0.22 195 / 0.5), 0 0 24px oklch(0.78 0.22 195 / 0.25)',
        'glow-magenta': '0 0 12px oklch(0.72 0.28 320 / 0.5), 0 0 24px oklch(0.72 0.28 320 / 0.25)',
        'glow-green': '0 0 12px oklch(0.75 0.22 145 / 0.5), 0 0 24px oklch(0.75 0.22 145 / 0.25)',
        'glow-sm': '0 0 8px oklch(0.78 0.22 195 / 0.4)',
        'glow': '0 0 20px oklch(0.78 0.22 195 / 0.4), 0 0 40px oklch(0.78 0.22 195 / 0.2)',
        'glow-lg': '0 0 40px oklch(0.78 0.22 195 / 0.5), 0 0 80px oklch(0.78 0.22 195 / 0.25)',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px oklch(0.78 0.22 195 / 0.3)' },
          '50%': { boxShadow: '0 0 30px oklch(0.78 0.22 195 / 0.7), 0 0 60px oklch(0.78 0.22 195 / 0.3)' },
        },
        'scan': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(100vh)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ],
};
