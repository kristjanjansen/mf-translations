# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build static translations into /app/public
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/public/ /usr/share/nginx/html/

EXPOSE 4000

CMD ["nginx", "-g", "daemon off;"]
