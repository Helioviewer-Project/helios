# Helios
Welcome! Helios is a next-gen web client supported by The Helioviewer Project.
It is a 3D web client for viewing data provided by [Helioviewer](https://helioviewer.org)
You can access Helios [here](https://gl.helioviewer.org)

## Overview
Helios uses threejs to render full disk images on a hemisphere (because observatories) only see one side...
If you've used [JHelioviewer](https://www.jhelioviewer.org/) then you're already familiar with how this works.

The advantage of Helios is that it runs in a browser, meaning it will run on
all of your devices to make sharing easy and accessible.

Helios is interoperable with Helioviewer.org and JHelioviewer.
Any videos made in Helioviewer can be opened in either Helios or JHelioviewer.
Similarly, any data loaded in Helios can also be opened in JHelioviewer with
the click of a button.

If you're interested in contributing to this project, see the details below.

## Development Quickstart
The development environment for Helios has been containerized with docker compose.
The fastest way to get this application running on your system is to get [get docker](https://docs.docker.com/get-docker/).
Then once it's installed and running, execute:

```
docker compose -f compose.devel.yaml up
```

If you plan to work on the flask API locally, you must also change `src/Configuration.js:helios_api_url` to `http://localhost:5000/`

## Development Without Docker (not recommended)
If you want to do development without docker, you need nodejs/npm and python installed.
It's doable, but it's a hassle since you have to manage at least 3 different processes:
The back end API server, the front end client server, and the javascript bundler.

1. clone the repository
```
git clone https://github.com/dgarciabriseno/helios.git
```

2. Install npm modules
```
cd helios
npm install
```

3. Build the javascript bundle
```
npx webpack
```

4. Run a local webserver to host index.html. I use python, but any webserver will work.
```
# Run this in the root directory of the repository. The folder that contains index.html.
python3 -m http.server # runs on port 8000 by default
```

5. See it in browser by going to [http://localhost:8000](http://localhost:8000)

6. If you plan to work on the flask API locally, you must run:
```bash
cd server
FLASK_DEBUG=1 python -m flask --app main run
```
and change `src/Configuration.js:helios_api_url` to `http://localhost:5000/`

### Making Changes
If running via docker compose, all changes for both js and python are automatically updated.

If running without docker, use `npx webpack watch` to automatically rebuild js changes as you make them.
Running flask in debug mode will automatically update API changes as you make them.

## Development Guide
Information on the application's architecture and guides for certain tasks are available on the [wiki](https://github.com/Helioviewer-Project/helios/wiki)