import palette from "@yaredfall/tailwind-palette";

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {},
    },
    plugins: [palette],
};
