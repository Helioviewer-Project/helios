Welcome to the Helios's Internal API documentation.
This information covers the classes that make up
the Helios application.

You can find the overall design for Helios [here](https://bit.ly/3PtWmLp)
It includes the dependencies between each class.

## Overview

Helios is an adaptation of [Helioviewer](https://helioviewer.org) which uses 3js to render solar images in 3D.
It works by getting image and positional data from the Helioviewer API, and rendering them in a 3D scene.
You can interact with a demo [here](https://gl.helioviewer.org).

## How To Run It
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

### Making Changes
Make sure to re-run `npx webpack` to update the js bundle whenever making javascript changes.

#### Adding a new Data Source
It *should* be easy to add a new data source. Just follow these 3 easy steps.

1. Add the new source as an option to the dropdown in index.html
2. Add the resolution of the base image size to `common/resolution_lookup.js`
3. If the image doesn't include the solar disk, but should be rendered on a plane, then add the source id to `Configuration.js`'s plane\_sources array.

If this doesn't work, please create a GitHub issue for assistance.

## Organization
Helios is made up of 6 major components

- **Interface** – The user interface decides what must be rendered, it is the source of truth for what needs to be done in the scene. It also provides animation controls.

- **Scene** – The scene is the 3D render of the earth, sun, and images from telescopes. This module contains the logic that builds and renders objects in the scene.

- **Model**s – The models are the building blocks for the scene. They are the objects visible in the scene. A model may represent the sun, the earth, or a telescope. Each sun model will contain a list of textures & position information that can be used for animation.

- **Images** – This is the entry point to the helioviewer image database. The scene will request images from this subsystem. Contains both Image information and Observer Positional information. This data is considered coupled together and inseparable.

- **API** – This is the Helioviewer API as well as the SWHV Geometry Service.

- **Configuration** – This is the read only configuration that defines the back end URLs to use for the API, and HTML elements to attach Helios to.

![Diagram of components](https://bit.ly/3SYalfp)

## Class Dependencies
Each component has a set of classes which are meant to interface
with certain other classes. As shown in the following diagram.
The configuration has been excluded from this diagram.

![Diagram of sub components](https://bit.ly/3RvdIte)

Select any class on the right sidebar to see a description
of the class's responsibilities.

## Data Flow
This sequence diagram gives an example of how images are rendered
to the scene.

![Add source sequence](https://bit.ly/3ADceHD)

## Animation
This diagram shows how animations are done in the scene

![Animation diagram](https://bit.ly/3CcOefr)

