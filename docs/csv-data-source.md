# CSV Data Source

Camouflage lets you condition your resposne for a specific set of data. Because we understand that random values, don't always fulfill the requirements. To use `csv` helper, you would need a data source, which is a csv file. A sample file can be found in the github repo.

!!!caution

        Not that, though we are calling it a "c"sv, it's not really comma seperated, Camouflage expects the values to be seperated by a semicolon. i.e. ;

Usage:

CSV helper can be invoked in following manner, with three parameters, i.e.

- src: The location of your csv file.
- key: The column name in which you would like Camouflage to search for a specific value
- value: The value you want to search

Camouflage then gives you access to a `result` array, which you can use inside an IIFE. It's your resposibility to decide how you want to use the `result` array. For example, in snippet shown below, we are simply using 1st element of the array i.e. `result[0]`. But you could also write a for loop to iterate over the array and generate your response body.

Please note that the value you return MUST be a string.

```
HTTP/1.1 200 OK
X-Requested-By: Shubhendu Madhukar
Content-Type: application/json

{{#csv src="./test.csv" key="City" value="Worcester"}}
(()=> {
    return `
    {
        "City": "${result[0].City}",
        "State": "${result[0].State}",
        "LatD": ${result[0].LatD},
        "LonD": ${result[0].LonD}
    }`
})();
{{/csv}}
```

Camouflage provides you another alternative, in case you don't want to search for a specific value, instead you just want to pick one row at random and tailor your response to that specific row.

In that case you'd remove `key` and `value` from the snippet show above, and simply put `random=true` instead.

!!!caution

    Keep in mind that if you use random=true, you don't get `result` object as an array, you would get one single object. So in the example above, `result[0].City` will not work, you'd need to update it to simply `result.City`
