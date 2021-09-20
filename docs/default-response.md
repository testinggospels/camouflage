# Default Response

By default, Camouflage sends a default response for the APIs for which it cannot find a corresponding mock file.

```json
{
    "error": "Not Found"
}
```

However as a user you have the ability to override it at API level or at the global level. Consider the example below.

- If you make a `GET` call to `/hello-world/greet/me`, Camouflage will first evaluate the mock file location as `${MOCK_DIR}/hello-world/greet/me/GET.mock`.
- If the above file is not found, Camouflage will look for a closest match.
    * Let's say you don't have a folder `${MOCK_DIR}/hello-world/greet/me`, but you have a folder `${MOCK_DIR}/hello-world/greet`, closest match would be evaluated to `${MOCK_DIR}/hello-world/greet/__/GET.mock`
    * Similarly if you don't have a folder `${MOCK_DIR}/hello-world/greet/me`, but you have a folder `${MOCK_DIR}/hello-world`, closest match would be evaluated to `${MOCK_DIR}/hello-world/__/GET.mock`
    * In short, the closest match is `${MOCK_DIR} + last available folder + wildcard + ${HTTP_VERB}.mock`. This is your API level default response.
- If none of the files are found as shown above, Camouflage will make one final attempt to find `${MOCK_DIR}/__/GET.mock`. This is your global level default response.
- In case a global level default response too, is not found, Camouflage will fallback to it's inbuilt default response.

To summarize, for a GET call to `/hello-world/greet/me`, Camouflage would search for corresponding mocks in following order:

- `${MOCK_DIR}/hello-world/greet/me/GET.mock` - Exact Match
- `${MOCK_DIR}/hello-world/greet/__/GET.mock` - API Level Default Response
- `${MOCK_DIR}/hello-world/__/GET.mock` - API Level Default Response
- `${MOCK_DIR}/__/GET.mock` - Global Default Response