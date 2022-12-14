# syntax=docker/dockerfile:1
FROM node:18-alpine
WORKDIR /geo-backend
COPY . .
RUN npm install
CMD ["npm","run","start"]
EXPOSE 8000