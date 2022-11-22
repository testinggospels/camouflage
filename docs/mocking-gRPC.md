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
## Enabling TLS for gRPC

gRPC service mock runs without TLS by default. TLS can be enabled by setting the `grpc_tls` configuration value to `true`. The server cert and key files will then be read from `cert` and `key` values in `ssl` configuration. You may also add `root_cert` path configuration value to `ssl` configuration to enable client authentication. If no `root_cert` value is defined client authentication is disabled.

## Creating a gRPC Mock - Unary Or Client Side Streaming

- To create a new grpc mock, you would need the .proto file for your gRPC service. ex. `todo.proto`
- Create two new directories `./grpc/mocks` and `./grpc/protos` (you can name them as you wish)
- Place your .proto file in `./grpc/protos` directory.
- Now, all we need is a .mock file. But, creating folder structure for gRPC follows a slightly different approach compared to HTTP mocks, and could be a little complicated if you are not aware of Protofile syntax.
- In any case, you would need the following steps.

      - Start by looking for a package name in your .proto file. Next you'd need the service name, and finally the method you need to mock.
      - Create a new folder in ./grpc/mocks directory with the package name. e.g. `./grpc/mocks/todoPackage`
      - Create another folder in ./grpc/mocks/todoPackage directory with the service name. e.g. `./grpc/mocks/todoPackage/TodoService`
      - Finally create a .mock file in the directory ./grpc/mocks/todoPackage/TodoService with the method name. e.g `./grpc/mocks/todoPackage/TodoService/createTodo.mock`
      - Place your expected response in the mock file and you are done.
      - You can use the handlebars as usual in your response, though some of handlebars were built specifically for http based protocols and might not work as expected. For example, you can not use `code` helper for gRPC. To extract some value from the gRPC request body, you can still use `capture` helper like you would extract information from http request body, but you don't need to specify `from='body'` key/value. You can always load your own handlebars to Camouflage (Check External Helpers section).

```json
{
  "id": "{{randomValue type='UUID'}}",
  "text": "{{randomValue type='ALPHABETIC' length='100'}}"
}
```

!!!note

    If your protofile is importing any other local protofile, Camouflage registers the services/methods in the imported protofile as part of the primary protofile. In this case you'd need to specify the absolute or relative path of the imported protofile in a .protoignore file placed at the root of your Camouflage project.
    For example, you have a protofile A. i.e. `./grpc/protos/protofileA.proto`, which imports protofile B, i.e. `./grpc/protos/subdir/protofileB.proto`. All necessary parsing and registrations will be done as part of loading protofile A, Camouflage does not need to load protofile B separately. However, this instruction needs to be passed to Camouflage by placing the path `./grpc/protos/subdir/protofileB.proto` in a `.protoignore` placed at the root of your Camouflage project. If appropriate protoignore does not exist, Camouflage will show a warning in your logs as `Not re-registering some_method. Already registered.`

## Creating a gRPC Mock - Server Side Streaming

In case you are creating a service with server side streaming, you can place a separator between each chunk of responses in following manner:

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

    The separator Camouflage understands is '====', i.e. 4 equals.

## Creating a gRPC Mock - Bidi Streaming

If you are creating a bidirectional streaming mock, your mock file would contain two different types of data.

- One, what to send when the client is streaming, defined by the key "data".
- Two, an optional key "end", in case you want the server to send something when the client ends the connection. If your requirement is to simply end the stream when client ends the stream, without sending any additional data, you can simply omit the "end" key from your mockfile.

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

    Since BIDI streaming is slightly more complicated to simulate, current implementation of Camouflage only supports the ping-pong model of streaming, i.e. client can send multiple requests as a stream and server will respond to each request with one response as part of a stream. Finally when the client ends the stream, the server will also end the stream. As shown in the example above, the server can also send a response just before ending the stream, but this is optional.

## Adding delays in gRPC

You can also add delays in your grpc mock services, by adding a delay key with the value in your mock file.

```json
{
  "id": "{{randomValue type='UUID'}}",
  "text": "{{randomValue type='ALPHABETIC' length='100'}}",
  "delay": {{num_between lower=500 upper=600}}
}
```

You don't need to modify your proto file to accommodate the additional key, since Camouflage will delete the "delay" key from the response before sending it to the client.

## Sending GRPC Error responses

Camouflage provides an experimental support to send error responses starting v0.11.0 onwards, for unary and client side streaming calls. To send an error response, append a json error object with `code` and optional `message` to your mock content.

```json
{
  "error": {
    "code": 16,
    "message": "User is unauthenticted."
  }
}
```

## Sending GRPC response metadata

Camouflage provides an experimental support to send metadata/trailers with responses starting v0.11.0 onwards, for unary and client side streaming calls. To send metadata, append a json metadata object with relevant keys and values to your mock content.

```json
{
  "metadata": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

!!!caution

    Since the Camouflage gRPC server needs to register the new services, everytime you add a new protofile, you'd need to restart the Camouflage server. Good news is, you can do so easily by making a get request to /restart endpoint. Though the downtime is minimal (less than a second, we do not recommend restarting the server during a performance test. Note that restart is required only if you add a new protofile. If you have added a new mock file or updated an existing one, a restart is not required.

## Overriding proto-loader's default options

Camouflage uses default options as specified by `@grpc/proto-loader`. You can however override the default values by creating a `plconfig.js` file at the root of your Camouflage project. The contents of the file should export a variable `plconfig` as follows:

```javascript
module.exports.plconfig = {
    keepCase: true,
    longs: String,
    enums: String,
    bytes: Array
}
```

Available options are as follows:

| Field name | Valid values | Description
|------------|--------------|------------
| `keepCase` | `true` or `false` | Preserve field names. The default is to change them to camel case.
| `longs` | `String` or `Number` | The type to use to represent `long` values. Defaults to a `Long` object type.
| `enums` | `String` | The type to use to represent `enum` values. Defaults to the numeric value.
| `bytes` | `Array` or `String` | The type to use to represent `bytes` values. Defaults to `Buffer`.
| `defaults` | `true` or `false` | Set default values on output objects. Defaults to `false`.
| `arrays` | `true` or `false` | Set empty arrays for missing array values even if `defaults` is `false` Defaults to `false`.
| `objects` | `true` or `false` | Set empty objects for missing object values even if `defaults` is `false` Defaults to `false`.
| `oneofs` | `true` or `false` | Set virtual oneof properties to the present field's name. Defaults to `false`.
| `json` | `true` or `false` | Represent `Infinity` and `NaN` as strings in `float` fields, and automatically decode `google.protobuf.Any` values. Defaults to `false`
| `includeDirs` | An array of strings | A list of search paths for imported `.proto` files.
| `includeProtos` | An array of strings | A list of proto files to be loaded. If specified, Camouflage will only load the specified proto files and ignore other protofiles in `config.protocols.grpc.protos_dir`.

!!!note

    Camouflage extends the configurations provided by Protoloader Options([@grpc/proto-loader](https://www.npmjs.com/package/@grpc/proto-loader){target=\_blank}).