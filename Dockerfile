FROM node:14.16-slim
WORKDIR /app
COPY . /app
CMD ["node", "bin/camouflage", "--config", "config.yml"]

