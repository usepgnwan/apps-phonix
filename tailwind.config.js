import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                "body-lg": ["Montserrat"],
                "label-md": ["Montserrat"],
                "body-sm": ["Montserrat"],
                "headline-md": ["Playfair Display"],
                "headline-lg-mobile": ["Playfair Display"],
                "headline-lg": ["Playfair Display"],
                "label-sm": ["Montserrat"],
                "body-md": ["Montserrat"],
                "headline-xl": ["Playfair Display"]
            },
            colors: {
                "primary-container": "#1e4d3a",
                "surface": "#fbf9f8",
                "on-error": "#ffffff",
                "on-tertiary-fixed-variant": "#6f3800",
                "tertiary-fixed": "#ffdcc4",
                "surface-bright": "#fbf9f8",
                "inverse-surface": "#303030",
                "on-secondary-fixed-variant": "#175037",
                "secondary": "#32694e",
                "surface-tint": "#396753",
                "surface-container-high": "#eae8e7",
                "on-primary-fixed": "#002115",
                "on-tertiary": "#ffffff",
                "on-secondary": "#ffffff",
                "surface-container-highest": "#e4e2e1",
                "surface-variant": "#e4e2e1",
                "on-background": "#1b1c1c",
                "primary-fixed": "#bbeed3",
                "tertiary": "#4b2400",
                "inverse-primary": "#a0d1b8",
                "on-primary-fixed-variant": "#204f3c",
                "tertiary-container": "#6c3700",
                "on-surface": "#1b1c1c",
                "primary": "#013625",
                "surface-dim": "#dcd9d9",
                "on-surface-variant": "#414944",
                "tertiary-fixed-dim": "#ffb77f",
                "surface-container-low": "#f6f3f2",
                "secondary-fixed": "#b5f0cd",
                "on-tertiary-fixed": "#2f1500",
                "outline-variant": "#c0c9c2",
                "inverse-on-surface": "#f3f0f0",
                "on-primary-container": "#8cbda4",
                "background": "#fbf9f8",
                "surface-container": "#f0eded",
                "on-secondary-container": "#386f53",
                "outline": "#717973",
                "secondary-container": "#b5f0cd",
                "secondary-fixed-dim": "#99d3b2",
                "primary-fixed-dim": "#a0d1b8",
                "surface-container-lowest": "#ffffff",
                "on-error-container": "#93000a",
                "on-tertiary-container": "#ff9a41",
                "error-container": "#ffdad6",
                "on-secondary-fixed": "#002113",
                "on-primary": "#ffffff",
                "error": "#ba1a1a"
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            spacing: {
                "margin-desktop": "40px",
                "container-max": "1200px",
                "gutter": "24px",
                "unit": "8px",
                "margin-mobile": "16px"
            },
            fontSize: {
                "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                "label-md": ["14px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600"}],
                "body-sm": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}],
                "headline-md": ["24px", {"lineHeight": "1.4", "fontWeight": "600"}],
                "headline-lg-mobile": ["28px", {"lineHeight": "1.3", "fontWeight": "600"}],
                "headline-lg": ["32px", {"lineHeight": "1.3", "fontWeight": "600"}],
                "label-sm": ["12px", {"lineHeight": "1", "fontWeight": "600"}],
                "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
                "headline-xl": ["48px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}]
            }
        },
    },

    plugins: [forms],
};
