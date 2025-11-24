# Stage 1: Build app
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --force

COPY . .
RUN npm run build


# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

# Copy dist output instead of build
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]