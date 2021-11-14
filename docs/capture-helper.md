# Capture Helper

<sup>This section aims to explain what data can be extracted and used to generate a response using handlebars. It can be used as reference for any available helpers, even though examples primarily focus on `capture` helper.</sup>

Most helpers were originally built for http(s)/http2 protocols. However, as of v0.7.2 release, they can be used with all available protocols, i.e. grpc and websockets, with some obvious exceptions such as `file` and `code` helpers. (`code` helper will eventually be supported for all protocols)

## Using with HTTP(s)/HTTP2

1. As shown in example on Handlebars page, you can use `capture` to extract information from specific parts of the incoming requests by specifying a `from` argument. Accepted values are `query`, `headers`, `path` and `body`.
2. Using `query` and `headers` you can specify the argument `key`, to capture it's corresponding value.
3. Using `path` you can specify the argument `regex`, to define a regular expression which captures your desired value.
4. Using `body` would require you to specify two arguments, i.e. `using` and `selector`, where `using` can have values `jsonpath` or `regex`, while selector would be the respective jsonpath or regular expression.

Please refer to the examples on the Handlebars page.

# Using with Websockets

The available/required keywords, while using `capture` helper with websockets are, `using` and `selector`. You have access to the request payload, upon which you can execute a regex or jsonpath extractor to fetch desired values.

Example `{{capture using='jsonpath' selector='$.lastName'}}`

# Using with gRPC

Similar to websockets, while using `capture` helper with gRPC, available/required arguments are `using` and `selector`.

1. For unary calls and server side streams, helpers have access to request payload as is.
2. For client side streaming calls, payloads from each stream are stored in an array, which is then made available to helpers.
3. For bidi side streams, helpers can access the request payload as is during each streaming/ping-pong interaction i.e. while sending the "data" stream. Additionally, each payload is also stored in an array which is then made available to helpers while sending the "end" stream
