FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port (adjust if your app uses a different port)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
