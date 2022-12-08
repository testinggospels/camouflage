Feature: {{num_between}} Handlebars helpers
    In order to have mocks with dynamic responses
    As a user
    I want handlebars support for generating dates and timestamps

  Scenario: Generate a random number between two numbers
    Given a http mock file for "GET" request to url "/handlebars/between"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
          "num": {{num_between lower=500 upper=600}}
      }
      ```
    When the http url "/handlebars/between" is called with method "GET"
    Then the "num" property has a "number" value between 500 and 600
