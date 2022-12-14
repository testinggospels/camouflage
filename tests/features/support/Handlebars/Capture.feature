Feature: {{capture}} handlebars helpers
    In order to have mocks with dynamic responses
    As a user
    I want handlebars support for capturing data from the request

  Scenario: Capture from request query parameters
    Given a http mock file for "GET" request to url "/handlebars/capture/query"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
        "name": "{{capture from='query' key='name'}}"
      }
      ```
    When the http url "/handlebars/capture/query?name=Shubhendu+Madhukar" is called with method "GET"
    Then the "name" property has a "string" value of "Shubhendu Madhukar"

  Scenario: Capture from request path
    Given a http mock file for "GET" request to url "/handlebars/capture/path/__/"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
          "value": "{{capture from='path' regex='\/capture\/path\/(.*)?'}}"
      }
      ```
    When the http url "/handlebars/capture/path/1" is called with method "GET"
    Then the "value" property has a "string" value of "1"

  Scenario: Capture from request body using regex
    Given a http mock file for "POST" request to url "/handlebars/capture/body"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
          "lastName": "{{capture from='body' using='regex' selector='lastName\": \"(.*?)\"'}}"
      }
      ```
    Given the request data
      ```
      {
          "firstName": "John",
          "lastName": "Doe"
      }
      ```
    And request headers
      ```
        {
            "Content-Type": "application/json"
        }
      ```
    When the http url "/handlebars/capture/body" is called with method "POST"
    Then the "lastName" property has a "string" value of "Doe"

  Scenario: Capture from request body using jsonpath
    Given a http mock file for "POST" request to url "/handlebars/capture/body"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
          "lastName": "{{capture from='body' using='jsonpath' selector='$.lastName'}}"
      }
      ```
    Given the request data
      ```
      {
          "firstName": "John",
          "lastName": "Doe"
      }
      ```
    And request headers
      ```
        {
            "Content-Type": "application/json"
        }
      ```
    When the http url "/handlebars/capture/body" is called with method "POST"
    Then the "lastName" property has a "string" value of "Doe"
