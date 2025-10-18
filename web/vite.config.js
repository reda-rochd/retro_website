import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': '/src',
		},
	},
	server: {
		// open: true,
		proxy: {
			'/api': {
				// target: 'http://localhost:3001',
				target: 'https://www.1337play.com',
				changeOrigin: true,
			}
		}
	}
})
