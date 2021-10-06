const Ws = use('Ws');

/*
|--------------------------------------------------------------------------
| Global middleware
|--------------------------------------------------------------------------
|
| Global middleware are executed on each Websocket channel subscription.
|
*/
const globalMiddleware = [
    'Adonis/Middleware/Session',
    'App/Middleware/CustomAuth',
];

/*
|--------------------------------------------------------------------------
| Named middleware
|--------------------------------------------------------------------------
|
| Named middleware are defined as key/value pairs. Later you can use the
| keys to run selected middleware on a given channel.
|
| // define
| {
|   auth: 'Adonis/Middleware/Auth'
| }
|
| // use
| Ws.channel('pocker', 'GameController').middleware(['auth'])
*/
const namedMiddleware = {
    // auth: 'Adonis/Middleware/Auth',
    // auth: 'App/Middleware/CustomAuth',
    guest: 'Adonis/Middleware/AllowGuestOnly',
};

Ws
    .registerGlobal(globalMiddleware)
    .registerNamed(namedMiddleware);
