# Performance Mode

By default Camouflage starts on a single CPU, by creating one master and one worker process. This is sufficient for a functional test and a small scale perf test (for a test with 60000 RPM without any latency simulation, 95th percentile response time was around 30 - 40 milliseconds). However, if you are on a multi core machine and you'd like Camouflage to utilize more cores, you can do so by updating the `cpus` parameter in your config.yml as any number less than the available CPUs. e.g. 4

This will tell Camouflage to start 1 master and 4 workers utilizing 4 cores of your CPU. This leads to a better performance. For a HTTP test with 60000 RPM with latency simulation, 95th between 10 - 13 millseconds. Reports can be found on the **Tests** page.

Camouflage uses NodeJS cluster module to achieve this, which means it also provides a high availability. If you have specfied 4 workers, Camouflage will always ensure that 4 workers are running. In any case if one or more of your workers crash, they will be replaced by a new worker.

