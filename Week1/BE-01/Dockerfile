# Start from an official Node image (the "recipe" for a Node environment)
FROM node:20-alpine

# Set the working folder inside the container
WORKDIR /app

# Copy package files first (so npm install can be cached if code changes but
# dependencies don't - this makes rebuilds faster)
COPY package*.json ./
RUN npm install

# Now copy the rest of the app's code
COPY . .

# Tell Docker which port this app listens on
EXPOSE 3000

# The command that runs when the container starts
CMD ["node", "src/server.js"]
