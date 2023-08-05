# Code Helper

## Tips for better usage

Writing long custom code for your mocks could be a painful task without IDE features like syntax highlighting, auto formatting, code completion etc. While Camouflage does not have a extensions for your IDEs, you can easily write your code in javascript files and import them in mock files, instead of writing everything in your mock files.

Here's an example by [jsapes](https://github.com/jsapes)

Ususally you would write your mocks like this:

```javascript
HTTP/1.1 200 OK
Content-Type: application/json

{{#code}}
(()=>{
 /**
 * Long javascript code to create myBody
 */
 return {
    status: 201,
    body: { ...myBody  },
  };
})();
{{/code}}
```

Instead you can break this down into two files.

* GET.mock
```javascript
HTTP/1.1 200 OK
Content-Type: application/json

{{#code}}
(()=>{
const path = require("path")
// Store all your custom code in a separate folder.
const myPath = path.join(process.cwd(), "mycustomcodes", "getResponseBody.js")
const { getResponseBody } = require(myPath)
return getResponseBody(request, logger)
})();
{{/code}}
```

* getResponseBody.js

```javascript
const getResponseBody = (request, logger) => {
/**
 * Long javascript code to create myBody
    */
return {
    status: 201,
    body: { ...myBody },
};
};

module.exports = { getResponseBody };
```

Reference: [discussioncomment-3769698](https://github.com/testinggospels/camouflage/discussions/22#discussioncomment-3769698)
