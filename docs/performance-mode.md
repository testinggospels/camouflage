# Performance Mode

By default Camouflage starts on a single CPU, by creating one master and one worker process. This is sufficient for a functional test and a small scale perf test (for a test with 60000 RPM without any latency simulation, 95th percentile response time was around 30 - 40 milliseconds). However, if you are on a multi core machine and you'd like Camouflage to utilize more cores, you can do so by passing and additional parameter as shown below:

```
camouflage -m ./mocks -n 4
```

This will tell Camouflage to start 1 master and 4 workers utilizing 4 cores of your CPU. This leads to a better performance. For a test with 60000 RPM with latency simulation, 95th between 10 - 13 millseconds. Reports can be found on the **Tests** page.

