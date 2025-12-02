// seed.js
const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();
// MySQL 연결 설정
const DB = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: +process.env.DB_PORT
});

// script.js에서 쓰던 상품 데이터 그대로 복사
const newArrivals = [ 
  { name: "반팔 티셔츠", price: 20000, imgUrl: "../product/white_T-shirt.jpg" },
  { name: "반바지", price: 35000, imgUrl: "../product/Short_pants.jpg" },
  { name: "운동화", price: 43000, imgUrl: "../product/Shoes.jpg" },
  { name: "후드티", price: 60000, imgUrl: "../product/Blue_Hood.jpg" }
];

const weeklyBest = [
  { name: "검정색 스웨터", price: 60000, imgUrl: "../product/Sweater.jpg" },
  { name: "검정색 모자", price: 35000, imgUrl: "../product/Black_cap.jpg" },
  { name: "흰색 셔츠", price: 30000, imgUrl: "../product/White_shirt.jpg" },
  { name: "와이드 청바지", price: 40000, imgUrl: "../product/Wide_pants.jpg" }
];

const bestSeller = [
  { name: "베스트셀러 자켓", price: 90000, imgUrl: "../product/best_jacket.jpg" },
  { name: "베스트셀러 셔츠", price: 30000, imgUrl: "../product/best_shirt.jpg" },
  { name: "베스트셀러 바지", price: 40000, imgUrl: "../product/best_pants.jpg" },
  { name: "베스트셀러 가방", price: 70000, imgUrl: "../product/best_bag.jpg" }
];

const products = [...newArrivals, ...weeklyBest, ...bestSeller];

// DB 연결
DB.connect(err => {
    if (err) {
        console.error("❌ DB 연결 실패:", err);
        return;
    }
    console.log("✅ DB 연결 성공");
});

// 상품 insert 함수
function insertProducts() {
    const sql = `
        INSERT INTO products (name, price, main_image)
        VALUES (?, ?, ?)
    `;

    products.forEach((p, idx) => {
        DB.query(sql, [p.name, p.price, p.imgUrl], (err) => {
            if (err) {
                // 이미 있는 상품이면 에러가 날 수 있으니 메시지 출력만
                console.log(`⚠️  상품 삽입 실패: ${p.name} — 이미 존재하거나 오류 발생`);
            } else {
                console.log(`✔️  상품 등록됨(${idx + 1}/${products.length}): ${p.name}`);
            }

            // 마지막 상품 처리 후 DB 연결 종료
            if (idx === products.length - 1) {
                console.log("🎉 모든 상품 등록 완료");
                DB.end();
            }
        });
    });
}

insertProducts();
