const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./server/database/connection');
const session = require('express-session');
const collection = require('./server/model/model.js');
const attendance = require('./server/model/attendance.js');
const controller = require('./server/controller/controller');
const cookieParser = require("cookie-parser");



// const route =require('./server/routes/router')

const app = express();



dotenv.config({ path: 'config.env' });
const PORT = process.env.PORT || 3000;

// Log request
app.use(morgan('tiny'));

// Serve static files from the public directory
const publicDir = path.join(__dirname, './public');
app.use(express.static(publicDir));

// Connect to MongoDB
connectDB();

app.use(cookieParser());
// Set up session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Parse incoming requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine
app.set("view engine", "ejs");

// // Routes
// app.get('/', function(request, response) {
//   // Render login template
//   response.render('login');
// });

// // Admin page
// app.post("/Admin", (req, res) => {
//   res.render('Admin');
// });

// app.get("/AddTeachers", (req, res) => {
//   res.render('AddTeachers');
// });

// app.get("/AddStudent", (req, res) => {
//   res.render("AddStudent.ejs");
// });

// app.get("/TeacherDetale", (req, res) => {
//   res.render("TeacherDetale.ejs");
// });



// app.get("/AdStudent", (req, res) => {
//   res.render('AdStudent');
// });

// app.get("/StudentDetail6Sem", (req, res) => {
//   res.render("StudentDetail6Sem.ejs");
// });

// app.get('/PickClas', function(req, res) {
//   res.render('PickClas');
// });

// app.get('/shivanshDetalePage', function(req, res) {
//   res.render('shivanshDetalePage.ejs');
// });
app.use('/',require('./server/routes/router'))
// app.get("/AddStudent", (req, res) => {
//   res.render("AddStudent.ejs");
// });



// Authentication
app.post('/auth', function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
  
	// Ensure the input fields exist and are not empty
	if (username && password) {
	  // Add your custom logic to check the credentials against your data source (e.g., a user collection in MongoDB)
	  // Replace this code with the appropriate logic for your project
	  if (username === 'admin' && password === 'password') {
		// Authenticate the user
		request.session.loggedin = true;
		request.session.username = username;
		// Redirect to home page
		response.redirect('/home');
	  } else {
		response.status(401).send('Incorrect Username and/or Password!');
	  }
	} else {
	  response.status(400).send('Please enter Username and Password!');
	}
  });
  

// Home page
app.get("/", (req, res) => {
  if (req.session.loggedin) {
    // Output username
    // req.send('Welcome back, ' + request.session.username + '!');
    res.render('index');
  } else {
    // Not logged in
    res.render('login');
  }
  
  res.end();
});

app.get("/login", (req, res) => {
  res.render('login');
});

app.get("/AdAttendance", (req, res) => {
  if (req.session.loggedin) {
    // Output username
    // req.send('Welcome back, ' + request.session.username + '!');
    res.render('AdAttendance');
  } else {
    // Not logged in
    res.render('login');
  }
  
  res.end();
});


app.post("/", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.name });
    
    if (check && check.password == req.body.password) {
      req.session.loggedin = true;
      req.session.username = req.body.name;
      
      const data_res = await (function(err, result) {
        if (err) throw err;
        console.log(result);
        // db.close();
      });
      
      res.render('index', { name: req.session.username, data_res: data_res });
    } else {
      res.status(401).send("Invalid credentials: username or password is incorrect.");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error: " + err.message);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
