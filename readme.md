# README

## Setup

1. Clone Git repository. 
2. Within repository install node package manager:

    `npm install`


3. Install dependent node modules with:

    `npm install node-modules`

## Commands

#### Development Server
    npm start
Starts a devlopment server and opens the browser with a copy of the project. Updates in real-time as changes made to the source code are saved.


#### Production Build
    npm run build
Builds a production version and places the compiled assets in a `dist` directory at the root of the project. CSS, JS, and HTML are minified. Build version can be tested by running a server with the `dist` directory. To do this, first install the server:

    npm install http-server -g
Start the server with:
    http-server
#### Deploy to Now
    npm run deploy:production
Builds a production version and places the compiled assets in a `dist` directory at the root of the project. The project will then be deployed to Now(now.sh). 

If you try to run it, it will likely ask you to log in or create an
account. This can be done at:
https://zeit.co/now

Once setup, this command will deploy the project to a URL like
https://dnaviewer.pendulum.now.sh/


## Project Organization

... TODO


## Webpack

... TODO









