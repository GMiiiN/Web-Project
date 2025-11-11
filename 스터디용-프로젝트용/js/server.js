const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');

// express app 생성
const app = express();

// .env 파일의 환경변수 로드
dotenv.config(); // .env 파일을 읽어 아래의 MYSQL 연결설정을 가능하게함.

// MYSQL 연결 설정
const DB = mysql.createConnection({
    host: process.env.DB_HOST, // 127.0.0.1 같은 DB서버 주소
    user: process.env.DB_USER, // DB 로그인 아이디
    password: process.env.DB_PASSWORD, // DB 로그인 비밀번호
    database: process.env.DB_NAME, //사용할 데이터베이스 이름
    port: +process.env.DB_PORT // DB 포트 번호 + 는 문자열을 숫자로 변환
});
app.use(express.json()); // 요청 본문이 JSON이면 자동으로 JS 객체로 파싱해 req.body에 넣음
app.use(cors()); // CORS 허용 / 브라우저 교차 출처 정책 때문에 막히는걸 허용해줌.
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));
// 정적 파일 서빙을 위한 미들웨어 추가 (경로를 안전하게 처리)
app.use(express.static(path.join(__dirname, '..')));

//DB 연결 테스트
DB.connect(err => {
    if(err){
        console.error("MySQL 연결 실패", err); //
        return;
    }
    console.log("MySQL 연결 성공"); // 성공시
})

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'html',  'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('sendFile error:', err);
            return res.status(err.status || 500).send('login.html을 찾을 수 없습니다.');
        }
    });
});

const User = { id: 'admin', password: 'admin1234' }; // user id

app.get(['/login', '/login/'], (req, res) => {
    const loginPath = path.join(__dirname, '..', 'html', 'login.html');
    res.sendFile(loginPath, err => {
        if(err) {
            console.error('sendFile Error', err);
            return res.status(err.status || 500).send('login 페이지를 찾을 수 없습니다.');
        }
    });
});

app.post(['/login','/login/'], (req, res) => { // 로그인 페이지
    console.log('login attempt body:', req.body); // 추가: 들어오는 폼 데이터 확인용 로그
    const {userid, userpw} = req.body || {};
    if (userid === User.id && userpw === User.password) {
        req.session.user = userid;
        res.sendFile(path.join(__dirname, '..', 'html', 'index.html'));
    } else {
        res.send('<h1>Login Failed</h1><p>Invalid username or password.</p>');
    }
})

app.get(['/detail', '/detail/'], (req, res) => {
    const detailPath = path.join(__dirname, '..', 'html', 'detail.html');
    res.sendFile(detailPath, err => {
        if(err) {
            console.error('sendFile Error', err);
            return res.status(err.status || 500).send('상품 페이지를 찾을 수 없습니다.');
        }
    });
});

app.get(['/cart', '/cart/'], (req, res) => { // 장바구니 페이지
    const cartPath = path.join(__dirname, '..', 'html', 'cart.html');
    res.sendFile(cartPath, err => {
        if (err) {
            console.error('sendFile Error', err);
            return res.status(err.status || 500).send('cart 페이지를 찾을 수 없습니다.');
        }
    });
});

app.get(['/order', '/order/'], (req, res) => { // 주문 페이지
    const cartPath = path.join(__dirname, '..', 'html', 'order.html');
    res.sendFile(cartPath, err => {
        if (err) {
            console.error('sendFile Error', err);
            return res.status(err.status || 500).send('order 페이지를 찾을 수 없습니다.');
        }
    });
});

app.post(['/order', '/order/'], (req, res) => {
    console.log('order attempt body:'. req.body);
})

const PORT = 3000;
app.listen(PORT, () => console.log(`Server Running at http://localhost:${PORT}`));