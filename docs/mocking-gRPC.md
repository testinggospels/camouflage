# Mocking gRPC

Camouflage introduces mocking gRPC services. Creation of mocks remains similar to HTTP mocks with some minor changes.

For starters, gRPC mocks should not be placed in the same mocks directory as HTTP mocks, instead they should have their own mocks and protos directories. Secondly, the folder structure inside grpc mocks directory will follow the convention:

```
./grpc/mocks/package_name/service_name/method_name.mock
```

If your package name is in the format **com.foo.bar.package**, format your folder structure and mock file in following manner:

```
./grpc/mocks/com/foo/bar/package/service_name/method_name.mock
```

## Creating a gRPC Mock - Unary Or Client Side Streaming

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

!!!note

    If your protofile is importing any other local protofile, Camouflage registers the services/methods in the imported protofile as part of the primary protofile. In this case you'd need to specify the absolute or relative path of the imported protofile in a .protoignore file placed at the root of your Camouflage project.
    For example, you have a protofile A. i.e. `./grpc/protos/protofileA.proto`, which imports protofile B, i.e. `./grpc/protos/subdir/protofileB.proto`. All necessary parsing and registrations will be done as part of loading protofile A, Camouflage does not need to load protofile B seperately. However, this instruction needs to be passed to Camouflage by placing the path `./grpc/protos/subdir/protofileB.proto` in a `.protoignore` placed at the root of your Camouflage project. If appropriate protoignore does not exist, Camouflage will show a warning in your logs as `Not re-registering some_method. Already registered.`

## Creating a gRPC Mock - Server Side Streaming

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

!!!note

    The seperator Camouflage understands is '====', i.e. 4 equals.

## Creating a gRPC Mock - Bidi Streaming

If you are creating a bidirectional streaming mock, your mock file would contain two different types of data.

- One, what to send when client is streaming, defined by the key "data".
- Two, an optional key "end", in case you want server to send something when client ends the connection. If your requirement is to simply end the stream when client ends the stream, without sending any additional data, you can simply omit the "end" key from your mockfile.

```json
{
  "data": {
    "id": "{{randomValue type='UUID'}}",
    "text": "{{randomValue type='ALPHABETIC' length='100'}}"
  },
  "end": {
    "id": "{{randomValue type='UUID'}}",
    "text": "{{randomValue type='ALPHABETIC' length='100'}}"
  }
}
```

!!! caution

    Since BIDI streaming are slightly more complicated to simulate, current implementation of Camouflage only supports ping-pong model of streaming, i.e. client can send multiple requests as a stream and server will respond to each request with one response as part of a stream. Finally when client ends the stream, server will also end the stream. As shown in the example above, server can also send a response just before ending the stream, but this is optional.

## Adding delays in gRPC

You can also add delays in your grpc mock services, by adding a delay key with the value in your mock file.

```json
{
  "id": "{{randomValue type='UUID'}}",
  "text": "{{randomValue type='ALPHABETIC' length='100'}}",
  "delay": {{num_between lower=500 upper=600}}
}
```

You don't need to modify your proto file to accomodate the additional key, since Camouflage will delete the "delay" key from the response before sending it to the client.

!!!caution

    Since Camouflage gRPC server needs to register the new services everytime you create new mock, you'd need to restart the Camouflage server. Good news is, you can do so easily by making a get request to /restart endpoint. Though the downtime is minimal (less than a second, we do not recommend restarting the server during a performance test.
