-- Este script crea la base de datos y las tablas necesarias para el proyecto.
-- Ejecútalo en phpMyAdmin o en tu cliente de MySQL/MariaDB.

-- 1. CREAR LA BASE DE DATOS (si no existe)
-- Se asegura de usar la codificación correcta para aceptar tildes y caracteres especiales.
CREATE DATABASE IF NOT EXISTS formulario
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. SELECCIONAR LA BASE DE DATOS para trabajar sobre ella
USE formulario;

-- 3. CREAR LA TABLA PARA LAS COTIZACIONES (submissions)
-- Si la tabla ya existe, este comando no hará nada.
CREATE TABLE IF NOT EXISTS submissions (
  id BIGINT NOT NULL PRIMARY KEY,
  createdAt VARCHAR(50),
  nombre VARCHAR(255),
  empresa VARCHAR(255),
  telefono VARCHAR(50),          -- Columna para el teléfono del cliente
  tipo VARCHAR(100),
  generales JSON,                 -- Para guardar las respuestas generales
  respuestas JSON,                -- Para guardar las respuestas específicas
  estimacion_precio JSON        -- Columna para guardar el rango de precio calculado
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4. CREAR LA TABLA PARA LOS USUARIOS ADMINISTRADORES (users)
-- Guardará el nombre de usuario y la contraseña encriptada.
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

