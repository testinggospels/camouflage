# Handlebars

Handlebars help you add character to your response. Instead of sending a static response or writing some code to generate a dynamic response, you can now simply use handlebars and let Camouflage do the work for you.

!!! note

    Though Camouflage does not provide any tools to help you create your mocks, there are numerous Handlerbar snippet extensions available in VS Code marketplace which should help speed up your mocks creation process.

## Custom Helpers

## randomValue

Type: Custom Helper

Usage:

1. **{{randomValue}}** - Simply using randomValue will generate a 16 character alphanumeric string. ex: _9ZeBvHW5viiYuWRa_.
2. **{{randomValue type='ALPHANUMERIC'}}** - You can specify a type as well. Your choices are: 'ALPHANUMERIC', 'ALPHABETIC', 'NUMERIC' and 'UUID'.
3. **{{randomValue type='NUMERIC' length=10}}** - Don't want a 16 character output? Use length to specify the length.
4. **{{randomValue type='ALPHABETIC' uppercase=true}}** - Finally, specify uppercase as true to get a, well, uppercase string.

## now

Type: Custom Helper

Usage:

1. **{{now}}** - Simply using now will give you date in format _YYYY-MM-DD hh:mm:ss_
2. **{{now format='MM/DD/YYYY'}}** - Format not to your liking? Use any format you'd like as long as it is supported by momentjs.
3. **{{now format='epoch'}}** - Time since epoch in milliseconds
4. **{{now format='unix'}}** - Time since epoch in seconds
5. **{{now format='MM/DD/YYYY hh:mm:ss' offset='-10 days'}}** - Use offset to specify the delta for your desired date from the current date.

Units for specifying offset are

| Key          | Shorthand |
| :----------- | :-------: |
| years        |     y     |
| quarters     |     q     |
| months       |     M     |
| weeks        |     w     |
| days         |     d     |
| hours        |     h     |
| minutes      |     m     |
| seconds      |     s     |
| milliseconds |    ms     |

## capture

Type: Custom Helper

Usage:

1. **{{capture from='query' key='firstName'}}** - Pretty self-explanatory, but if your endpoint looks like /hello-world?firstName=John&lastName=Wick. And your response is {"message": "Hello Wick, John"}, you can make the response dynamic by formatting your response as

```
{
    "message": "Hello {{capture from='query' key='lastName'}}, {{capture from='query' key='firstName'}}"
}
```

2. **{{capture from='path' regex='\/users\/get\/(.*)?'}}** - For path, you'd need to specify a regex to capture a value.
3. **{{capture from='body' using='jsonpath' selector='$.lastName'}}** - To capture values from the request body, your options are either using='regex' or using='jsonpath'. Selector will change accordingly.

!!!note

    `capture` helper can be used for all the supported protocols, i.e. http/https/http2, grpc and websockets. However, it's behavior, and the data it can access, varies across protocols. Read more on Capture Helper page.

## num_between

Type: Custom Helper

Usage:

1. **{{num_between lower=500 upper=600}}**: Generate a number between two values.

Tip: you can add this value in your response header with a key `Response-Delay`, to simulate a latency in your API. Not providing lower/upper value or providing values where lower > upper would set delay to 0, i.e. won't have any effect. Check **Response Delays** page for a detailed example

## array

Type: Custom Helper

Usage:

1. **{{array source='Apple,Banana,Mango,Kiwi' delimiter=','}}**: Generate an array from a source using given delimiter.

## file

Type: Custom Helper

Usage:

**{{file path='/location/of/the/image/or/text/or/any/file'}}**: If you want to serve a file as a response, maybe an image, or text file, a pdf document, or any type of supported files, use file helper to do so. An example is shown below:

```
HTTP/1.1 200 OK
Content-Type: application/pdf

{{file path="./docs/camouflage.png"}}
```

## code

Type: Custom Helper

