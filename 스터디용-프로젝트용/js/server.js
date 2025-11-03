const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// 정적 파일 서빙을 위한 미들웨어 추가
app.use(express.static(__dirname + '/../'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../html/login.html');
});

const User = { id: "admin", password: "admin1234" };

app.post('/login', (req, res) => {
    const {userid, userpw} = req.body;
    if (userid === User.id && userpw === User.password) {
        req.session.user = userid;
        res.send(`<h1>Login Successful</h1><p>Welcome, ${userid}!</p>`);
    } else {
        res.send('<h1>Login Failed</h1><p>Invalid username or password.</p>');
    }
})

const PORT = 3000;
app.listen(PORT, () => console.log(`Server Running at http://localhost:${PORT}`));