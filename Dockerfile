FROM node:22-alpine as builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock* ./
RUN yarn install --production

# Copy source files
COPY . .

# Build the NestJS app
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start:prod"]