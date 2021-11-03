import redis from 'redis';
import fetch from 'node-fetch';
import express from 'express';

const USER_NAME = 'username';
const PORT = 5000;
const REDIS_PORT = 6379;

const client = redis.createClient(REDIS_PORT);
const app = express();

function formatOutput(username, numOfRepos) {
  return `${username} has ${numOfRepos} repos`;
}

// Request data from github
async function getRepos(req, res) {
  try {
    const username = req.params[USER_NAME];

    const response = await fetch(`https://api.github.com/users/${username}`);

    const { public_repos } = await response.json();

    // Cache data to Redis
    client.setex(username, 20, public_repos);

    res.send(formatOutput(username, public_repos));
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}

// Cache middleware
function cache(req, res, next) {
  const username = req.params[USER_NAME];

  client.get(username, (err, data) => {
    if (err) throw err;

    if (data !== null) {
      console.log('This data is already cached');
      res.send(formatOutput(username, data));
    } else {
      console.log('This data is not cached');
      next();
    }
  });
}

app.get(`/repos/:${USER_NAME}`, cache, getRepos);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
