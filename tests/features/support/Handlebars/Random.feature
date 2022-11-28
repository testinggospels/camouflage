Feature: Handlebars helpers
    In order to have mocks with dynamic responses
    As a user
    I want handlebars support for generating random values

  Scenario: Random number generation
    Given a http mock file for "/handlebars/randomNumber"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
          "phone": {{randomValue length=10 type='NUMERIC'}}
      }
      ```
    When the http url "/handlebars/randomNumber" is called
    Then the "phone" property has a "number" value of 10 characters

  Scenario: Random string generation
    Given a http mock file for "/handlebars/randomString"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
          "city": "{{randomValue length=15}}"
      }
      ```
    When the http url "/handlebars/randomString" is called
    Then the "city" property has a "string" value of 15 characters
