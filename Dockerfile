FROM node:20-alpine

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci -verbose
COPY . .

CMD ["npm","run","start"]