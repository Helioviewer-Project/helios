Welcome to the Helios's Internal API documentation.
This information covers the classes that make up
the Helios application.

You can find the overall design for Helios [here](https://bit.ly/3PtWmLp)
It includes the dependencies between each class.

## Overview

Helios is a plugin for Helioviewer which uses 3js to render solar data
onto 3D meshes. It works using the typical Helioviewer API, and also
the Geometry Service provided by the Royal Observatory of Belgium for
getting positional information of objects in space.

Using these APIs, which provide images and positional information, we can
render this data in 3D space.

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

