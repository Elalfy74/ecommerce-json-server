const dotenv = require('dotenv');
dotenv.config();

const jwt = require('./jwt');

const jsonServer = require('json-server');

const server = jsonServer.create();

// Uncomment to allow write operations
const fs = require('fs');
const path = require('path');
const filePath = path.join('db.json');
const data = fs.readFileSync(filePath, 'utf-8');
const db = JSON.parse(data);
const router = jsonServer.router(db);

// Comment out to allow write operations
// const router = jsonServer.router('db.json');

const middlewares = jsonServer.defaults();

server.use(middlewares);

server.use(jsonServer.bodyParser);
server.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // No need to hash it's just for testing
  const user = db.users.find((user) => user.email === email && user.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const accessToken = jwt.generateToken({ id: user.id, email: user.email });

  return res.jsonp({
    accessToken,
    user: {
      name: user.firstName + ' ' + user.lastName,
      email: user.email,
      avatar: user.avatar,
    },
  });
});

// Add this before server.use(router)
server.use(
  jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id',
  })
);

server.use((req, res, next) => {
  if (jwt.isAuthenticated(req)) {
    next();
  } else {
    res.status(401).send({ message: 'Unauthorized' });
  }
});
server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});

// Export the Server API
module.exports = server;
