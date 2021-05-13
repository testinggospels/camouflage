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
5. **{{now format='MM/DD/YYYY hh:mm:ss' offset='-10 days'}}** - Use offset specify the delta for your desired date from current date.

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

1. **{{capture from='query' key='firstName'}}** - Pretty self-explanatory, but if say your endpoint looks like /hello-world?firstName=John&lastName=Wick. And your response is {"message": "Hello Wick, John"}, you can make the response dynamic by formatting your response as

```
{
    "message": "{{capture from='query' key='lastName'}}, {{capture from='query' key='firstName'}}"
}
```

2. **{{capture from='path' regex='\/users\/get\/(.*)?'}}** - For path, you'd need to specify a regex to capture a value.
3. **{{capture from='body' using='jsonpath' selector='$.lastName'}}** - To capture values from request body, your options are either using='regex' or using='jsonpath'. Selector will change accordingly.

## num_between

Type: Custom Helper

Usage:

1. **{{num_between lower=500 upper=600}}**: Generate a number between two values. Example: you can add this value in your response header with a key Response-Delay, to simulate a latency in your API. Not providing lower/upper value or providing values where lower > upper would set delay to 0, i.e. won't have any effect. Check **Response Delays** page for a detailed example

## file

Type: Custom Helper

Usage:

1. **{{file path='/location/of/the/image/or/text/or/any/file'}}**: If you want to serve a file as a response, maybe an image, or text file, a pdf document, or any type of supported files, use file helper to do so. An example is shown below:

```
HTTP/1.1 200 OK
X-Custom-Header: Any Custom Value
Response-Delay: 500

{{file path='./docs/camouflage.png'}}
```

## Inbuilt Helpers

!!! note

    A variety of helpers are made available by Handlebar.js itself and Camouflage team had nothing to do with those, and we don't take credit for it. Following example just showcases how the inbuilt helpers can be used with Camouflage, more details and examples can be found just about anywhere on the internet. As far as inbuilt helpers are concerned, you can use any of them as long as it makes sense to you.

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
2. We wrapped our JSONObject inside **data** array with an **each** helper which iterates over **nicknames** array from request body.
3. Finally we put an if condition to check if we are at the last element of the array, we shouldn't append a comma at the end of our JSONObject, in order to get a valid JSON. If we are at any other element in the array, we'll add a comma to JSONObject.

Available inbuilt helpers are `if`, `unless`, `each`, `with`, `lookup` and `log`. More details are available at [Handlebars Documentation](https://handlebarsjs.com/guide/builtin-helpers.html){target=\_blank}
