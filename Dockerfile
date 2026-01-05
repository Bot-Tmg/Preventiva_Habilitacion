# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose default port
ENV NODE_ENV=production
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
