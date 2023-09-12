const mongosee = require('mongoose');
const dotenv = require('dotenv');
process.on('uncaughtException', (err) => {
  console.log(err);
  console.log('shutting down....');
  process.exit(1);
});
const app = require('./app');
dotenv.config({ path: './confing.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongosee
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('db connection successful');
  });

const port = 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

//test

process.on('unhandledRejection', (err) => {
  console.log(err.message, err.name);
  console.log('shutting down....');
  server.close(() => {
    process.exit(1);
  });
});
