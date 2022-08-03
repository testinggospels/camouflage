# External Middlewares

Camouflage allows you to configure additional middlewares supported by express. This requires `injection` to be enabled in `config.yml`, as well as a `middleware.js` file at the root of your Camouflage project.

`middleware.js` is expected to include an IIFE which includes logic to configure the required middlewares. This IIFE has access to following variables:

- `app`
- `logger`
- `allRoutes`

The variables can be accessed by using `this`, e.g. `this.app`, `this.logger` and `this.allRoutes`.

## Example

```js
(() => {
  this.logger.info("inside middleware");
  const actuator = require("express-actuator");
  app.use(actuator());
  this.app.use("/api/v1", this.allRoutes);
})();
```

!!!caution

    If you are using middleware injection, you would be responsible for configuring the mock routes, therefore it is mandatory to include the code `this.app.use(prefix, this.allRoutes)` in your IIFE, where prefix can be a string e.g. "/" or "/api/v1" or any other desired prefix to your mock routes. This would be applicable for all mocks.

    If you plan to use any external dependencies in your code, you'd need to install them globally on the server Camouflage is hosted on, using `npm i -g express-actuator`. Before starting Camouflage, run the following command:

    - `npm root -g`

    Pass the output of this command to the next command.

    - On Linux/macOS: `export NODE_PATH="output_from_previous_command"`
    - On Windows: `set NODE_PATH="output_from_previous_command"`
