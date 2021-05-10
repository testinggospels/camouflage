# Contributing

### Folder Structure

```
.
└── bin
│   └── camouflage.js
└── src
│   ├── BackupScheduler
│   │   └── index.ts
│   ├── handlebar
│   │   ├── handleBarDefinition.ts
│   │   └── index.ts
│   ├── logger
│   │   └── index.ts
│   ├── parser
│   │   ├── GrpcParser.ts
│   │   └── HttpParser.ts
│   ├── protocols
│   │   └── index.ts
│   ├── routes
│   │   ├── CamouflageController.ts
│   │   └── GlobalController.ts
│   └── index.ts
└── ...
```

!!! note

    Following section only tries to explain the tasks carried out by each module. Actual code level documentation is provided inline with each file for easier access.

### [bin/camouflage.js](https://github.com/fauxauldrich/camouflage/blob/main/bin/camouflage.js){target=\_blank}

This is the starting point of the application, which carries out following tasks:

- Takes in input from terminal/command line and config file.
- Defines actions for management modules such as `camouflage init`, `camouflage restore` and `camouflage -h`.
- Creates a cluster of master and worker processes.
- Decides if the passed arguments are valid and passes them on to the main app, else terminates the appliation with necessary error messages.

### [src/index.ts](https://github.com/fauxauldrich/camouflage/blob/main/src/index.ts){target=\_blank}

Once application passes the first stage of checks, it will reach this file, which begins the actual mock server's tasks, namely:

- Define middlewares which are, express body parser, swagger stats, winston logger for express.
- Define static resource for two UIs. First, the documentation site hosted at root (/) location and second, file explorer UI hosted at /ui location.
- Override default values of required parameters.
- Register handlebars, management controllers and global generic controllers.
- Export start function to be used by bin/camouflage.js and express app object to be used by functional tests.

### [src/BackupScheduler/index.ts](https://github.com/fauxauldrich/camouflage/blob/main/src/BackupScheduler/BackupScheduler.ts){target=\_blank}

This module simply creates a cron job which in turn copies mocks directories, certs directory and config file to the users' home directory as a backup procedure. The backup directory then can be used to restore the files to current working directory or a new project altogether. User can disable the backup feature if required via config file and can also control how often backups should be created by specifying a cron schedule

### [src/handlebar/handleBarDefinition.ts](https://github.com/fauxauldrich/camouflage/blob/main/src/handlebar/handleBarDefinition.ts){target=\_blank}

This modules define the behavior of custom handlebars made available by Camouflage, such as random value helper, now helper, request helper and num between helpers to help users to prepare a response that mimics the real world response.

### [src/handlebar/index.ts](https://github.com/fauxauldrich/camouflage/blob/main/src/handlebar/index.ts){target=\_blank}

A master module for handlebar, simply to register all the helpers in one place. Alternative would be to register helpers in index.ts which is not ideal.

### [src/logger/index.ts](https://github.com/fauxauldrich/camouflage/blob/main/src/logger/index.ts){target=\_blank}

Module to define a logger according to the log level defined by config file, to be used throughout the application.

### [src/parser/GrpcParser.ts](https://github.com/fauxauldrich/camouflage/blob/main/src/parser/GrpcParser.ts){target=\_blank}

GrpcParser is responsible for definition of generic functions which will respond to all calls from a gRPC client be it unary, bidi or one sided streams. These functions carry out following tasks:

- Determine the location appropriate mock files based on the handler specified by the incoming requests.
- Parse the contents of the mock files
- Replace templates with their values
- Add delays
- Create chunks in case of streams
- And finally send back the response.

### [src/parser/HttpParser.ts](https://github.com/fauxauldrich/camouflage/blob/main/src/parser/HttpParser.ts){target=\_blank}

HttpParser is responsible for definition of generic function to be used by GlobalController module. These functions carry out following tasks:

- Determine the location appropriate mock files based on the request URL path and method.
- Parse the contents of the mock files
- Replace templates with their values
- Add delays
- Add headers
- Add status codes
- Add response body
- And finally send back the response.

### [src/protocols/index.ts](https://github.com/fauxauldrich/camouflage/blob/main/src/protocols/index.ts){target=\_blank}

This module creates servers with their listeners for http, https, http2 and gRPC protocols as specified by enabled properties for each protocols in config file.

### [src/routes/CamouflageController.ts](https://github.com/fauxauldrich/camouflage/blob/main/src/routes/CamouflageController.ts){target=\_blank}

Camouflage controller is responsible for definition of endpoints useful for management modules. Available endpoints are:

- GET /mocks - Lists the available http and grpc mocks. Will be deprecated as the file explorer UI takes care of this internally, rendering this endpoint useless.
- DELETE /mocks - Deletes a mock with the specified path and method. Will be deprecated as the file explorer UI takes care of this internally, rendering this endpoint useless.
- GET /restart - Kills all the running workers which then automatically get replaced by their replacements since Camouflage follows 'restart unless explicitly stopped' policy for it's worker management. No UI component for this but will be developed soon.
- GET /ping - Shows the health and runtime of running worker

### [src/routes/GlobalController.ts](https://github.com/fauxauldrich/camouflage/blob/main/src/routes/GlobalController.ts){target=\_blank}

Global controller registers generic routes defined by (\*) which will respond to all HTTP calls from a client unless explicitly handled by other modules from Camouflage. Uses getMatchedDir and getResponse function to locate appropriate mock file for an incoming HTTP/HTTPs/HTTP2 request and respond with the contents of the mockfile.
