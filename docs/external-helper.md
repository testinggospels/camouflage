# External Helpers

Camouflage allows users to be able to inject custom helpers while starting the Camouflage server. To inject you'd need to update config.yml with an additional key and provide a JSON file containing the definition of your custom helper. Example:

```
ext_helpers: "./custom_handlebar.json"
```

The JSON in the file should be an array of JSON Objects containing two keys: `name` and `logic`. Example:

```json
[
  {
    "name": "is",
    "logic":"(()=>{ logger.info(JSON.stringify((context.hash))); if(context.hash.value1===context.hash.value2) {return context.fn(this);} else {return context.inverse(this);} })()"
  }
]
```

- `name`, can be anything of your choosing.
- `logic`, has to be an IIFE (Immediately Invoked Function Expression), inside an arrow function. The function has access to `request` and `logger` objects. The logic should return a value in accordance with your expectations from the function.

This loads a custom helper, `is`, which can be used in your mock files to compare to values. Use it as shown in example:

```javascript
HTTP/1.1 200 OK

{{#is value1=request.query.name value2='Shubhendu'}}
   Response if true
{{else}}
   Response if false
{{/is}}
```

!!!danger
    
    If you plan to use any external dependencies in your code, you'd need to install them globally on the server Camouflage is hosted on, using `npm i -g package_name`. Before starting Camouflage, run  the following command:
    
    - `npm root -g`
    
    Pass the output of this command to the next command.
     
    - On Linux/macOS: `export NODE_PATH="output_from_previous_command"`
    - On Windows: `set NODE_PATH="output_from_previous_command"`
    
