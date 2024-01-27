var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
var session = require('express-session');
const port = 3000



app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private , must-revalidate,no-store');
    next();
});

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'node'
});

conn.connect(function () {
    console.log("Connected to MySQL database");
});

app.set('view engine', 'ejs');



app.get('/', function (req, res) {
    console.log('Inside / route'); // Add closing parenthesis here
    res.render('signup.ejs');
});

app.post('/signup', function (req, res) {
    console.log('Inside /signup POST route');
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    console.log('Received data:', name, email, password);

    var sql = `INSERT INTO users (user_name, user_email, user_password) VALUES ('${name}','${email}', '${password}')`;

    conn.query(sql, function (result) {
        res.send("user successfull register");
    });
});

app.get('/login', function (req, res) {
    console.log('Inside /login route');
    res.render('login.ejs');
});


app.post('/login', async function (req, res) {
    console.log('Inside /login POST route');
    var email = req.body.email;
    var password = req.body.password;

    console.log('Received login data:', email, password);

    if (email && password) {
        try {
            if (conn.state !== 'authenticated') {
                console.error('Error: MySQL connection is not open');
                res.send('An unexpected error occurred.');
                return;
            }
            const sql = 'SELECT * FROM users WHERE user_email == ${email} AND user_password == ${password}';
            conn.query(sql, [email , password], async (err, result) => {
                if (err) {
                    console.error('Error during authentication:', err);
                    res.send('An unexpected error occurred.');
                    return;
                }
                if (result.length > 0) {
                        req.session.loggedin = true;
                        req.session.email = email;
                        res.redirect('/welcome');
                    } else {
                        res.send('Incorrect password.');
                    }
                res.end;
            });
        } catch (error) {
            console.error('Error during authentication:', error);
            res.send('An unexpected error occurred.');
        }
    } else {
        res.send('Please enter both email and password.');
    }
});
conn.on('error', function(err) {
    console.error('Error connecting to MySQL:', err.stack);
  });
app.get('/welcome', function (req, res) {
    console.log('Inside /welcome route');

    if (req.session.loggedin) {
        res.render('welcome.ejs', { user: `${req.session.email}` });
    } else {
        res.send('please login first');
    }
});

app.get('/logout', function (req, res) {
    console.log('Inside /logout route');
    req.session.destroy((err) => {
        res.redirect('/login');
    });
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })