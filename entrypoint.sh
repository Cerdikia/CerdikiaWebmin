#!/bin/sh

# Generate env.js berdasarkan variabel environment
cat <<EOF > /usr/share/nginx/html/env.js
window.env = {
  VITE_API_URL: "${VITE_API_URL}"
};
EOF

# Jalankan nginx
nginx -g "daemon off;"
