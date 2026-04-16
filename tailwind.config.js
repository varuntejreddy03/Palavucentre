/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
    extend: {
      colors: {
        'bg-page': '#0F0C08',
        'bg-section': '#0F0C08',
        'bg-even': 'rgba(26,21,16,0.76)',
        'bg-card': '#1A1510',
        'bg-card-hover': '#221A0F',
        'bg-footer': '#040100',
        'gold': '#F0A500',
        'gold-bright': '#FFD277',
        'gold-dim': '#8A7A60',
        'gold-dark': '#C8860A',
        'maroon': '#3D0A0A',
        'text-primary': '#F5EDD6',
        'text-secondary': '#8A7A60',
        'text-dim': '#5A4E3A',
        'text-subtle': '#5A4E3A',
        'red-urgent': '#B33A3A',
        'veg': '#3D9970',
        'nonveg': '#C0392B',
        'whatsapp': '#25D366',
      },
    },
  },
}
