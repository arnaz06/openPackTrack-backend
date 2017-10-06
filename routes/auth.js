var express = require('express');
var router = express.Router();

let authController = require('../controllers/authController')

/* GET users listing. */

/**
  * @api {post} auth/register Registrasi
  * @apiGroup Auth
  * @apiParamExample {json} Request-Example:
  *     {
  *       "name" : "jhon doe",
  *       "username" : "jhondoe",
  *       "password" : "secret",
  *       "email" : "jhondoe@example.co.id",
  *       "identityNumber" : "113211019"
  *     }
  * @apiSuccess {Boolean} success true jika berhasil
  * @apiSuccess {string} status "OK" jika berhasil
  * @apiSuccess {Array} user array dari user
  * @apiParam {string} name nama pengguna
  * @apiParam {string} username username pengguna
  * @apiParam {string} password password pengguna
  * @apiParam {string} email email pengguna
  * @apiParam {string} identityNumber nomer induk pengguna
  * @apiSuccessExample {json} Success
  *     HTTP/1.1 200 OK
  *    {
  *      success: true,
  *      status: "OK"
  *      user:  {
  *         id: 12,
  *         name: 'jhon doe',
  *         email: 'jhondoe@example.co.id',
  *         username: 'jhon',
  *         identityNumber: '113211019',
  *         password: 'secret',
  *         updatedAt: 2017-09-26T09:22:56.631Z,
  *         createdAt: 2017-09-26T09:22:56.631Z
  *      }
  *    }
  * @apiErrorExample {json} Internal Server Error
  *     HTTP/1.1 500 Internal Server Error
  *     {
  *       success: false,
  *       status: "ERROR",
  *       user: null
  *      }

**/
router.post('/register', authController.register);
/**
  * @api {post} auth/login Login
  * @apiGroup Auth
  * @apiParamExample {json} Request-Example
  *     {
  *       "username" : "jhondoe",
  *       "password" : "secret"
  *     }
  * @apiParam {string} username username pengguna
  * @apiParam {string} password password pengguna
  * @apiSuccess {Boolean} success true jika berhasil
  * @apiSuccess {string} message pesan dari server
  * @apiSuccess {string} token token setelah berhasil login
  * @apiSuccessExample {json} Success
  *     HTTP/1.1 200 OK
  *    {
  *       success: true,
  *       message: 'Login success boskuh',
  *       token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVzSW5NaW51dGVzIjoxNDQwLCJpYXQiOjE1MDY0MTgwNzJ9.LKBsytXXmH_hu7Qa4w69v-ELojmjMmieViI2VDqUG8U'
  *    }
  * @apiErrorExample {json} Wrong password
  *     HTTP/1.1/ 200 OK
  *     {
  *       success: false,
  *       message: "Authentication failed. Wrong password."
  *     }
**/
router.post('/login',authController.login);

module.exports = router;
