FROM node:20-alpine
WORKDIR /app

# Copy package files and install ALL dependencies (including devDependencies needed for build)
COPY package*.json ./
RUN npm install

# Copy source code and build the TypeScript code
COPY . .
RUN npm run build

# Prune devDependencies to keep the image small
RUN npm prune --production
ENV NODE_ENV=production

EXPOSE 3000

# Point to your compiled JavaScript entry point (adjust if your outDir isn't dist)
CMD ["node", "dist/index.js"]