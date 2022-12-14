Feature: {{concat}} Handlebars helpers
    In order to have mocks with dynamic responses
    As a user
    I want handlebars support for concatenating various values as a single string

  Scenario: Default date generation
    Given a http mock file for "GET" request to url "/handlebars/concat"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {
          "concatenated": "{{concat 'Camouflage' ' is ' 'easy'}}"
      }
      ```
    When the http url "/handlebars/concat" is called with method "GET"
    Then the "concatenated" property has a "string" value of "Camouflage is easy"
