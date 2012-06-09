JsAiGame
========

A simple JavaScript game, mainly focusing on improving my AI knowledge.

Current State
* AI Core
  Start of a GOAP based AI
  Patrol like Action - just picks a random point and walks to it
* Navigation
  Nav Mesh - Illustrated by the colored background.
    Nav mesh is auto generated based on world geometry
  Path smoothing.
    Needs to be fixed to prevent wall collisions
    Initial wall collision avoidance, by offseting navigation points
* Guns
  A basic system to create arbitrary characteristics for each gun
  Particles used for collision effects
* UI
  Terrible UI, just enough to work with

## 3rd Party Libraries
    Sylvester https://github.com/jcoglan/Sylvester 		MIT License
    	math/sylvester.joined.js
    RequireJs http://requirejs.org/ 					MIT License
    	require.js
    Crafty    http://craftyjs.com/						MIT License
    	crafty.js

## Assets
	MeteorRepository http://opengameart.org/content/141-military-icons-set 	CC Author: AngryMeteor.com

## License
Copyright (c) 2012 FromKeith

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.