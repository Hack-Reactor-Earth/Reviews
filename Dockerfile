FROM node:latest
WORKDIR ~/
COPY package.json ./
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["npm", "run", "start"]