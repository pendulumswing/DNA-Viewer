# README

## Setup

1. Clone Git repository. 
2. Within repository install node package manager:

    `npm install`


3. Install dependent node modules with:

    `npm install node-modules`

4. Install node server. The `-g` flag will install it globally, so that it can be run from the command line:
    
    `npm install http-server -g`

    Start the server with:

    `http-server`

### Development Server
    npm start
Starts a devlopment server and opens the browser with a copy of the project. Updates in real-time as changes made to the source code are saved.


### Production Build
    npm run build
Builds a production version and places the compiled assets in a **`dist`** directory at the root of the project. CSS, JS, and HTML are minified. Will also start a server and open a browser to view the new build.

At any time the build version can be tested by running a server within the **`dist`** directory. Type the following from within the **`dist`** directory:

    http-server -o

### Deploy to Now
    npm run deploy:production
Builds a production version and places the compiled assets in a **`dist`** directory at the root of the project. The project will then be deployed to Now(now.sh). 

If you try to run it, it will likely ask you to log in or create an
account. This can be done at:
https://zeit.co/now

Once setup, this command will deploy the project to a URL like
https://dnaviewer.pendulum.now.sh/


## Project Organization

    PROJECT
    ┃   README.md
    ┃   package.json
    ┃   package-lock.json
    ┃   webpack.common.js
    ┃   webpack.dev.js
    ┃   webpack.prod.js
    ┃   postcss.config.js
    ┃   now.json
    ┣━ + src
    ┃   ┃  index.html
    ┃   ┃  index.js
    ┃   ┃  vendor.js
    ┃   ┣━ + app
    ┃   ┃   ┃   main.js
    ┃   ┃   ┣━ + build
    ┃   ┃   ┣━ + classes
    ┃   ┃   ┣━ + constants
    ┃   ┃   ┣━ + controls
    ┃   ┃   ┣━ + libs
    ┃   ┃   ┗━ + utils
    ┃   ┗━ + assets
    ┃        ┃   main.js
    ┃        ┣━ + css
    ┃        ┗━ + images
    ┣━ + dist                   <-- Not part of Repo
    ┗━ + node-modules           <-- Not part of Repo

### project root
Node package, Webpack, and Now config files are in the project root. These will dictate how the project is assembled using various commands in the format of:

    npm run <commandName>

### src/
All development source code and assets are contained in the **`src`** directory. The root of this directory contains the entry point for all development scripts (**`index.js`**), as well as the template for the HTML entry point (**`index.html`**). The **`vendor.js`** file is an entry point for scripts that are changed less frequently during development. These are often dependencies like, for example, bootstrap.js. By separating the scripts into two groups (one that is changed often and one that is rarely changed), load resources can be split and will not require `vendor.js` to be fetched if no changes are made.

### app/
The app directory contains the source code for the application. While **`index.js`** is the entry point for webpack, **`main.js`** is generally the entry point for the program to begin. In other words, **`index.js`** will include import statements as needed for css, other Javascript files, and **`main.js`**. However, **`main.js`** will actually begin the program and call on other scripts. 

### assets/
The assets directory contains assets for the application, which may include images, favicons, css, video, etc.

### dist/
The **`dist`** directory is created whenever the project is built for production:

    npm run build:production

or simply:

    npm run build

The build will require a web server at: **`localhost:8080`** to function properly. If the node http-server has been installed (see above) simply switch to the **`dist`** directory and type:

    http-server -o

### node-modules/
This directory contains all the dependencies for the project, installed by the node package manager with:

    npm install


## Webpack

This project uses Webpack to consolidate scripts, css, and other dependecies into optimized versions for production or development. The webpack config files in the project root control the behavior of this process. During development, webpack will start a server and open a page to the project. It will then update the browser in real time as changes are saved to the source code. It will also aid in cache-busting by using a unique content hash for each file it generates. During production webpack will pack all dependencies of a type (for example Javascript) into a single file and minify it. It will create a **`dist`** directory with all the necessary assets built to production specifications. It can even deploy the production build to a remote server; in its current state it will deploy to **Now** (https://zeit.co/now)

### config files
There are essentially two webpack configs:

**`webpack.dev.js`** - for development   
**`webpack.prod.js`** - for production

Both of these files share common code from a third config file:

**`webpack.common.js`**

### commands
Webpack functionality is called through node package manager (npm) and is configured in the **`package.json`** file, also in the project root. This file contains the various commands to call the webpack config scripts from the terminal, along with other support functionality (such as starting the dev server). To see which commands are available, or to add or edit new commands, review this file's **`"scripts": {}`** object. Commands are called in the following format:

    npm run <commandName>

### config layout

Webpack config files are written in Javascript with dependencies at the top in the following format:

    const path = require("path");

The body of the code is contained in a **`module.exports`** object:

    module.exports = {
        ...
    }

Key parameter objects within **`module.exports`**:

| Key           | Description                                                             |
|---------------|-------------------------------------------------------------------------|
| entry:        | The javascript file that will serve as the index to all other JS files. |
| output:       | The target output filename and path, as well as other variables.        |
| mode:         | i.e. production or development                                          |
| optimization: | Settings for minimizing and optimizing file packing                     |
| module:       | Contains the methods to load different file types (loaders)             |
| plugin:       | Plugins used to extend functionality of webpack                         |

### entry:       
TODO
### output:      
TODO
### mode:        
TODO
### optimization:
TODO
### module:      
TODO
### plugin:      
TODO













