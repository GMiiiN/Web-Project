const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// 정적 파일 서빙을 위한 미들웨어 추가 (경로를 안전하게 처리)
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
    const loginPath = path.join(__dirname, '..', 'html', 'login.html');
    res.sendFile(loginPath, (err) => {
        if (err) {
            console.error('sendFile error:', err);
            return res.status(err.status || 500).send('login.html을 찾을 수 없습니다.');
        }
    });
});

const User = { id: 'admin', password: 'admin1234' };

app.post(['/login','/login/'], (req, res) => {
    console.log('login attempt body:', req.body); // 추가: 들어오는 폼 데이터 확인용 로그
    const {userid, userpw} = req.body || {};
    if (userid === User.id && userpw === User.password) {
        req.session.user = userid;
        res.send(`<h1>Login Successful</h1><p>Welcome, ${userid}!</p>`);
    } else {
        res.send('<h1>Login Failed</h1><p>Invalid username or password.</p>');
    }
})

const PORT = 3000;
app.listen(PORT, () => console.log(`Server Running at http://localhost:${PORT}`));