Usage: Camouflage's implementation of Handlebars is robust enough to handle most dynamic responses i.e. capturing data from request, generating random numbers, as shown in examples above. However, if your requirement still cannot be fulfilled by Camouflage's helpers, you can write a custom code in javascript to achieve the same results. Refer to the example mock and explanation below:

```
HTTP/1.1 200 OK
Content-Type: application/json

{{#code}}
(()=>{
    function getRandomNumberInRange(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }
    const name = request.query.name;
    const phone = getRandomNumberInRange(1000000000, 9999999999)
    logger.info(phone);
    return {
        status: 201,
        headers: {
            'X-Requested-By': name
        },
        body: `{
            "greeting": "Hello ${name}",
            "phone": ${phone}
        }`
    };
})();
{{/code}}
```

- `HTTP/1.1 200 OK`: We start by creating a GET.mock as usual (or any ${VERB}.mock as per your requirement), where the 1st line of your file denotes protocol, version, status code and status message. This can be overridden from the code, however it is mandatory, in order to maintain a generic structure of mock files.
- Next you will provide a set of static headers, which will not change irrespective of your code logic. If you expect the header value to be dynamic, you don't need to provide them here.
- An empty line to mark the start of the body.
- Lastly, the most important part of your mock file. In place of the body, you write your code inside the code helper block provided by Camouflage. There are some restrictions though, read further.
- Code helper block can be defined by using `{{#code}}...{{/code}}`.
- The code you write has to be encapsulated in an IIFE, i.e. Immediately Invoked Function Expression, which can be done by wrapping your code in `(() => { //your code here })();`
- As you might have noticed, we have defined the IIFE as an arrow function, this too is mandatory, since this provides you access to `request` and `logger` objects without having to bind `this` to the code's context. If that sounds complicated, all you need to understand is that using an arrow function provides you access to `request` and `logger` objects.
- Rest is just vanilla javascript code.
    * Define a function to generate random numbers,
    * Fetch the name from a request query parameter: `name`.
    * Execute the random number function and store the return value in a phone variable.
    * Log the generated phone number.
    * Now comes the most important part. Your IIFE should return a JSON object, containing 3 keys
        - `status`: An integer value (Optional)
        - `headers`: A JSON object with keys as header name and values as header values. (Optional if you don't have any dynamic headers)
        - `body`: A string (Required.)
    * In this example, we have provided a static status code of 200.
    * We have one header `X-Requested-By`, whose value is dynamic and changes based on the value user provided in the name query parameter while calling the mock endpoint.
    * Finally, we have a stringified JSON object as body, where we are using `name` and `phone` as dynamic values.
- Please note that the same response can be easily achieved by other helpers also, and you don't necessarily need to write a code. This example was just to show you how we can use the code helper. Which is to say that you should avoid writing code if you don't have to, however if you absolutely have to write a code, you have an option to do that.

## inject

Type: Custom Helper

Usage: Another use case for custom code could be when you don't want to write a code for the entire response generation, but there are some parts of your response that need a custom code. Using `inject` helper you can use Camouflage's helpers and your custom code both together. Implementation remains similar to `code` helper, refer to the example below.

```
HTTP/1.1 200 OK
Content-Type: application/json

{
    "phone": {{#inject}}(()=>{ return Math.round(Math.random() * 10000000000); })();{{/inject}}
}
```

## csv

Type: Custom Helper

Usage: CSV Helper allows you to provide a data source as an input along with two combinations of policies

- With a key and value: In this case the helper will return a response specific to a given key and value
- Random: In this case, helper will pick one row from the provided csv and formulate the response for the provided row

For more details on how to use csv helper, refer to External Data Source page.

## is

Type: Custom Helper

Credits: [danharper/Handlebars-Helpers](https://github.com/danharper/Handlebars-Helpers){target=\_blank}

Usage: `is` helper can be considered as an extension of `if` which allows you to evaluate conditions that are lacking in inbuilt helper.

`is` can be used in following three ways:

- With one argument: `is` acts exactly like `if`
```
{{#is x}} ... {{else}} ... {{/is}}
```
- With two arguments: `is` compares the two are equal (a non-strict, `==` comparison, so `5 == '5'` is true)
```
{{#is x y}} ... {{else}} ... {{/is}}
```
- With three arguments: the second argument becomes the comparator.
```
{{#is x "not" y}} ... {{else}} ... {{/is}}
{{#is 5 ">=" 2}} ... {{else}} ... {{/is}}
```

Accepted operators are:

- `==` (same as not providing a comparator)
- `!=`
- `not` (alias for `!=`)
- `===`
- `!==`
- `>`
- `>=`
- `<`
- `<=`
- `in` (to check if a value exists in an array. ex: `{{#is 'John' in (capture from='body' using='jsonpath' selector='$.names')}}`)

## proxy

Type: Custom Helper

Usage: Proxy Helper allows you to redirect your calls to an actual downstream selectively. You might want to redirect all calls to actual downstream or some calls based on some condition, i.e. if a specific header exists, or a query param is provided. Example mock file content:

```
HTTP/1.1 200 OK
x-additional-headers: somevalue

{{#proxy}}
{
    "target": "http://target_host:3000/"
}
{{/proxy}}
```



For more details on how to use the proxy helper, refer to the Proxy page.

!!! caution
    Some of the Camouflage helpers allow (sometimes require) you to write your Javascript code in order to use them. However it's not a great idea to allow such code injections due to security concerns it creates. Camouflage disabled injection by default however you can enable it in config.yml. Following helpers will not work if injection is disabled.
    
    - code;
    - inject;
    - pg;
    - csv; and
    - Any external custom handlebars you might define yourself.

    Enable injection if you understand the potential risks.


## Inbuilt Helpers

!!! note

    A variety of helpers are made available by Handlebar.js. Following example just showcases how the inbuilt helpers can be used with Camouflage, more details and examples can be found just about anywhere on the internet. As far as inbuilt helpers are concerned, you can use any of them as long as it makes sense to you.

Raw HTML Request:

```
POST /users HTTP/1.1
Content-Type: application/json

{
    "firstName": "Robert",
    "lastName": "Downey",
    "nicknames": [
        {
            "nickname": "Bob"
        },
        {
            "nickname": "Rob"
        }
    ]
}
```

Expected Raw HTML Response:

```
HTTP/1.1 201 OK
X-Requested-By: user-service
Content-Type: application/json

{
    "status": 201,
    "message": "User created with ID: f45a3d2d-8dfb-4fc6-a0b2-c94882cd5b91",
    "data": [
        {
            "nickname": "Bob"
        },
        {
            "nickname": "Rob"
        }
    ]
}
```

1. To create this service in camouflage, create a directory users under your ${MOCKS_DIR}. i.e. ${MOCKS_DIR}/users
2. Create a file POST.mock and add following content to the file

```
HTTP/1.1 201 OK
X-Requested-By: user-service
Content-Type: application/json

{
    "status": 201,
    "message": "User created with ID: {{randomValue type='UUID'}}",
    "data": [
        {{#each request.body.nicknames}}
            {{#if @last}}
                {
                    "nickname": "{{this.nickname}}"
                }
            {{else}}
                {
                    "nickname": "{{this.nickname}}"
                },
            {{/if}}
        {{/each}}
    ]
}
```

Explanation

1. We replaced the static UUID `f45a3d2d-8dfb-4fc6-a0b2-c94882cd5b91` with `{{randomValue type='UUID'}}`, so that this value updates on each request.
2. We wrapped our JSONObject inside a **data** array with an **each** helper which iterates over **nicknames** array from request body.
3. Finally we put an if condition to check if we are at the last element of the array, we shouldn't append a comma at the end of our JSONObject, in order to get a valid JSON. If we are at any other element in the array, we'll add a comma to JSONObject.

Available inbuilt helpers are `if`, `unless`, `each`, `with`, `lookup` and `log`. More details are available at [Handlebars Documentation](https://handlebarsjs.com/guide/builtin-helpers.html){target=\_blank}
