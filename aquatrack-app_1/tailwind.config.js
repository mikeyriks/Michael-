/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // ─── BRAND PALETTE ─── exact same values as the brochure ──────────────
      colors: {
        ink: {
          DEFAULT: '#0A1628',  // deep midnight navy — primary
          soft: '#142850',
          2: '#1E3A5F',
        },
        surface: {
          DEFAULT: '#F8F6F1',  // warm bone — primary background
          2: '#EFEAE0',
        },
        cyan: {
          DEFAULT: '#06B6D4',  // pool aqua — primary accent
          deep: '#0891B2',
          pale: '#CFFAFE',
        },
        sun: {
          DEFAULT: '#F59E0B',  // gold — premium accent
          deep: '#B45309',
        },
        coral: '#EF4444',
        mid: {
          DEFAULT: '#475569',
          soft: '#94A3B8',
        },
      },
      // ─── TYPOGRAPHY ─── Lora serif display + Poppins sans body ────────────
      fontFamily: {
        serif: ['"Lora"', 'Georgia', 'serif'],
        sans: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      // Custom keyframes for live-result animations
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        // Direction-aware step transitions for the onboarding flow
        'slide-fwd': {
          '0%': { opacity: 0, transform: 'translateX(36px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        'slide-back': {
          '0%': { opacity: 0, transform: 'translateX(-36px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        // Celebratory pop for the "Done" checkmark
        'pop-in': {
          '0%': { opacity: 0, transform: 'scale(0.4)' },
          '60%': { opacity: 1, transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        // Expanding rings behind the checkmark
        'ripple-out': {
          '0%': { opacity: 0.5, transform: 'scale(0.55)' },
          '100%': { opacity: 0, transform: 'scale(2.2)' },
        },
        // Error feedback on the OTP inputs
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-6px)' },
          '80%': { transform: 'translateX(6px)' },
        },
        // Bottom-sheet overlay
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'backdrop-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        'pulse-live': 'pulse-live 1.4s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-fwd': 'slide-fwd 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-back': 'slide-back 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'ripple-out': 'ripple-out 1.3s ease-out',
        shake: 'shake 0.4s ease-in-out',
        'sheet-up': 'sheet-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        'backdrop-in': 'backdrop-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
