# Specify Node Version and Image
# Name Image development
FROM node:18 AS development

# Set working directory inside container
WORKDIR /chicken_dev/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy all files from current directory to the container
COPY . .

RUN npm run build

EXPOSE 3000


################
## PRODUCTION ##
################
# Build another image named production
FROM node:18 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set working directory inside container
WORKDIR /chicken_prod/src/app

COPY --from=development /chicken_dev/src/app/ .

EXPOSE 8080

# run the app
CMD ["node", "dist/main"]
