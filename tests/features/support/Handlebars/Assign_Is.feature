Feature: {{is}} Handlebars helpers
    In order to have mocks with dynamic responses
    As a user
    I want handlebars support for evaluating logic via comparision of two values

  Scenario: Check truthy values as inbuilt if helper does
    Given a http mock file for "GET" request to url "/handlebars/is"
      ```
      {{assign name='isTrue' value=true }}
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {{#is isTrue}}
        {
           "isTrue": "true"
        }
      {{else}}
        {
           "isTrue": "not True"
        }
      {{/is}}
      ```
    When the http url "/handlebars/is" is called with method "GET"
    Then the "isTrue" property has a "string" value of "true"

  Scenario: Check if two values are equal with type check
    Given a http mock file for "GET" request to url "/handlebars/is/equal/type"
      ```
      {{assign name='value' value=1 }}
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {{#is isTrue '1'}}
        {
           "equal": "true"
        }
      {{else}}
        {
           "equal": "false"
        }
      {{/is}}
      ```
    When the http url "/handlebars/is/equal/type" is called with method "GET"
    Then the "equal" property has a "string" value of "false"

  Scenario: Check if two values are equal without type check
    Given a http mock file for "GET" request to url "/handlebars/is/equal/notype"
      ```
      {{assign name='value' value=1 }}
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {{#is value '==' '1'}}
        {
           "equal": "true"
        }
      {{else}}
        {
           "equal": "false"
        }
      {{/is}}
      ```
    When the http url "/handlebars/is/equal/notype" is called with method "GET"
    Then the "equal" property has a "string" value of "true"
