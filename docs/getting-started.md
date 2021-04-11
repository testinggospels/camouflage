# Getting Started

1. Start by cloning the Camouflage repository:

```shell
git clone https://github.com/fauxauldrich/camouflage.git
```

2. Edit config.yml to update the mocks directory
3. Run `npm run start`

## Create your first mock

Camouflage follows the same convention as mockserver, to create mocks. For example,

1. You start by creating a directory ${MOCKS_DIR}/hello-world
2. Create a file GET.mock under ${MOCKS_DIR}/hello-world.
3. Paste following content:

```
HTTP/1.1 200 OK
X-Custom-Header: Custom-Value
Content-Type: application/json

{
    "greeting": "Hey! It works"
}
```

Navigate to [http://localhost:8080/hello-world](http://localhost:8080/hello-world){target=\_blank}
