# Mocking Websockets

Camouflage supports mocking for websockets via native WebSockets API. Note that at this time, custom websockets implementations such as via Socket.io is not supported.

!!!note

    In following instructions ${WS_MOCKS} refers to the location of websockets' mocks directory as specified under config.ws.mocks_dir in config.yml

### How to mock websockets?

- Start by enabling ws protocol in config file, provide the location of your ${WS_MOCKS} directory and optionally update the port.
- The folder structure for ${WS_MOCKS} resembles HTTP mocks, where you create a series of folders under ${WS_MOCKS} e.g. ${WS_MOCKS}/hello/world. This will allow you to connect to the websockets server using the url `ws://localhost:8082/hello/world`
- Under /hello/world, you would need to provide two mock files, `connection.mock` (optional) and `message.mock`.
- Camouflage uses `connection.mock` to send you a custom message when you first connect to the server. This is optional, not providing this file would simply log a warning message in Camouflage console.
- Camouflage uses `message.mock` to respond to all incoming messages. This too can be optional if you don't want server to return any messages, but not providing this file would log an error message in Camouflage console.
- The mock file, as you'd expect, supports handlebars! So you can generate random numbers, put conditional blocks etc.
- The format of mock file would be as follows:

```json
{
  "broadcast": "{{now}}",
  "emit": "{{randomValue type='UUID'}}",
  "self": "{{randomValue}}",
  "delay": "{{num_between lower=500 upper=600}}"
}
```

The JSON can have one or more of these three keys: `broadcast`, `emit` or `self`

- boardcast: Camouflage will broadcast these messages, i.e. The value {{now}} evaluates to in above example, will be sent to all the connected clients, including the client emitting the message.
- emit: Camouflage will emit these messages, i.e. The value {{randomValue type='UUID'}} evaluates to in above example, will be sent to all the connected clients, except the client emitting the message.
- self: Camouflage will only send these messages to the client who made the request, i.e. The value {{randomValue}} evaluates to in above example, will be sent only to the client who made the request.
- Finally, you can also add a delay as shown in the example above.

### Client List

When a client is connected to or disconnected from the server, server sends a clients object as an acknowledgement, this object will contain

- The array of all the clients already in the server;
- A client id of a client either joining or leaving; and
- A status indicating if the client is joining or leaving.

Client Object:

```json
{
  "clients": ["af221761-d55e-4f8d-a5f3-d7418fe8be92", "1a8a73df-4abb-46fd-93dd-19a96e614834"],
  "client": "1a8a73df-4abb-46fd-93dd-19a96e614834",
  "status": "joining"
}
```

!!! note

    The client object is broadcasted, meaning all the connected clients will recieve the clients object any time a client joins or leaves the server.
