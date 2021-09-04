FROM node:14.16-slim
WORKDIR /app
RUN npm install -g camouflage-server
RUN camouflage init
EXPOSE 8080
EXPOSE 8443
EXPOSE 8081
EXPOSE 8082
EXPOSE 4312
EXPOSE 5555
CMD ["camouflage", "--config", "config.yml"]