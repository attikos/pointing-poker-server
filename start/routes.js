'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post('user', 'UserController.index')

Route
  .get('users/:id', 'UserController.show')
  .middleware('auth')

Route.post('login', 'UserController.login')
Route.post('logout', 'UserController.logout')
Route.post('register', 'UserController.register')
Route.post('check', 'UserController.check')

// API for planning pocker
Route.post('check-token', 'UserController.checkToken')
//

Route
    .post('post', 'GameController.post')
    .middleware('auth')

Route
    .post('list', 'GameController.list')
    .middleware('auth')
