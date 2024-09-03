FROM nginx:alpine

COPY index.html styles.css script.js /usr/share/nginx/html/
COPY data /usr/share/nginx/html/data

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
