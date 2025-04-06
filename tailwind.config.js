/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        customblack: 'var(--black)',
        customwhite: 'var(--white)',
        fourthcolor: 'var(--fourthcolor)',
        customgray: 'var(--gray)',
      },
      boxShadow: {
        custom: 'var(--box-shadow)',
      },
      fontFamily: {
        custom: ['"Times New Roman"', 'serif'],
        anton: ['Anton', 'sans-serif'],
        spartan: ['League Spartan', 'sans-serif'],
      },
      before: ['hover', 'focus'],
      after: ['hover', 'focus'],
    },
  },
  plugins: [],
}

