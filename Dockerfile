FROM node:23.11.1-alpine3.21
WORKDIR /app
RUN npm install -g camouflage-server
RUN camouflage init
CMD ["camouflage", "--config", "config.yml"]