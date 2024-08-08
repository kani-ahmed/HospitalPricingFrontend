# Step 1: Build the application
FROM node:18-alpine as build-stage

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code to the container
COPY . .

# Build the application
RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:stable-alpine as production-stage

# Copy the built files from the build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
