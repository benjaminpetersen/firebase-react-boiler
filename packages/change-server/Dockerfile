FROM node:18-alpine
WORKDIR /app
COPY package.json .
# COPY THE LOCK FILE
COPY ./src ./src
COPY tsconfig.json .
RUN yarn install
RUN yarn build
CMD ["yarn", "start:prod"]