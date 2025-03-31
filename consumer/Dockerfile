FROM node:18
WORKDIR /app
COPY package.json ./
RUN npm config set registry https://registry.npmjs.org/
RUN npm cache clean --force
RUN npm install --verbose
COPY . .
CMD ["node", "index.js"]

