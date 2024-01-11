# Use the official Ubuntu 20.04 LTS as the base image
FROM ubuntu:20.04

# Install required dependencies
RUN apt-get update && \
    apt-get install -y curl gnupg

# Install Node.js 20
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

# Install MongoDB
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 4B7C549A058F8B6B
RUN echo "deb http://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list
RUN apt-get update && \
    apt-get install -y mongodb-org

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that your Node.js app will run on
EXPOSE 8080

# Start the Node.js application
CMD ["npm", "start"]
