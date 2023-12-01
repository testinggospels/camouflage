FROM node:21.2-alpine3.18
WORKDIR /app
RUN npm install -g camouflage-server
RUN camouflage init
CMD ["camouflage", "--config", "config.yml"]