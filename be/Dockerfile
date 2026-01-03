# Sử dụng Node.js 22 trên Debian Bullseye
FROM node:22-bullseye

ENV TZ=Asia/Ho_Chi_Minh

# Create app directory
WORKDIR /qlda/be

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Start the server using the production build
CMD [ "node", "dist/src/main.js" ]