# node-user-authentication-boilerplate

### _A boilerplate for creating a node API server with user authentication. Includes email verification and json web tokens to authenticate protected routes._

The purpose of this boilerplate is for myself and others to quickly get started with a node API server with user authentication and other commonly used tools.


---

***Features:***
* Includes the all the benefits of [**node-api-sever-boilerplate**](https://github.com/chadpjontek/node-api-server-boilerplate)
* Common user authentication routes, controllers, and validation schemas are already setup and can be changed to your needs.
* User **email verification** and **password recovery** email functions are ready to be personalized.
* **Json Web Tokens** are used for authentication. Expiration times can be changed to your needs. Just add your own routes and protect them with the `tokenAuth` middleware

---

***How to use:***
* Create tests and put them in the `./tests` folder. Then run them with `npm test`.
* To run server in development mode, run `npm start`. Saved changes will result in webpack rebuilding the bundle and nodemon restarting the server.
* To create a production build, run `npm run build`. The output will be in the `/dist` folder.