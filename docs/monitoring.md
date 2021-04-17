# Monitoring

Camouflage provides you with a prometheus scraping endpoint available at /metrics which contains information about your host and your mocks. You can install a Prometheus DB and configure it to scrape from /metrics endpoint, and use that data to create charts for monitoring your application. This might not be very useful when you are testing your frontends, or running a functional test. However while running a performance test, this data can prove to be useful. You can optionally install Grafana for even better visualizations.

Sample Prometheus yml

```
global:
  scrape_interval:     15s
  evaluation_interval: 15s
scrape_configs:
  - job_name: 'camouflage'
    static_configs:
    - targets: ['localhost:8080']
```

!!!note

        Update the target with your IP and port if running remotely or if you have specified a different port while starting Camouflage

