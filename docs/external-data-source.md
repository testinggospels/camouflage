# External Data Source

Camouflage lets you condition your response for a specific set of data. Because we understand that random values don't always fulfill the requirements. Camouflage provides two helpers, `pg` and `csv`, which can be used to connect to a postgres db and csv data file respectively.

!!! caution
Both `pg` and `csv` helpers, rely on code injection for response generation. To use these helpers, the property `injection` needs to be set to `true` in config.yml. Injection can lead to security related issues and should be used judiciously.

## pg

`pg` helper requires a postgres connection. To establish this connection between Camouflage and a postgres database, add following parameters in the config.yml file

```yaml
ext_data_source:
  pg:
    host: localhost
    port: 5432
    user: root
    password: password
    database: postgres
```

Update the connection parameters with your database details.

In your mock files, use `pg` helper to run queries and fetch corresponding data. A sample mock file would look similar to the following content:

```
HTTP/1.1 200 OK
Content-Type: application/json

{{#pg query='SELECT * FROM emp WHERE id = \'1\''}}
(()=> {
    let response = []
    result.rows.forEach(row => {
        const adult = row.age > 18 ? 'adult' : 'minor'
        response.push({
            user: row.name,
            adult: adult
        })
    })
    return {
        status: 201,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(response)
    };
})();
{{/pg}}
```

### Explanation

1. `pg` helper, similar to `code` or `csv` helper, is written as an IIFE (Immediately Invoked Function Expression). As shown above, IIFE is written as `(()=> { ... })();`
2. The helper requires a mandatory parameter, `query` as a string.
3. The `pg` block gets access to a `result` object which can be used to condition the response. More details on how to use the `result` object can be found on [node-postgres](https://node-postgres.com/api/result){target=\_blank} API documentation
4. IIFE should return the generated response as a json object which contains body as a string. Optionally the response object can contain a status code and headers.

## csv

To use `csv` helper, you would need a data source, which is a csv file. A sample file can be found in the github repo.

Usage:

CSV helper can be invoked in following manner, with three parameters, i.e.

- src: The location of your csv file.
- key: The column name in which you would like Camouflage to search for a specific value
- value: The value you want to search

Camouflage then gives you access to a `result` array, which you can use inside an IIFE. It's your responsibility to decide how you want to use the `result` array. For example, in the snippet shown below, we are simply using the 1st element of the array i.e. `result[0]`. But you could also write a for loop to iterate over the array and generate your response body.

Please note that the value you return MUST be a json object which contains a body in a string format (required), you can optionally provide status and headers as well.

```
HTTP/1.1 200 OK
X-Requested-By: Shubhendu Madhukar
Content-Type: application/json

{{#csv src="./test.csv" key="City" value="Worcester"}}
(()=> {
    return {
        status: 201,
        headers: {
            'Content-Type': 'application/json'
        },
        body: `{
            "City": "${result[0].City}",
            "State": "${result[0].State}",
            "LatD": ${result[0].LatD},
            "LonD": ${result[0].LonD}
        }`
    };
})();
{{/csv}}
```

Camouflage provides you another alternative, in case you don't want to search for a specific value, instead you just want to pick one row at random and tailor your response to that specific row.

In that case you'd remove `key` and `value` from the snippet shown above, and simply put `random=true` instead.

To get entire data pass `all=true`.

!!!caution 1. Note that, though we are calling it a "c"sv, it's not really comma separated, Camouflage expects the values to be separated by a semicolon. i.e. `;`

    2. Keep in mind that if you use random=true, you don't get the `result` object as an array, you would get one single object. So in the example above, `result[0].City` will not work, you'd need to update it to simply `result.City`
