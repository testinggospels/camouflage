Feature: {{random}} Handlebars helpers
    In order to have mocks with dynamic responses
    As a user
    I want handlebars support for generating random values

  Scenario: Random number generation
    Given a http mock file for "GET" request to url "/handlebars/randomNumber"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
          "phone": 1{{randomValue length=9 type='NUMERIC'}}
      }
      ```
    When the http url "/handlebars/randomNumber" is called with method "GET"
    Then the "phone" property has a "number" value of 10 characters

  Scenario: Random string generation
    Given a http mock file for "GET" request to url "/handlebars/randomString"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
          "city": "{{randomValue length=15}}"
      }
      ```
    When the http url "/handlebars/randomString" is called with method "GET"
    Then the "city" property has a "string" value of 15 characters
