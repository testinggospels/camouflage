# Camouflage with Docker

Camouflage can be used with the docker image available at [Docker Hub](https://hub.docker.com/repository/docker/shubhendumadhukar/camouflage){target=\_blank}.

Camouflage can be run with docker using the command, `docker container run -d --name camouflage -p 8080:8080 shubhendumadhukar/camouflage:${TAG}`, where `${TAG}` used in docker image refers to the version of camouflage-server npm package.

## Port Mapping
You can map additional ports to access other protocols and endpoints, e.g. default ports are

- 8080 - For HTTP
- 8443 - For HTTPS
- 8081 - For HTTP2
- 8082 - For Websockets
- 4312 - For gRPC
- 5555 - Exposes a /metrics endpoint for prometheus monitoring

Each of these ports can be mapped to a host port of your choice

## Mounting Volumes

Since Camouflage provides you a UI, you can create folders, upload a mock file, delete folders in order to change the mocks behavior at runtime without having to rebuild the docker image or copy additional files to the running containers.

You can also achieve the same effect by mounting volumes while starting Camouflage.

- Create an empty directory in your host machine.
- Run `camouflage init` in the directory to generate a starter skeleton of a Camouflage project.
- Carry out necessary modifications, like deleting example files, modifying config, adding certs, etc.
- Start Camouflage using command: 
    - `docker run -d -p 8080:8080 -p 5555:5555 -v $(pwd):/app --name camouflage shubhendumadhukar/camouflage` if you are on mac or linux
    - `docker run -d -p 8080:8080 -p 5555:5555 -v %cd%:/app --name camouflage shubhendumadhukar/camouflage` if you are on Windows

To make any changes to mocks you can modify files on your host. Or you can use Camouflage UI to make necessary changes, and these changes will be persisted on your host.

## Docker Compose

The fastest way to get started using Docker would be to use the `docker-compose.yml` file available in Camouflage Github repo. Download the files `docker-compose.yml`, `camouflage_dashboard.json` and `prometheus.yml` to your local environment. Run the command `docker-compose up -d` to start following entities:

- Camouflage
- Camouflage UI
- Prometheus
- Grafana

Once all containers are up, simply import `camouflage_dashboard.json` as a Grafana dashboard. 

!!! note

    Change Grafana Password (`Password@123`) on first login