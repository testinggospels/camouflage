# Backup and Restore

### How does Camouflage Restore work?

- Camouflage has an inbuilt backup and restore mechanism to keep your mocks safe.
- To enable or disable backups, update `backup.enable` property in your config file.
- To define the schedule for backup, update `backup.cron` property with a valid cron schedule (Refer [Crontab.guru](https://crontab.guru){target=\_blank}, if you are not familiar with cron schedules )
- In order to restore your previously backed up data, all you need is your config.yml file. Run following command in your working directory.

```
camouflage restore --config config.yml
```

- What to do if you don't have a config.yml? Run `init` command first and then restore.

```
camouflage init
```

```
camouflage restore --config config.yml
```

- Camouflage backs up **Http mocks directory**, **key and certificates** and **gRPC mocks and protos** from your project.
