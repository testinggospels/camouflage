# External Helpers

Camouflage allows users to be able to inject custom helpers while starting the Camouflage server. To inject you'd need to update config.yml with an additional key and provide a JSON file contaning the definition of your custom helper. Example:

```
ext_helpers: "./custom_handlebar.json"
```

The JSON in the file should be an array of JSON Objects containing two keys: `name` and `logic`. Example:

```json
[
  {
    "name": "name",
    "logic": "(()=>{const name = request.query.name; return name;})()"
  },
  {
    "name": "phone",
    "logic": "(()=>{ return Math.round(Math.random() * 10000000000); })()"
  }
]
```

- `name`, can be anything of your choosing.
- `logic`, has to be an IIFE (Immediately Invoked Function Expression), inside an arrow function. The function has access to `request` and `logger` objects. The logic should return a value in accordance with your expectations from the function.

!!!caution
    
    If you plan to use any external dependencies in your code, you'd need to install them globally on the server Camouflage is hosted. Before starting Camouflage, run  the following command:
    
    - `npm root -g`
    
    Pass the output of this command to the next command.
     
    - On Linux/macOS: `export NODE_PATH="output_from_previous_command"`
    - On Windows: `set NODE_PATH="output_from_previous_command"`
    
