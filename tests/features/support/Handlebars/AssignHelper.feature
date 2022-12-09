Feature: {{capture}} handlebars helpers
    In order to have mocks with dynamic responses
    As a user
    I want handlebars support for capturing data from the request

  Scenario: Capture from request query parameters
    Given a http mock file for "GET" request to url "/handlebars/assign"
      ```
      {{assign name='name' value="John"}}
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
        "greeting": "Hello {{name}}",
        "name": "{{name}}"
      }
      ```
    When the http url "/handlebars/assign" is called with method "GET"
    Then the "name" property has a "string" value of "John"
    Then the "greeting" property has a "string" value of "Hello John"
