[![GitHub license](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/softvis-research/Getaviz/blob/master/LICENSE)
[![Build Status](https://travis-ci.com/softvis-research/Getaviz.svg?branch=master)](https://travis-ci.com/softvis-research/Getaviz)  
# Getaviz

Getaviz makes it possible to solve software engineering problems visually by exploring them in 2D, 3D, and virtual reality. 
To get a first impression, have a look at [our showcases](http://home.uni-leipzig.de/svis/Showcases/) that are available online.

* Analyse a variety of software artifacts  
[![Java](https://img.shields.io/badge/language-Java-blue.svg)](https://java.com/)
[![Ruby](https://img.shields.io/badge/language-Ruby-blue.svg)](https://www.ruby-lang.org/)
[![C#](https://img.shields.io/badge/language-C%23-blue.svg)](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/index)  
[![git](https://img.shields.io/badge/SCM-git-blue.svg)](https://git-scm.com/)
[![svn](https://img.shields.io/badge/SCM-svn-blue.svg)](https://subversion.apache.org/)
* Visualize the required information appropriate for your usecase  
[![Recursive Disk](https://img.shields.io/badge/2D-Recursive%20Disk-blue.svg)](https://home.uni-leipzig.de/svis/getaviz/index.php?setup=web/RD%20freemind&model=RD%20freemind)  
[![RD 3D](https://img.shields.io/badge/3D-Recursive%20Disk-blue.svg)](https://home.uni-leipzig.de/svis/getaviz/index.php?setup=web/RD%20reek&model=RD%203D%20reek)
[![City](https://img.shields.io/badge/3D-City-blue.svg)](https://home.uni-leipzig.de/svis/getaviz/index.php?setup=web/City%20freemind&model=City%20original%20freemind)
[![City Bricks](https://img.shields.io/badge/3D-City%20Bricks-blue.svg)](https://home.uni-leipzig.de/svis/getaviz/index.php?setup=web/City%20freemind&model=City%20bricks%20freemind)
[![City Floors](https://img.shields.io/badge/3D-City%20Floors-blue.svg)](https://home.uni-leipzig.de/svis/getaviz/index.php?setup=web/City%20freemind&model=City%20floor%20freemind)
 * Supported multiple output formats and platforms  
[![x3d](https://img.shields.io/badge/3D-X3D-blue.svg)](http://www.web3d.org/x3d/what-x3d)
[![x3dom](https://img.shields.io/badge/3D-x3dom-blue.svg)](https://www.x3dom.org/)
[![aframe](https://img.shields.io/badge/3D-A--Frame-blue.svg)](https://aframe.io/)  
[![vive](https://img.shields.io/badge/VR-HTC_Vive-blue.svg)](https://www.vive.com/)
[![oculus](https://img.shields.io/badge/VR-Oculus_Rift-blue.svg)](https://www.oculus.com/rift/)

## How do I get set up? ###

Clone this repository and follow the instructions under [Installation & Setup](../../wiki/Installation-&-Setup).
Each subdirectory of this repository represents a standalone component of Getaviz. It contains a separate README.md with further instructions and documentation.

Please have a look at our Wiki which contains many additional information. However, documentation is still incomplete. Feel free to open an issue if you have any question!

Some Getaviz components are available as docker containers.  
[![UI](https://img.shields.io/badge/docker-ui-blue.svg)](https://hub.docker.com/r/getaviz/evaluationserver)
[![Evaluation Server](https://img.shields.io/badge/docker-evaluationserver-blue.svg)](https://hub.docker.com/r/getaviz/ui)

## Development Team

Getaviz is mainly developed by the research group [Visual Software Analytics](http://softvis.wifa.uni-leipzig.de) at Leipzig University. Currently, four main developers are contributung actively to Getaviz:
* [Richard Müller](https://github.com/rmllr)
* [Jan Schilbach](https://github.com/schilbach)
* [Pascal Kovacs](https://github.com/PascalKovacs)
* [David Baum](http://home.uni-leipzig.de/svis/Research%20Group/#DavidBaum)

Many thanks to all the contributors who have improved Getaviz by implementing new features or fixing bugs, especially: Denise Zilch, André Naumann, [Stefan Faulhaber](https://github.com/StefanFaulhaber), [Dan Häberlein](https://github.com/dhaeb),  [Lisa Vogelsberg](https://github.com/Valekta/), [Aaron Sillus](https://github.com/AaronSil)

## Publications
* David Baum, Jens Dietrich, Craig Anslow, Richard Müller: [Visualizing Design Erosion: How Big Balls of Mud are Made](https://arxiv.org/abs/1807.06136), IEEE VISSOFT, 2018.
* David Baum. Jan Schilbach, Pascal Kovacs, Ulrich Eisenecker, Richard Müller: [GETAVIZ: Generating Structural, Behavioral, and Evolutionary Views of Software Systems for Empirical Evaluation](https://www.researchgate.net/publication/320083290_GETAVIZ_Generating_Structural_Behavioral_and_Evolutionary_Views_of_Software_Systems_for_Empirical_Evaluation), IEEE VISSOFT, 2017.

A full list of publications you can find on [our website](http://home.uni-leipzig.de/svis/Publications/).
