# Use the official Node.js long-term support image
FROM node:20-alpine

# Install build dependencies (needed for sqlite3 and bcrypt)
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies (using 'npm ci' for reliable builds)
RUN npm ci

# Copy the rest of your application code
COPY . .

# Run your database initialization scripts
RUN npm run db:file && npm run db:init

# Your app runs on port 3000 by default (adjust if app.js uses a different port)
EXPOSE 6754

# Start the application using your custom 'dish' script
CMD ["npm", "run", "dish"]