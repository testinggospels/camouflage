# Mocking gRPC

Camouflage introduces mocking gRPC services. Creation of mocks remains similar to HTTP mocks with some minor changes.

For starters, gRPC mocks should not be placed in the same mocks directory as HTTP mocks, instead they should have their own mocks and protos directories. Secondly, the folder structure inside grpc mocks directory will follow the convention ./grpc/mocks/**_package_name_/_service_name_/_method_name_.mock**

!!!note

    We currently support unary services and server side streams. Client streams and BIDI streams will be introduced soon.

## Creating in a gRPC Mock

- To create a new grpc mock, you would need the .proto file for your gRPC service. ex. `todo.proto`
- Create two new directories `./grpc/mocks` and `./grpc/protos` (you can name them as you wish)
- Place your .proto file in `./grpc/protos` directory.
- Now, all we need is a .mock file. But, creating folder structure for gRPC follows a slightly different approach compared to HTTP mocks, and could be little complicated if you are not aware of Protofile syntanx.
- In any case, you would need following steps.

      - Start by looking for a package name in your .proto file. Next you'd need the service name, and finally the method you need to mock.
      - Create a new folder in ./grpc/mocks directory with the package name. e.g. `./grpc/mocks/todoPackage`
      - Create another folder in ./grpc/mocks/todoPackage directory with the service name. e.g. `./grpc/mocks/todoPackage/TodoService`
      - Finally create a .mock file in the directory ./grpc/mocks/todoPackage/TodoService with the method name. e.g `./grpc/mocks/todoPackage/TodoService/createTodo.mock`
      - Place your expected response in the mock file and you are done. You can use the handlebars as usual in your response!!

```json
{
  "id": "{{randomValue type='UUID'}}",
  "text": "{{randomValue type='ALPHABETIC' length='100'}}"
}
```

In case you are creating a service with server side streaming, you can place a seperator between each chunk of responses in following manner:

```json
{
  "id": "{{randomValue type='UUID'}}",
  "text": "{{randomValue type='ALPHABETIC' length='100'}}"
}
====
{
  "id": "{{randomValue type='UUID'}}",
  "text": "{{randomValue type='ALPHABETIC' length='100'}}"
}
====
{
  "id": "{{randomValue type='UUID'}}",
  "text": "{{randomValue type='ALPHABETIC' length='100'}}"
}
```

You can also add delays in your grpc services, unary or server side stream, by adding a delay key with the value in your mock file.

```json
{
  "id": "{{randomValue type='UUID'}}",
  "text": "{{randomValue type='ALPHABETIC' length='100'}}",
  "delay": {{num_between lower=500 upper=600}}
}
```

!!!note

    The seperator Camouflage understands is '====', i.e. 4 equals.

!!!caution

    Since Camouflage gRPC server needs to register the new services everytime you create new mock, you'd need to restart the Camouflage server. Good news is, you can do so easily by making a get request to /restart endpoint. Though the downtime is minimal (less than a second, we do not recommend restarting the server during a performance test.
