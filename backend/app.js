const express = require('express');
const app = express();
const httpLogger = require('morgan');
const cors = require('cors');
const port = 3000;
const userRouter = require('./userManagement/userController');
const cookieParser = require('cookie-parser');
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));
app.use(httpLogger('dev'));
app.use(express.urlencoded({ extended: false }))
app.use(express.json()) //we expect JSON data to be sent as payloads
app.use(userRouter);
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/data', (req, res) => {
  let { user } = req.body
  console.log('trying to post the following data: ', user)
  res.send('Succes')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});