import { Client } from './db/database.js';
import { error } from 'console';
import express from 'express';
import { nanoid } from 'nanoid';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();
const port = 3000;

// Случайная строка, задающая подпись
const ACCESS_SECRET = "access_secret";
const ACCESS_EXPIRES_IN = "15m";

const REFRESH_SECRET = "refresh_secret";
const REFRESH_EXPIRES_IN = "7d";


// { id, email, first_name, last_name, password, role }
let users = [];

let products = [
    { id: nanoid(6), name: 'Несквик', price: 150, category: "Еда", description: 'Несквик прекрасно сочетается с таким товаром как Пи... Молоком. Хорошо сочетается с Молоком.', imgURL: 'https://i.pinimg.com/736x/ac/6b/d1/ac6bd12328661b8b1c06a8e9efe52d91.jpg' },
    { id: nanoid(6), name: 'Молоко', price: 80, category: "Еда", description: 'Представляем молоко, которое понимает твою душевную организацию. Такое же белое, как твоя новая водолазка, и такое же нежное, как твой внутренний мир.', imgURL: 'https://main-cdn.sbermegamarket.ru/mid9/hlr-system/-22/017/268/162/712/17/100032481426b0.jpg' },
    { id: nanoid(6), name: 'Сырок', price: 50, category: "Еда", description: 'Вкусный, мягкий, сладкий, ммм... Остался лишь в воспоминаниях.', imgURL: 'https://tsx.x5static.net/i/800x800-fit/xdelivery/files/f2/2b/412196a4946040aa45fe57a46779.jpg' },
]


// Middleware для парсинга JSON
app.use(express.json());

// Логирование
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

// Разрешение политики CORS
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
}));


function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";

    // Ожидаем формат: Bearer <token>
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "Missing or invalid Authorization header",
        });
    }

    try {
        // расшифровывает токен в данные
        const payload = jwt.verify(token, ACCESS_SECRET);

        // сохраняем данные токена в req
        req.user = payload; // { sub, email, iat, exp }

        next();
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token",
        });
    }
}

// Role middleware 
function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Forbidden",
            });
        }
        next();
    };
}

// Либо возвращает товар по id, либо выдаёт 404 и возвращает null
function findProductOr404(id, res) {
    const product = products.find(p => p.id == id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product
}

// Либо возвращает пользователя по email, либо выдаёт 404 и возвращает null
function findUserOr404(email, res) {
    const user = users.find(u => u.email == email);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return null;
    }
    return user;
}

// функции хэширования пароля и проверки соостветсвенно
async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}
async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}


function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
        },
        ACCESS_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN,
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN,
        }
    );
}

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API управления товарами',
            version: '1.0.0',
            description: 'Простое API для управления товарами',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
    },
    // Путь к файлам, в которых мы будем писать JSDoc-комментарии (наш текущий файл)
    apis: ['./src/api/API.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
// Подключаем Swagger UI по адресу /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


/**
* @swagger
* components:
*   schemas:
*     Product:
*       type: object
*       required:
*         - name
*         - price
*         - category
*         - description
*         - imgURL
*       proerties:
*         id:
*           type: string
*           description: Автоматически сгенерированный уникальный ID товара
*         name:
*           type: string
*           description: Имя товара
*         price:
*           type: integer
*           description: Цена пользователя
*         category:
*           type: string
*           description: Категория товара
*         description:
*           type: string
*           description: Описание товара
*         imgURL:
*           type: string
*           description: Ссылка на изображение товара
*       example:
*           id: "abc123"
*           name: "Несквик"
*           price: 50
*           category: "Еда"
*           description: "Опсиание товара"
*           imgURL: "https://example.com/dasslow.jpg"
*     User:
*       type: object
*       required:
*         - id
*         - email
*         - first_name
*         - last_name
*         - password
*       proerties:
*         id:
*           type: string
*           description: Автоматически сгенерированный уникальный ID товара
*         email:
*           type: string
*           description: Электронная почта пользователя
*         first_name:
*           type: string
*           description: Имя пользователя
*         last_name:
*           type: string
*           description: Фамилия пользователя
*         password:
*           type: string
*           description: Пароль пользователя
*       example:
*           id: "abcd12345"
*           email: "example@mail.com"
*           first_name: "Александр"
*           last_name: "Македонский"
*           password: "password"
*/

// Главная страница
app.get('/', (req, res) => {
    res.send('Главная страница');
});


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Создаёт нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *              - email
 *              - first_name
 *              - last_name
 *              - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Электронная почта
 *                 example: "example@mail.com"
 *               first_name:
 *                 type: string
 *                 description: Имя пользователя
 *                 example: "Александр"
 *               last_name:
 *                 type: string
 *                 description: Фамилия пользователя
 *                 example: "Македонский"
 *               password:
 *                 type: string
 *                 description: Пароль
 *                 example: "password"
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Некорректные данные
 */
// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
    const { email, first_name, last_name, password, role } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({
            error: "email, first_name, last_name, password are required"
        });
    }

    const exists = users.some((u) => u.email === email);
    if (exists) {
        return res.status(409).json({
            error: "user with this email already exists",
        });
    }

    const newUser = {
        id: nanoid(9),
        email: email.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        password: await hashPassword(password),
        role: role || "user"
    };

    try {
        const query = `
        INSERT INTO users (id, email, first_name, last_name, password, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
        `;
        const values = [newUser.id, newUser.email, newUser.first_name, newUser.last_name, newUser.password, newUser.role];

        const result = await Client.query(query, values);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            erroe: "DB couldn't proceed yout request"
        });
        return;
    }


    users.push(newUser);

    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
    });
});


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *              - email
 *              - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Электронная почта
 *                 example: "example@mail.com"
 *               password:
 *                 type: string
 *                 description: Пароль
 *                 example: "password"
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учётные данные
 *       404:
 *         description: Польователь не найден
 */
// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: "email and password are required"
        });
    }

    const user = findUserOr404(email, res);
    if (!user) return;

    isAuthentethicated = await verifyPassword(password, user.password);
    if (!isAuthentethicated) {
        return res.status(401).json({
            error: "Invalid credentials"
        })
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);


    res.json({
        accessToken,
        refreshToken,
    })
});

// GET /api/auth/me
app.get("/api/auth/me", authMiddleware, roleMiddleware(["user"]), (req, res) => {
    const userEmail = req.user.email;

    const user = findUserOr404(userEmail, res);
    if (!user) return;

    res.json({
        id: user.id,
        email: user.email,
    });
});

// POST /api/auth/refresh
app.post("/api/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            error: "refreshToken is required",
        });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = findUserOr404(payload.email, res);
        if (!user) return;

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired refresh token",
        });
    }
});

// GET /api/users
app.get('/api/users', authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    res.json(users);
});

// GET /api/users/:id
app.get('/api/users/:id', authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    const user = users.find((u) => u.id === req.params.id);
    if (!user) {
        return res.status(401).json({
            error: "User not found",
        });
    }
    res.json(user);
});

// PATCH /api/users/:id
app.patch('/api/users/:id', authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    const id = req.params.id;

    const user = users.find((u) => u.id === req.params.id);
    if (!user) {
        return res.status(401).json({
            error: "User not found",
        });
    }

    if (req.body?.email === undefined) {
        return res.status(400).json({
            error: "Nothing to update",
        }); // 400 (Bad Request)
    }

    const { name, price, category, description, imgURL } = req.body;

    if (email !== undefined) user.email = email.trim();
    if (first_name !== undefined) user.first_name = first_name.trim();
    if (last_name !== undefined) user.last_name = last_name.trim();
    if (password !== undefined) user.password = hashPassword(password.trim());
    if (role !== undefined) user.role = role.trim();

    res.json(product);
});

// DELETE /api/users/:id
app.delete('/api/users/:id', authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    const id = req.params.id;
    const exists = users.some((u) => u.id === id);
    if (!exists) return res.status(404).json({ error: "Product not found" });

    users = users.filter((u) => u.id !== id);

    res.status(204).send(); // 204 (No Content) 
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создаёт новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *               - description
 *               - imgURL
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название товара
 *                 example: "Ноутбук"
 *               price:
 *                 type: number
 *                 description: Цена товара
 *                 example: 999.99
 *               category:
 *                 type: string
 *                 description: Категория товара
 *                 example: "Электроника"
 *               description:
 *                 type: string
 *                 description: Описание товара
 *                 example: "Мощный игровой ноутбук"
 *               imgURL:
 *                 type: string
 *                 description: Ссылка на изображение товара
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Уникальный идентификатор товара (6 символов)
 *                   example: "abc123"
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 category:
 *                   type: string
 *                 description:
 *                   type: string
 *                 imgURL:
 *                   type: string
 */
// POST /api/products
app.post('/api/products', authMiddleware, roleMiddleware(["seller"]), (req, res) => {
    const { name, price, category, description, imgURL } = req.body;

    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        description: description.trim(),
        imgURL: imgURL.trim()
    };

    products.push(newProduct);
    res.status(201).json(newProduct); // 201 (Created)
});


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Возвращает список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
// GET /api/products
app.get('/api/products', authMiddleware, roleMiddleware(["user"]), (req, res) => {
    res.json(products);
});


/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получает товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
// GET /api/products/:id
app.get('/api/products/:id', authMiddleware, roleMiddleware(["user"]), (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    res.json(product);
});


/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновляет данные товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Новое название товара
 *               price:
 *                 type: number
 *                 description: Новая цена товара
 *               category:
 *                 type: string
 *                 description: Новая категория товара
 *               description:
 *                 type: string
 *                 description: Новое описание товара
 *               imgURL:
 *                 type: string
 *                 description: Новая ссылка на изображение
 *     responses:
 *       200:
 *         description: Обновленный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Товар не найден
 */
// PATCH /api/products/:id
app.patch('/api/products/:id', authMiddleware, roleMiddleware(["seller"]), (req, res) => {
    const id = req.params.id;

    const product = findProductOr404(id, res);
    if (!product) return;

    if (req.body?.name === undefined && req.body?.price === undefined) {
        return res.status(400).json({
            error: "Nothing to update",
        }); // 400 (Bad Request)
    }

    const { name, price, category, description, imgURL } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (imgURL !== undefined) product.imgURL = imgURL.trim();

    res.json(product);
});


/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаляет товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удален (нет тела ответа)
 *       404:
 *         description: Товар не найден
 */
// DELETE /api/products/:id
app.delete('/api/products/:id', authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    const id = req.params.id;
    const exists = products.some((u) => u.id === id);
    if (!exists) return res.status(404).json({ error: "Product not found" });

    products = products.filter((u) => u.id !== id);

    res.status(204).send(); // 204 (No Content) 
});



// 404 для всех остальных маршрутов
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

//
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" }) //  500 (Internal Server Error)
});


// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});