FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install

# Copy application code
COPY . .

# Build the application
RUN yarn build

# Expose port
EXPOSE ${PORT}

# Start the application
CMD ["yarn", "start"]