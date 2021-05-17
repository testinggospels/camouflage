# OpenAPI Conversion

If you have access to the OpenAPI specification for the APIs/Endpoints you want to mock, Camouflage supports the conversion via an external utility, `camoswag`.

### Getting started

- Install camoswag using npm command: `npm install -g camoswag`
- To use `camoswag`, you would need your OpenAPI specification file in either .json or .yaml format.
- Run the command: `camoswag --spec ./swagger.yaml` or `camoswag --spec ./swagger.json`. (Replace file location with your spec file location)
- This would create a new folder with the name `camouflage-${current_timestamp}` containing the required folder structure and mock files corresponding to each endpoint defined in your spec file.
- You can either delete or modify the dummy responses placed in the mockfiles as per your expectations. Once you are satisfied with the modifications, you can move the contents of the folder to your original ${MOCK_DIR} of your running Camouflage server.
- Note that if your spec file doesn't contain a response defined for a given endpoint, `camoswag` would put following default response in the mock file.

```json
{
  "message": "More Configuration Needed"
}
```

!!!caution

    camoswag currenty supports JSON responses only.
