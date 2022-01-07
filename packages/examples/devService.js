const server = require('server');
const { get, post } = server.router;
const { render } = server.reply;

// Launch server with options and a couple of routes
server({ port: 8080 }, [
  get('/', ctx => render('./lib/index.html')),
  post('/', ctx => {
    console.log(ctx.data);
    return 'ok';
  })
]);