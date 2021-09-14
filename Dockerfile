FROM node:14.16-slim
WORKDIR /app
RUN npm install -g camouflage-server
RUN camouflage init
CMD ["camouflage", "--config", "config.yml"]