import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./app/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./hooks/**/*.{ts,tsx}",
		"./lib/**/*.{ts,tsx}",
		"./services/**/*.{ts,tsx}",
		"./store/**/*.{ts,tsx}",
	],
	theme: {
		screens: {
			xxs: "320px",
			xs: "375px",
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
			"3xl": "1920px",
		},
		extend: {
			colors: {
				border: "var(--color-border)",
				input: "var(--color-input)",
				ring: "var(--color-ring)",
				background: "var(--color-background)",
				foreground: "var(--color-foreground)",
				primary: {
					DEFAULT: "var(--color-primary)",
					foreground: "var(--color-primary-foreground)",
				},
				secondary: {
					DEFAULT: "var(--color-secondary)",
					foreground: "var(--color-secondary-foreground)",
				},
				muted: {
					DEFAULT: "var(--color-muted)",
					foreground: "var(--color-muted-foreground)",
				},
				accent: {
					DEFAULT: "var(--color-accent)",
					foreground: "var(--color-accent-foreground)",
				},
				destructive: {
					DEFAULT: "var(--color-destructive)",
					foreground: "var(--color-destructive-foreground)",
				},
				card: {
					DEFAULT: "var(--color-card)",
					foreground: "var(--color-card-foreground)",
				},
				popover: {
					DEFAULT: "var(--color-popover)",
					foreground: "var(--color-popover-foreground)",
				},
			},
			borderRadius: {
				sm: "var(--radius-sm)",
				md: "var(--radius-md)",
				lg: "var(--radius-lg)",
				xl: "var(--radius-xl)",
				"2xl": "var(--radius-2xl)",
			},
			boxShadow: {
				sm: "var(--shadow-sm)",
				md: "var(--shadow-md)",
				lg: "var(--shadow-lg)",
			},
			fontFamily: {
				sans: [
					"var(--font-sans)",
					"ui-sans-serif",
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"sans-serif",
				],
				display: [
					"var(--font-display)",
					"var(--font-sans)",
					"ui-sans-serif",
					"system-ui",
					"sans-serif",
				],
				mono: [
					"ui-monospace",
					"SFMono-Regular",
					"Consolas",
					"Liberation Mono",
					"monospace",
				],
			},
		},
	},
};

export default config;
