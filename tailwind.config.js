/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: { sans: ['Inter', '-apple-system', 'sans-serif'] },
            colors: {
                primary: '#15803d',
                accent: '#a3e635',
                loss: '#60a5fa',
                surface: '#ffffff',
                bg: '#f8fafc',
                dark: '#1e293b',
            },
            boxShadow: {
                'soft': '0 20px 40px -15px rgba(0, 0, 0, 0.05)',
                'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
            }
        },
    },
    plugins: [],
}
