const express = require("express");
const app = express();
const port = process.env.PORT || 4000;

let database = [];
let id = 0;
app.use(express.json());

//this function shows which function is called.
app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

//this function executes a GET call on the homepage.
app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Share a meal project, programmeren 4, Quincy van Deursen, 2113709",
  });
});

//this function executes a post call to create an user. The given email must be unique. The user is added to the database (array). UC-201.
app.post("/api/user", (req, res) => {
  let user = req.body;
  let email = user.emailAdress;
  let userArray = database.filter((item) => item.emailAdress == email);
  if (userArray.length > 0) {
    console.log(user);
    res.status(401).json({
      status: 401,
      result: "Email already in use",
    });
  } else {
    id++;
    user = {
      id,
      ...user,
    };
    database.push(user);
    res.status(201).json({
      status: 201,
      result: user,
    });
  }
});

//function to update an existing user. Email cant be duplicated. UC-205
app.put("/api/user/:userId", (req, res) => {
  //get the user for the given ID.
  let oldUserArray = database.filter((item) => item.id == req.params.userId);
  //if an user is found, create a user with the new req data to replace the old with the new user in the database
  if (oldUserArray.length > 0) {
    let oldUser = oldUserArray[0];
    let id = oldUser.id;
    let newUser = {
      id,
      ...req.body,
    };
    //filter to find emails addresses that match the (new) given emailaddress.
    let newEmail = req.body.emailAdress;
    let emails = database.filter(
      (item) => item.emailAdress.toLowerCase() == newEmail.toLowerCase()
    );
    //if the new email matches with one of the emails in the database. emails.length should be greather then 0.
    if (emails.length > 0) {
      // if the email matches with one of the other users emails, then an error is given.
      if (req.params.userId != emails[0].id) {
        res.status(400).json({
          Status: 400,
          Message: `${newEmail} is already in use`,
        });
        // if the id of the req user is the same as the id of the matching user, then it is allowed to update the email.
      } else {
        database.splice(database.indexOf(oldUser), 1, newUser);
        res.status(200).json({
          Status: 200,
          Message: `user with id ${oldUser.id} has been updated`,
        });
      }
      // if there isnt a match between the newUser email with old Users emails, it is allowed to update the user.
    } else {
      database.splice(database.indexOf(oldUser), 1, newUser);
      res.status(200).json({
        Status: 200,
        Message: `user with id ${oldUser.id} has been updated`,
      });
    }
    //if there is no user found for the given id, then give an error.
  } else {
    res.status(400).json({
      Status: 400,
      Message: `user with id ${oldUser.id} can not be found`,
    });
  }
});

//function to get the profile. UC-203
app.get("/api/user/profile", (req, res) => {
  res.status(401).json({
    status: 401,
    result: `End-point not created yet.`,
  });
});

//function to find an user by id. UC-204
app.get("/api/user/:userId", (req, res) => {
  const userId = req.params.userId;
  console.log(`User met ID ${userId} gezocht`);
  let userArray = database.filter((item) => item.id == userId);
  if (userArray.length > 0) {
    let user = userArray[0];
    console.log(user);
    res.status(200).json({
      status: 200,
      result: user,
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `User with ID ${userId} not found`,
    });
  }
});

//function to get all users in the database (array). UC-202
app.get("/api/user", (req, res) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

//function to delete a specific user.
app.delete("/api/user/:userId", (req, res) => {
  let user = req.params.userId;
  let userArray = database.filter((item) => item.id == user);
  if (userArray.length > 0) {
    let userToDelete = userArray[0];
    database.splice(database.indexOf(userToDelete), 1);
    console.log(userToDelete);
    res.status(200).json({
      status: 200,
      result: `User with id ${user} succesfully deleted`,
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `User with ID ${user} not found`,
    });
  }
});

//function to give an error when an end-point isnt found
app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
