# Model Information

The sun model has a width and height of 100 units.
The radius of the hemisphere is 25 units all around.
There is a flat plane of 25 units on 

Center of the hemisphere:
- (50, 50)
Equation for the circle against the back plane:
(50 - x)^2 + (50 - y)^2 < 25^2

All graphics shaders execute in the 0-1 range.
To get these from 0-1, divide by 100.

## Shader Equations
Shader circle equation:
(0.5 - x)^2 + (0.5 - y)^2 < 0.25^2

You will see the equation used in `../../Scene/three/model_builder.js`

### Credits
Original Model by [Cesar Chavez](https://www.linkedin.com/in/cesar-chavez-design)
Model Edits by [Daniel Garcia-Briseno](https://github.com/dgarciabriseno/)
