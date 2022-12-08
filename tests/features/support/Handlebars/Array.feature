Feature: {{array}} Handlebars helpers
    In order to have mocks with dynamic responses
    As a user
    I want handlebars support for generating dates and timestamps

  Scenario: Default date generation
    Given a http mock file for "GET" request to url "/handlebars/array"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      [ 
        {{#each (array source='Apple,Banana,Mango,Kiwi' delimiter=',')}}
            {{#if @last}}
                {
                    "id": {{randomValue type='NUMERIC' length=10}},
                    "fruit": "{{this}}"
                }
            {{else}}
                {
                    "id": {{randomValue type='NUMERIC' length=10}},
                    "fruit": "{{this}}"
                },
            {{/if}}
        {{/each}} 
      ]
      ```
    When the http url "/handlebars/array" is called with method "GET"
    Then the response is an array of length 4
