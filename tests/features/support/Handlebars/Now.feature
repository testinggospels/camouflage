Feature: Handlebars helpers
    In order to have mocks with dynamic responses
    As a user
    I want handlebars support for generating dates and timestamps

  Scenario: Default date generation
    Given a http mock file for "GET" request to url "/handlebars/now/default"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
          "date": "{{now}}"
      }
      ```
    When the http url "/handlebars/now/default" is called with method "GET"
    Then the "date" property has a "string" value of format "YYYY-MM-DD hh:mm:ss"

  Scenario: Date generation with a specified format
    Given a http mock file for "GET" request to url "/handlebars/now/format"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
          "date": "{{now format='MM/DD/YYYY'}}"
      }
      ```
    When the http url "/handlebars/now/format" is called with method "GET"
    Then the "date" property has a "string" value of format "MM/DD/YYYY"
