# Build stage
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Vite app
RUN npm run build

# Expose HTTP port 4000
EXPOSE 4000

# Run npm run preview in the foreground
CMD ["npm", "run", "preview", "--", "--port", "4000", "--host", "0.0.0.0"]
