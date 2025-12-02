const express = require('express');
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
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    next();
};

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
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'search.html'));
});

// 로그인 기능
app.post('/login', (req, res) => {
    const { userid, userpw } = req.body;

    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    DB.query(sql, [userid, userpw], (err, rows) => {
        if (err) {
            console.error("로그인 조회 실패:", err);
            return res.status(500).send("DB 오류");
        }
        if (rows.length === 0) {
            return res.send(`<h1>Login Failed</h1><p>ID 또는 PW가 잘못되었습니다.</p>`);
        }
        // 로그인 성공
        req.session.user = {
            id: rows[0].id,
            username: rows[0].username
        };
        console.log("로그인 성공:", req.session.user);
        res.redirect('/');  // 로그인 성공시 홈으로 이동
    });
});
//로그인 상태 확인
app.get('/api/me', (req, res) => {
    if(!req.session.user){
        return res.status(401).json({loggedIn: false});
    }
    res.json({loggedIn: true, user: req.session.user});
});
// 로그아웃 기능
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
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
// 상품 검색 API
app.get('/api/search', (req, res) => {
    const keyword = req.query.keyword;
    if(!keyword || keyword.trim() === ''){
        return res.json([]); // 검색어 없으면 빈 배열 반환
    }

    const sql = `
        SELECT id, name, price, main_image
        FROM products
        WHERE name LIKE ?
    `;

    DB.query(sql, [`%${keyword}%`], (err, result) => {
        if (err) {
            console.error("검색 실패:", err);
            return res.status(500).json({ error: "DB 오류" });
        }
        res.json(result);
    });
});


// 장바구니 API

// 장바구니 담기
app.post('/api/cart', requireLogin, (req, res) => {
    const { product_id, quantity } = req.body;
    const userId = req.session.user.id;

    if (!product_id || !quantity) {
        return res.status(400).json({ error: '상품 정보가 올바르지 않습니다.' });
    }

    const sql = `
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `;

    DB.query(sql, [userId, product_id, quantity], (err) => {
        if (err) {
            console.error("장바구니 추가 실패:", err);
            return res.status(500).json({ error: "DB 오류" });
        }
        res.json({ message: "장바구니에 담았습니다." });
    });
});

// 장바구니 목록
app.get('/api/cart', requireLogin, (req, res) => {
    const userId = req.session.user.id;

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

    DB.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("장바구니 조회 실패:", err);
            return res.status(500).json({ error: "DB 오류" });
        }
        res.json(result);
    });
});

// 장바구니 삭제
app.delete('/api/cart/:cart_id', requireLogin, (req, res) => {
    const userId = req.session.user.id;
    const sql = "DELETE FROM cart_items WHERE id = ? AND user_id = ?";

    DB.query(sql, [req.params.cart_id, userId], (err, result) => {
        if (err) {
            console.error("장바구니 삭제 실패:", err);
            return res.status(500).json({ error: "DB 오류" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "삭제할 항목이 없습니다." });
        }
        res.json({ message: "장바구니 삭제 완료" });
    });
});

// ------------------------------
// 💳 주문 API (기본 버전)
// ------------------------------
app.post('/api/order', requireLogin, (req, res) => {
    const { total_price } = req.body;
    const userId = req.session.user.id;

    if (typeof total_price !== 'number') {
        return res.status(400).json({ error: '결제 금액이 올바르지 않습니다.' });
    }

    const sql = `
        INSERT INTO orders (user_id, total_price)
        VALUES (?, ?)
    `;

    DB.query(sql, [userId, total_price], (err) => {
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

