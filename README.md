# programmeren 4: Share-A-Meal

## Introduction

My name is Quincy van Deursen and i study computer science. For the course 'Programmeren 4', i was asked to build an API which uses a database on a live server from Heroku.
The link to that server is:
_https://shareameal-2113709.herokuapp.com/_

## Features & endpoints

Listed below are the features the API provides. Keep in mind that some of those features require a json web token which you can get by using the login feature (requires account).

##### users

- POST: Create users (/api/user/)
- GET: Get all users (/api/user/)
- PUT: Update user (/api/user/id)
- GET: Get Specific (/api/user/id)
- DELETE: Delete user (/api/user/id)

##### Meal

- POST: Create meal (/api/meal/)
- GET: Get all meals (/api/meal/)
- PUT: Update meal (/api/meal/id)
- GET: Get Specific meal (/api/meal/id)
- DELETE: Delete meal (/api/meal/id)

##### Login

- POST: Login (/api/auth/login)

##### Extra

- GET: Get all users (/api/user/), has search queries.
  -- it is possible to search for users by their firstName. (/api/user/?FirstName=name)
  -- it is possible to search for a certain amount of users (/api/user/?Length=3)
  -- it is possible to search for active users (/api/user/?IsActive=true)
  The search parameters can be combined.

## Packages/Libraries

Listed below are all the used Packages/libraries which are downloaded from npm.

- Dotenv
- Node.JS
- Express
- Mocha
- Chai
- MySQL2
- Chai-HTTP
- jsonwebtoken
- Tracer

## How to use the API?

- Download postman
- In postman:
  -- use the server url.
  -- Choose the correct http request.
  -- Provide a JSON object.
  -- Click send and read the response.
