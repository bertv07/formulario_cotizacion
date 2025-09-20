// --- IMPORTACIÓN DE MÓDULOS ---
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

// --- CONFIGURACIÓN INICIAL ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURACIÓN DE LA BASE DE DATOS ---
const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'formulario_cotizaciones',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(session({
    secret: process.env.SESSION_SECRET || 'un_secreto_por_defecto_muy_seguro',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Poner en `true` si usas HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Variable global para el pool de conexiones
let db;

// Middleware de autenticación
const requireLogin = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        return res.redirect('/login.html');
    }
};

// --- RUTAS ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));

// API para iniciar sesión
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            req.session.userId = user.id;
            req.session.username = user.username;
            return res.json({ success: true });
        } else {
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
        }
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// API para cerrar sesión
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'No se pudo cerrar la sesión.' });
        }
        res.clearCookie('connect.sid');
        return res.json({ success: true, message: 'Sesión cerrada.' });
    });
});

// API para recibir los datos del formulario de cotización
app.post('/api/submit', async (req, res) => {
    try {
        const { id, createdAt, nombre, empresa, telefono, tipo, generales, respuestas, estimacion_precio } = req.body;
        const sql = `INSERT INTO submissions (id, createdAt, nombre, empresa, telefono, tipo, generales, respuestas, estimacion_precio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await db.query(sql, [
            id, createdAt, nombre, empresa, telefono, tipo,
            JSON.stringify(generales),
            JSON.stringify(respuestas),
            JSON.stringify(estimacion_precio)
        ]);
        res.status(201).json({ success: true, message: 'Formulario recibido.' });
    } catch (error) {
        console.error('Error guardando formulario:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// --- RUTAS PROTEGIDAS ---
app.get('/admin.html', requireLogin, (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

app.get('/api/submissions', requireLogin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM submissions ORDER BY createdAt DESC');
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener las solicitudes:", error);
        res.status(500).json({ error: 'Error obteniendo datos' });
    }
});

app.get('/api/session', requireLogin, (req, res) => {
    res.json({ loggedIn: true, username: req.session.username });
});

// --- LÓGICA DE ARRANQUE ---

/**
 * Asegura que las tablas `users` y `submissions` y el usuario admin existan.
 */
async function setupInitialDatabaseState() {
    const adminUser = process.env.ADMIN_USER;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPassword) {
        console.error('✗ Error: Debes definir ADMIN_USER y ADMIN_PASSWORD en el archivo .env');
        process.exit(1);
    }

    try {
        // 1. Asegurar tabla de USUARIOS
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✓ Tabla "users" asegurada.');

        // 2. ✅ AÑADIDO: Asegurar tabla de COTIZACIONES (SUBMISSIONS)
        await db.execute(`
            CREATE TABLE IF NOT EXISTS submissions (
                internal_id INT AUTO_INCREMENT PRIMARY KEY,
                id VARCHAR(255) UNIQUE,
                createdAt DATETIME,
                nombre VARCHAR(255),
                empresa VARCHAR(255),
                telefono VARCHAR(50),
                tipo VARCHAR(255),
                generales TEXT,
                respuestas TEXT,
                estimacion_precio TEXT,
                receivedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✓ Tabla "submissions" asegurada.');

        // 3. Asegurar usuario ADMIN
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [adminUser]);
        if (rows.length > 0) {
            console.log(`✓ El usuario admin "${adminUser}" ya existe.`);
            return;
        }
        console.log(`Creando usuario admin "${adminUser}"...`);
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [adminUser, hashedPassword]);
        console.log('✓ ¡Usuario admin creado con éxito!');

    } catch (error) {
        console.error('✗ Error durante la configuración de las tablas:', error.message);
        process.exit(1);
    }
}

/**
 * Función principal que inicia todo el servidor.
 */
async function startServer() {
    try {
        const { host, user, password, database } = dbConfig;
        
        // 1. Crear la base de datos si no existe
        const tempConnection = await mysql.createConnection({ host, user, password });
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        console.log(`✓ Base de datos "${database}" asegurada.`);
        await tempConnection.end();

        // 2. Conectar a la base de datos específica
        db = await mysql.createPool(dbConfig);
        await db.query('SELECT 1');
        console.log('✓ Conexión a la base de datos establecida.');
        
        // 3. Crear tablas y usuario admin si no existen
        await setupInitialDatabaseState();

        // 4. Iniciar el servidor Express
        app.listen(PORT, () => console.log(`� Servidor corriendo en http://localhost:${PORT}`));

    } catch (error) {
        console.error('✗ No se pudo iniciar el servidor:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   ↳ Consejo: Verifica que MYSQL_USER y MYSQL_PASSWORD en tu archivo .env son correctos.');
        }
        process.exit(1);
    }
}

// Arrancar todo el proceso
startServer();