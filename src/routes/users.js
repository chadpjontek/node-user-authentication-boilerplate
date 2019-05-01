const router = require('express-promise-router')();

const { validateBody, schemas, tokenAuth, userAuth } = require('../helpers/routeHelpers');
const UsersController = require('../controllers/users');

// ================================================
// NON-PROTECTED ROUTES (no authorization required)
// ================================================
// GET REQUESTS
// ============

/**
 * GET /users/verify/:username/:code
 * email verification route
 * call verify controller
 */
router.route('/verify/:username/:code')
  .get(UsersController.verify);

/**
 * GET /users/passwordRecovery/:username/:code
 * password recovery route
 * call password recovery controller
 */
router.route('/passwordrecovery/:username/:code')
  .get(UsersController.passwordRecovery);

// =============
// POST REQUESTS
// =============

/**
 * POST /users/signup
 * user sign up route
 * validate user input before calling signUp controller
 */
router.route('/signup')
  .post(validateBody(schemas.signup), UsersController.signUp);

/**
 * POST /users/signin
 * user sign in route
 * validate user input before calling signIn controller
 */
router.route('/signin')
  .post(validateBody(schemas.signin), UsersController.signIn);

/**
 * POST /users/forgotpassword/:email
 * user password reset route
 * validate user input before calling forgotPassword controller
 */
router.route('/forgotpassword')
  .post(validateBody(schemas.forgotPassword), UsersController.forgotPassword);

/**
 * POST /users/setnewpassword
 * Set new password route
 * validate user input before calling setNewPassword controller
 */
router.route('/setnewpassword')
  .post(validateBody(schemas.setNewPassword), UsersController.setNewPassword);


// ============================================================
// PROTECTED ROUTES (requires user authorization before access)
// ============================================================
// GET REQUESTS
// ============

/**
 * GET /users/account
 * user account route
 * authorize user before calling account controller
 */
router.route('/account')
  .get(tokenAuth(), UsersController.account);

// =============
// POST REQUESTS
// =============

/**
 * POST /users/changepassword
 * change password route
 * validate user input and authorize user before calling changePassword controller
 */
router.route('/changepassword')
  .post(validateBody(schemas.changePassword), tokenAuth(), UsersController.changePassword);


// Export the routes
module.exports = router;