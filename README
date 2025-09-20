# Sistema de Cotizaciones con Panel de Administración

Este proyecto es una aplicación web full-stack que presenta un formulario de cotizaciones para clientes y un panel de administración seguro para gestionar y visualizar las solicitudes recibidas. La aplicación está construida con Node.js, Express y MySQL.

##  Características Principales

* **Formulario Interactivo:** Un formulario público para que los clientes soliciten cotizaciones.
* **Panel de Administración Seguro:** Acceso protegido por login (`/admin.html`) para visualizar todas las cotizaciones.
* **Base de Datos Robusta:** Utiliza MySQL para almacenar de forma persistente las cotizaciones y los usuarios.
* **Setup Automatizado:** Al ejecutar el servidor por primera vez, la aplicación **crea automáticamente** la base de datos, las tablas necesarias (`users`, `submissions`) y el usuario administrador inicial.
* **Gestión de Sesiones:** Sistema de login con contraseñas encriptadas (bcrypt) y manejo de sesiones.
* **Visualización de Datos:** El panel muestra las cotizaciones en tarjetas claras y permite ver detalles en una ventana modal.
* **Exportación a CSV:** Funcionalidad para exportar todas las solicitudes a un archivo `.csv`.
* **Estadísticas Visuales:** Un gráfico de dona que muestra la distribución de cotizaciones por tipo de servicio.

---

##  Prerrequisitos

Asegúrate de tener instalado el siguiente software en tu máquina:

* **Node.js:** (Se recomienda v18 o superior)
* **NPM:** (Se instala automáticamente con Node.js)
* **MySQL (o MariaDB):** Un servidor de base de datos MySQL debe estar en ejecución.

---

##  Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto:

1.  **Clonar el Repositorio**
    ```bash
    git clone [https://github.com/bertv07/formulario_cotizacion.git](https://github.com/bertv07/formulario_cotizacion.git)
    cd tu_repositorio
    ```

2.  **Instalar Dependencias**
    Ejecuta el siguiente comando en la raíz del proyecto para instalar todos los paquetes necesarios.
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**
    Este es el paso más importante. Crea un archivo llamado `.env` en la raíz del proyecto. Copia y pega el siguiente contenido, **reemplazando los valores** con tu propia configuración.

    ```env
    # --- Configuración de la Base de Datos ---
    # Asegúrate de que tu servidor MySQL esté usando estas credenciales
    MYSQL_HOST=localhost
    MYSQL_USER=root
    MYSQL_PASSWORD=tu_contraseña_de_mysql
    MYSQL_DATABASE=formulario_cotizaciones

    # --- Credenciales para el Panel de Administración ---
    # Define el usuario y contraseña para acceder a /admin.html
    ADMIN_USER=admin
    ADMIN_PASSWORD=una_contraseña_segura_para_el_admin

    # --- Secreto para la Sesión ---
    # Escribe una frase larga y aleatoria aquí para la seguridad de las sesiones
    SESSION_SECRET=un_secreto_largo_y_dificil_de_adivinar
    ```

---

## � Ejecución

Una vez completada la configuración, inicia el servidor con el siguiente comando:

```bash
node index.js
```
Si todo está configurado correctamente, verás una salida en la consola similar a esta, confirmando que la base de datos, las tablas y el usuario admin fueron creados o ya existían:

✓ Base de datos "formulario_cotizaciones" asegurada.
✓ Conexión a la base de datos establecida.
✓ Tabla "users" asegurada.
✓ Tabla "submissions" asegurada.
✓ ¡Usuario admin creado con éxito!
� Servidor corriendo en http://localhost:3000