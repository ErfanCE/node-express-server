const { join } = require('node:path');
const { writeFile } = require('fs/promises');
const express = require('express');

const users = require('./dbs/users.json');

const app = express();
const port = 8000;
const host = '127.0.0.1';

// serve static files
// http://localhost:8000/public/
app.use(express.static(join(__dirname, './public')));

// Form Request - body parser (stream => request.body)
// http://localhost:8000/login?username=erfan&password=erfan1234
app.use(express.urlencoded({ extended: true }));

// AJAX Request - body parser (stream => request.body)
// JSON.parse(request.body)
app.use(express.json());

// form request
app.get('/login-page', (request, response) => {
  response.status(200).sendFile(join(__dirname, './views/login.html'));
});

app.post('/login', (request, response) => {
  const { username = null, password = null } = request.body;

  if (!username?.trim() || !password?.trim()) {
    return response.status(400).json({
      status: 'fail',
      error: { message: 'username and password required.' }
    });
  }

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({
      status: 'fail',
      error: { messsage: 'user not found (username or password not match)' }
    });
  }

  if (user.password !== password) {
    return response.status(400).json({
      status: 'fail',
      error: { messsage: 'incorrect password (username or password not match)' }
    });
  }

  response.status(200).json({
    status: 'ok',
    data: { user }
  });
});

// ajax request
app.get('/signup-page', (request, response) => {
  response.status(200).sendFile(join(__dirname, './views/signup.html'));
});

app.post('/signup', async (request, response) => {
  try {
    const data = request.body;

    // TODO: validation
    const user = users.find((user) => user.username === data.username);

    if (!!user) {
      return response.status(400).json({
        status: 'fail',
        error: { message: 'duplicated username' }
      });
    }

    // add new user
    users.push(user);
    await writeFile(join(__dirname, 'dbs/users.json'), JSON.stringify(users));

    response.status(201).json({
      status: 'ok',
      data: { user }
    });
  } catch (err) {
    response.status(500).json({
      status: 'error',
      error: { message: 'internal server error' }
    });
  }
});

// 404: not found
app.all('*', (request, response) => {
  response.status(404).json({
    status: 'fail',
    error: { message: 'not found' }
  });
});

app.listen(port, host, () => {
  console.info(`Listening on ${host}:${port} ...`);
});
