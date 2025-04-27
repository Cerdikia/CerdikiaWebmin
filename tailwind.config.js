/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Untuk Tailwind membaca file HTML utama
    "./src/**/*.{js,ts,jsx,tsx}", // Untuk Tailwind membaca semua file React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
