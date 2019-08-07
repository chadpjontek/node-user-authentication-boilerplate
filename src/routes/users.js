const router = require('express-promise-router')();

const { validateBody, schemas, tokenAuth } = require('../helpers/routeHelpers');
const UsersController = require('../controllers/users');

// ================================================
// NON-PROTECTED ROUTES (no authorization required)
// ================================================
// GET REQUESTS
// ============

/**
 * GET /users/email-verification/:username/:code
 * email verification route
 * call verify controller
 */
router.route('/email-verification/:username/:code')
  .get(UsersController.verify);

/**
 * GET /users/password-recovery/:username/:code
 * password recovery route
 * call password recovery controller
 */
router.route('/password-recovery/:username/:code')
  .get(UsersController.validatePwRecovery);

// =============
// POST REQUESTS
// =============

/**
 * POST /users
 * user sign up route
 * validate user input before calling signUp controller
 */
router.route('/')
  .post(validateBody(schemas.signup), UsersController.signUp);

/**
 * POST /users/signin
 * user sign in route
 * validate user input before calling signIn controller
 */
router.route('/signin')
  .post(validateBody(schemas.signin), UsersController.signIn);

/**
 * POST /users/password-recovery
 * user password reset route
 * validate user input before calling passwordRecovery controller
 */
router.route('/password-recovery')
  .post(validateBody(schemas.passwordRecovery), UsersController.passwordRecovery);

/**
 * POST /users/setnewpassword
 * Set new password route
 * validate user input before calling setNewPassword controller
 */
router.route('/set-new-password')
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
router.route('/change-password')
  .post(validateBody(schemas.changePassword), tokenAuth(), UsersController.changePassword);


// Export the routes
module.exports = router;