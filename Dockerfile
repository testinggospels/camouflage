FROM node:21.6.0-alpine3.19
WORKDIR /app
RUN npm install -g camouflage-server
RUN camouflage init
CMD ["camouflage", "--config", "config.yml"]