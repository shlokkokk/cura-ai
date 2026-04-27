FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY server.js ./
COPY app.js ./
COPY index.html ./
COPY styles.css ./
COPY favicon.svg ./
COPY hero-patient.png ./
COPY src ./src
COPY supabase ./supabase
COPY README.md ./

EXPOSE 3000

CMD ["node", "server.js"]
