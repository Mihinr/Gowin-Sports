import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//       proxy: {
//           "/api": {
//               target: "https://mihinr.pythonanywhere.com", // Flask backend URL
//               changeOrigin: true,
//               secure: false,
//           },
//       },
//   },
// });


export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:5000", // Node.js backend URL
                changeOrigin: true,
                secure: false,
                ws: true, // Enable WebSocket proxying
            },
            // Proxy sitemap and robots.txt to backend
            "/sitemap.xml": {
                target: "http://localhost:5000",
                changeOrigin: true,
                secure: false,
            },
            "/robots.txt": {
                target: "http://localhost:5000",
                changeOrigin: true,
                secure: false,
            },
            // Proxy static images
            "/static": {
                target: "http://localhost:5000",
                changeOrigin: true,
                secure: false,
            },
        },
    },
  });