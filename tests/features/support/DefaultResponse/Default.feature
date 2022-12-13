Feature: {{is}} Handlebars helpers
    In order to have mocks with dynamic responses
    As a user
    I want camouflage to return a default response for missing mocks

  Scenario: Check API Level default response.
    Given no mock file for "GET" request to url "/handlebars/hello-world/greet/me"
    Given a http mock file for "GET" request to url "/handlebars/hello-world/greet/__"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
        "greeting": "not found"
      }
      ```
    When the http url "/handlebars/hello-world/greet/me" is called with method "GET"
    Then the "greeting" property has a "string" value of "not found"

  Scenario: Check global default response.
    Given no mock file for "GET" request to url "/handlebars/hello-world/greet/me"
    Given no mock file for "GET" request to url "/handlebars/hello-world/greet/__"
    Given a http mock file for "GET" request to url "/__"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
        "greeting": "not found"
      }
      ```
    When the http url "/handlebars/hello-world/greet/me" is called with method "GET"
    Then the "greeting" property has a "string" value of "not found"
