# Sammy The Shark! #

This is my entry for NodeBoats @ CampJS May 2015, held in Melbourne.

## Objective ##

The objective is to build a boat using the [Particle Core](https://www.particle.io/prototype#spark-core),
and then control it using the Voodoo firmware, and Johnny-Five, Spark-IO Node modules.

Due to local limitations, I had to create a custom build of Spark-IO, and because I'm lazy, 
I've simply included the entire node\_modules folder.

## Script ##

```node yy.js```

This starts up a server that will look for a Particle Cloud (both Particle.io and local cloud, if provided).
Boot up a mobile device and surf to "<your-ip>:55555" and you will see a crappy little userinterface.

## Interface ##

The right side of the interface is touch enabled - touch move up to throttle up, touch move down to
throttle down. 

Steering is done using deviceorientation, so use tilt controls.

## Post-Mortem ##

At the event, wifi and internet connectivity issues continued to plague the various teams. 
With my usage of the local cloud architecture, I was able to continue attempting the course
when connectivity to particle.io was lost. Thanks to this, Sammy the Shark managed a course
best time of 1:03! 
