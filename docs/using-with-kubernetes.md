# Camouflage with Kubernetes

Camouflage can be also be used with the Kubernetes using the \*.yaml files available at [GitHub](https://github.com/testinggospels/camouflage/tree/main/kubernetes){target=\_blank}.

!!! note

    Provided *.yaml files are in no way optimally tuned to be used in production scenarios, and are expected to change in future to have a more robust structure. We welcome all suggestions for improvements. They can however be used in development environments to quickly deploy and scale Camouflage. 

## What is included?

Kubernetes deployments include 3 yaml files:

- **camouflage-depl.yaml** - Defines Camouflage pod, along with an init pod to setup Camouflage. *Change the desired number of replicas and allocated CPU/Memory here*
- **camouflage-pvc.yaml** - Allows Camouflage to persist mocks/protofiles data even if a pod is killed, also helps share same data accross pods. *Change the assigned storage volume and storage class here*
- **camouflage-service.yaml** - Defines a loadbalancer service to access UI and mocks. *Change port mappings here.*

## How it works?
- To deploy and scale, download all three files and store locally or on your dedicated server.
- Navigate to the directory containing the three files and run the command: `kubectl apply -f .`.
- This starts n number of pods as specified in replica, alongwith init pods.
- This sets up Loadbalancer Service.
- Finally this sets up a PVC, which is to be populated by the init pods. If the mounted volume is empty, init pods will run `camouflage init`, so that you don't have to. Any changes/deletion/creation of mocks will be persisted, further init pods created during scaling/deleting/restarting will not change the existing data.

## Port Mapping

You can map ports in `camouflage-svc.yaml` to access available protocols and endpoints. Default ports/mappings are:

- 8080 - For HTTP
- 8443 - For HTTPS
- 8081 - For HTTP2
- 8082 - For Websockets
- 4312 - For gRPC
- 5555 - Exposes a /metrics endpoint for prometheus monitoring

Each of these ports can be mapped to a host port of your choice

## Using Camouflage on K8s
All mocks and endpoints can be access via the loadbalancer service. As well as any changes to mocks, can be made using Camouflage UI available at the root path accessed by using http port. `http://${host}:${httpPort}/`.