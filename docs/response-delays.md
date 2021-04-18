## Response Delay

Response delays are handled in a similar manner as it was done in mockserver, i.e. you add a Response-Delay header in raw response placed in your .mock file.

For example, if you'd like to simulate a delay of 2 seconds for /hello-world endpoint, contents of your .mock file would be as follows:

```
HTTP/1.1 200 OK
X-Requested-By: Shubhendu Madhukar
Content-Type: application/json
Response-Delay: 2000

{
    "greeting": "Hello World",
    "phone": {{randomValue length=10 type='NUMERIC'}},
    "dateOfBirth": "{{now format='MM/DD/YYYY'}}",
    "test": "{{randomValue}}"
}
```

Additionally you can also simulate a dynamic delay using the **{{num_between}}** handlebar as follows

```
Response-Delay: {{num_between lower=500 upper=600}}
```

This would add a random delay of a value between 500 to 600 milliseconds

