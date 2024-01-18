FROM node:18-alpine
WORKDIR /app
COPY package.json .
# COPY THE LOCK FILE
COPY ./src ./src
COPY tsconfig.json .
COPY web-client-build ./web-client-build
RUN yarn install
RUN yarn build
EXPOSE 8080
CMD ["yarn", "start:prod"]