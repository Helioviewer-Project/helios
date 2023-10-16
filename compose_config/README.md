# Docker Compose Configuration
These are the configuration files for using docker compose.

The configuration files specify things like database passwords and ssh keys.

For security reasons, the defaults are not used automatically.
If you don't care about changing the default values, the fastest setup
is to just remove the word `example` from the file names.

```
api/config.example.ini -> api/config.ini
database/db_password.example -> database/db_password
```

Once you have the config files set up, then just run

`docker compose up`
