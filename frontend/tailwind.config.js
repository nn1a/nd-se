/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: {
        DEFAULT: {
          css: {
            'table': {
              'border-collapse': 'collapse',
              'width': '100%',
              'margin': '1em 0',
              'border': '1px solid rgb(209 213 219)',
              'border-radius': '0.5rem',
              'overflow': 'hidden',
            },
            'table th': {
              'background-color': 'rgb(249 250 251)',
              'font-weight': '600',
              'color': 'rgb(55 65 81)',
              'border': '1px solid rgb(209 213 219)',
              'padding': '0.5rem 1rem',
              'text-align': 'left',
            },
            'table td': {
              'border': '1px solid rgb(209 213 219)',
              'padding': '0.5rem 1rem',
              'text-align': 'left',
            },
            'table tr:nth-child(even)': {
              'background-color': 'rgb(249 250 251)',
            },
            'table tr:hover': {
              'background-color': 'rgb(243 244 246)',
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), 
    require("tailwindcss-animate")
  ],
}
