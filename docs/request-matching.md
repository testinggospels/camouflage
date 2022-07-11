## Request Matching

There are scenarios when you would need to change your response based on some conditions met by fields on request objects. For example, if the end user passes an Authorization header, you'd want to send a 200 OK response if not you'd want to send a 401 Unauthorized response.

To do so you can utilize the power of handlebars again. Simply provide an if else condition and you are good to go. Consider the following example.

```
You expect the user to call the endpoint /hello-world in two ways.
1) By simple making a GET request to /hello-world.; Or
2) By adding a query parameter name in the GET request to /hello-world.
   i.e. /hello-world?name=John
```

Based on how the user calls the API, you'd want to send a different
response. This can be done in following manner:

Create a GET.mock file under the directory ${MOCKS_DIR}/hello-world. And paste following content:

```
{{#if request.query.name}}
HTTP/1.1 200 OK
X-Requested-By: Shubhendu Madhukar
Content-Type: application/json

{
    "greeting": "Hello {{capture from='query' key='name'}}",
    "phone": {{randomValue length=10 type='NUMERIC'}},
    "dateOfBirth": "{{now format='MM/DD/YYYY'}}",
    "test": "{{randomValue}}"
}
{{else}}
HTTP/1.1 200 OK
X-Requested-By: Shubhendu Madhukar
Content-Type: application/json

{
    "greeting": "Hello World",
    "phone": {{randomValue length=10 type='NUMERIC'}},
    "dateOfBirth": "{{now format='MM/DD/YYYY'}}",
    "test": "{{randomValue}}"
}
{{/if}}
```

### Explanation

We are going to check if a query parameter with the key 'name' exists in the incoming request. We do so by adding an if condition

```
{{#if request.query.name}}
```

!!! note

    `if` and `unless` helpers are provided by handlebarjs, which don't have comparison capabilities. These helpers only check if the provided value is truthy or falsy. i.e. you can not do something like this: `{{#if something = something}}`. For comparisons, you'd need to use `is` helper. See Handlebars page for example.

Rest of the code is self explanatory, where if the condition is true, i.e. incoming request has a query parameter with key `name`, the `greeting` field in our response object would be `Hello John`, else the greeting would be `Hello World`.

Thus if the end user makes a GET request as `/hello-world?name=John`, he'd get a greeting `Hello John`. However, if the user calls `/hello-world` without any `name`, he'd get a greeting as `Hello World`

### Request Matching using headers

To perform request matching using headers the, mocks need to follow a slightly different approach. Using `capture` helper, we need to capture a specific header value which then can be passed to other helpers like `is` or `if`.

```
{{#if (capture from='headers' key='Authorization') }}
HTTP/1.1 200 OK
Content-Type: application/json

{
    "response": "response if auth header is present."
}
{{else}}
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
    "response": "response if no auth header present."
}
{{/if}}
```

If you want to validate a given header against a specific value, the mock file would be as shown below:

```
{{#is (capture from='headers' key='Authorization') 'Basic c2h1YmhlbmR1Om1hZGh1a2Fy' }}
HTTP/1.1 200 OK
Content-Type: application/json

{
    "response": "response if auth header is present."
}
{{else}}
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
    "response": "response if no auth header present."
}
{{/is}}
```

The same validation, albeit messy, can be carried out using `code` helper, as shown below. This needs `config.injection.enable` to be set to `true`
**Code**

```
HTTP/1.1 200 OK
Content-Type: application/json

{{#code}}
(()=>{
    const authHeader = request.get('Authorization');
    if(authHeader){
        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: `{
                "response": "response if auth header is present."
            }`
        };
    }else{
        return {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            },
            body: `{
                "response": "response if no auth header present."
            }`
        };
    }
})();
{{/code}}
```
