Feature: {{code}} Handlebars helpers
    In order to have mocks with dynamic responses
    As a user
    I want handlebars support for writing custom code to generate response

  Scenario: Code blocl
    Given a http mock file for "GET" request to url "/handlebars/code"
      ```
      HTTP/1.1 200 OK
      Content-Type: application/json
      
      {{#code}}
      (()=>{
      function getRandomNumberInRange(min, max) {
        return Math.round(Math.random() * (max - min) + min);
      }
      const name = request.query.name;
      const phone = getRandomNumberInRange(1000000000, 9999999999)
      logger.info(phone);
      return {
        status: 201,
        headers: {
            'X-Requested-By': name
        },
        body: `{
            "greeting": "Hello ${name}",
            "phone": ${phone}
        }`
      };
      })();
      {{/code}}
      ```
    When the http url "/handlebars/code?name=John" is called with method "GET"
    Then the "greeting" property has a "string" value of "Hello John"
    Then the "phone" property has a "number" value between 1000000000 and 9999999999
    Then the "X-Requested-By" header has a value of "John"
