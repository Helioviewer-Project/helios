Welcome to the Helios's Internal API documentation.
This information covers the classes that make up
the Helios application.

You can find the overall design for Helios [here](https://bit.ly/3PtWmLp)
It includes the dependencies between each class.

## Overview

Helios is an adaptation of [Helioviewer](https://helioviewer.org) which uses 3js to render solar images in 3D.
It works by getting image and positional data from the Helioviewer API, and rendering them in a 3D scene.
You can interact with a demo [here](https://gl.helioviewer.org).

## Development Quickstart
The application has been containerized with docker compose.
The fastest way to get this application running on your pc is to get [get docker](https://docs.docker.com/get-docker/).
Then once it's installed and running, execute:

```
docker compose -f compose.devel.yaml up
```

If you plan to work on the flask API locally, you must also change `src/Configuration.js:helios_api_url` to `http://localhost:5000/`

## Development Without Docker (not recommended)
If you want to do development without docker, you need nodejs/npm and python installed.
It's doable, but it's a hassle since you have to manage at least 3 different processes.

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
Information on the program architecture and guides for certain tasks are available on the [wiki](https://github.com/Helioviewer-Project/helios/wiki)