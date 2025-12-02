const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');

const app = express();

// .env 로드
dotenv.config();

// MySQL 연결
const DB = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: +process.env.DB_PORT
});

// 미들웨어
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// 정적 파일 제공(html/css/js/img 등)
app.use(express.static(path.join(__dirname, '..')));

// DB 연결 테스트
DB.connect(err => {
    if (err) {
        console.error("❌ MySQL 연결 실패", err);
        return;
    }
    console.log("✅ MySQL 연결 성공");
});

// ------------------------------
// HTML 라우트
// ------------------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'login.html'));
});

app.get('/detail', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'detail.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'cart.html'));
});

app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'order.html'));
});

// ------------------------------
// 로그인 기능 (임시 버전)
// ------------------------------
const User = { id: 'admin', password: 'admin1234' };

app.post('/login', (req, res) => {
    const { userid, userpw } = req.body;

    if (userid === User.id && userpw === User.password) {
        req.session.user = userid;
        res.sendFile(path.join(__dirname, '..', 'html', 'index.html'));
    } else {
        res.send(`<h1>Login Failed</h1>`);
    }
});

// ------------------------------
// 📦 상품 API
// ------------------------------

// 상품 목록 불러오기
app.get('/api/products', (req, res) => {
    const sql = "SELECT * FROM products";

    DB.query(sql, (err, result) => {
        if (err) {
            console.error("상품 조회 실패:", err);
            return res.status(500).json({ error: "DB 오류" });
        }
        res.json(result);
    });
});

// 특정 상품 상세보기
app.get('/api/products/:id', (req, res) => {
    const sql = "SELECT * FROM products WHERE id = ?";
    DB.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: "DB 오류" });
        res.json(result[0]);
    });
});

// ------------------------------
// 🛒 장바구니 API
// ------------------------------

// 장바구니 담기
app.post('/api/cart', (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    const sql = `
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `;

    DB.query(sql, [user_id, product_id, quantity], (err, result) => {
        if (err) {
            console.error("장바구니 추가 실패:", err);
            return res.status(500).json({ error: "DB 오류" });
        }
        res.json({ message: "장바구니에 담았습니다." });
    });
});

// 장바구니 목록
app.get('/api/cart/:user_id', (req, res) => {
    const user_id = req.params.user_id;

    const sql = `
        SELECT 
            c.id AS cart_id,
            p.name AS product_name,
            p.price,
            p.main_image,
            c.quantity,
            (p.price * c.quantity) AS total
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `;

    DB.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error("장바구니 조회 실패:", err);
            return res.status(500).json({ error: "DB 오류" });
        }
        res.json(result);
    });
});

// 장바구니 삭제
app.delete('/api/cart/:cart_id', (req, res) => {
    const sql = "DELETE FROM cart_items WHERE id = ?";

    DB.query(sql, [req.params.cart_id], (err, result) => {
        if (err) {
            console.error("장바구니 삭제 실패:", err);
            return res.status(500).json({ error: "DB 오류" });
        }
        res.json({ message: "장바구니 삭제 완료" });
    });
});

// ------------------------------
// 💳 주문 API (기본 버전)
// ------------------------------
app.post('/api/order', (req, res) => {
    const { user_id, total_price } = req.body;

    const sql = `
        INSERT INTO orders (user_id, total_price)
        VALUES (?, ?)
    `;

    DB.query(sql, [user_id, total_price], (err, result) => {
        if (err) {
            console.error("주문 생성 실패:", err);
            return res.status(500).json({ error: "DB 오류" });
        }
        res.json({ message: "주문 완료" });
    });
});


// ------------------------------
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server Running at http://localhost:${PORT}`));

