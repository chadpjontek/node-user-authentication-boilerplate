# node-api-server-boilerplate

### _A node API server boilerplate with linting, testing, and automation for development and production built in._

The purpose of this boilerplate is for myself and others to quickly get started with a node API server by including the common tools needed for development.


---

***Features:***
* **Npm-run-all** allows **webpack** to run in parallel with **nodemon**. This lets webpack watch for changes and rebuild the development bundle as nodemon then restarts the server with the new changes.
* **Eslint** is set to node,es8 and some personal styles. Feel free to changes these in `.eslintrc.json`.
* **webpack-karma-jasmine** is ready to use for testing.


---

***How to use:***
* Create tests and put them in the `./tests` folder. Then run them with `npm test`.
* To run server in development mode, run `npm start`. Saved changes will result in webpack rebuilding the bundle and nodemon restarting the server.
* To create a production build, run `npm run build`. The output will be in the `/dist` folder.