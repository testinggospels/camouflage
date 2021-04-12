# Camouflage Documentation

Camouflage is a service virtualization tool inspired by [namshi/mockserver](https://github.com/namshi/mockserver){target=\_blank}. As the original description says, the mocking/service virtualization works on a file based structure where _you simply organize your mocked HTTP responses in a bunch of mock files and it will serve them like they were coming from a real API; in this way you can write your frontends without caring too much whether your backend is really ready or not._

## Why did we create Camouflage if a similar tool already exists?

Well, the original tool has not been maintained for some time now. But more importantly, Camouflage simply borrows the idea from the original and though it does use some of the same logic and functions, majority of the code has been written from scratch.

1. The underlying codebase has been re-written using typescript.
2. Since we are still in development phase, some features from the original tool might be missing. (Because we are yet to develop it, or simply because we haven't made up our mind yet if those features are going to be included or not.)
3. Camouflage introduces handlebars, which allows you to generate dynamic (more real) responses.
4. Using handlebars, you can generate random numbers, string, alphanumeric string, UUIDs and random dates.
5. You can also extract information from request queries, path, body or headers and use them in your response.
