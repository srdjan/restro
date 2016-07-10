RESTRO POC (alpha)
==========================

Minimalistic, experimatal RESTfull API framework

[Screencast](https://dl.dropboxusercontent.com/u/51491957/rest-api/v.html)

[List of forks] (https://github.com/srdjan/restro/network/members)

To run the example:
- clone git repo: 
   git clone https://github.com/Srdjan/restro.git

- goto restro folder
    cd restro

- run
    npm install
    npm buidl

- run build script
    build // on windows
    ./build.sh // on linux/OSX

- navigate to ./examples/apple-farm

- run: node app.js

- in the browser, open: localhost:8080/
- in the 'Explorer' entry field type: /api/apples, and follow the links

JSON format for 'Create':
    {
      "weight": 10,
      "color": "red"
    }

JSON format for 'Grow':
    {
      "weightIncr": 120,
    }

...
