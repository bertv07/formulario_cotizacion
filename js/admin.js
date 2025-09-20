// --- PORTERO DE SEGURIDAD ---
// Esta función se ejecuta primero. Verifica la sesión antes de hacer cualquier otra cosa.
async function verificarSesionYContinuar() {
    try {
        const response = await fetch('/api/session');
        // Si la respuesta es 401 (No autorizado) o cualquier otro error, nos vamos al catch
        if (!response.ok) {
            throw new Error('Sesión no válida');
        }
        // Si la sesión es VÁLIDA, llamamos a la función que realmente inicia la página
        iniciarPaginaAdmin();
    } catch (error) {
        // Si no hay sesión (o hay un error de red), redirigimos al login. Fin de la historia.
        console.log('Redirigiendo al login por falta de sesión.');
        window.location.href = '/login.html';
    }
}

// --- INICIADOR DE LA PÁGINA ---
// Todo tu código original ahora vive dentro de esta función.
// Solo se ejecuta si la verificación de sesión fue exitosa.
function iniciarPaginaAdmin() {
    
    // --- ELEMENTOS DEL DOM ---
    const listado = document.getElementById('listado');
    const btnExport = document.getElementById('btn-export');
    const btnStats = document.getElementById('btn-stats');
    const btnLogout = document.getElementById('btn-logout');

    const detailsModal = document.getElementById('details-modal');
    const statsModal = document.getElementById('stats-modal');
    const closeDetailsModalBtn = document.getElementById('close-details-modal');
    const closeStatsModalBtn = document.getElementById('close-stats-modal');

    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');

    let solicitudesCache = [];
    let myChart = null;

    // --- FUNCIONES ---
    function formatFecha(fechaStr) {
        if (!fechaStr) return 'Fecha no disponible';
        return new Date(fechaStr).toLocaleString('es-VE', { dateStyle: 'long', timeStyle: 'short' });
    }

    function showModal(modalElement) {
        if (modalElement) modalElement.style.display = 'flex';
    }

    function closeModal(modalElement) {
        if (modalElement) modalElement.style.display = 'none';
    }

    function renderizarSolicitudes(solicitudes) {
        if (!listado) return;
        if (solicitudes.length === 0) {
            listado.innerHTML = `<div class="empty-state"><h3>No hay solicitudes</h3><p>Aún no se han recibido cotizaciones.</p></div>`;
            return;
        }
        listado.innerHTML = '';
        solicitudes.forEach(sol => {
            const estimacion = sol.estimacion_precio ? JSON.parse(sol.estimacion_precio) : { min: 0, max: 0 };
            const card = document.createElement('div');
            card.className = 'solicitud-card';
            card.innerHTML = `
                <div class="card-header">
                    <h3>${sol.nombre || 'Sin nombre'}</h3>
                    <span>${formatFecha(sol.createdAt)}</span>
                </div>
                <div class="card-body">
                    <p><i class="fas fa-building"></i> ${sol.empresa || 'No especificada'}</p>
                    <p><i class="fas fa-phone"></i> ${sol.telefono || 'No especificado'}</p>
                    <p><i class="fas fa-laptop-code"></i> <strong>Tipo:</strong> ${sol.tipo || 'No especificado'}</p>
                </div>
                <div class="card-price-estimate">
                    <span>Precio Estimado</span>
                    <strong>$${estimacion.min} - $${estimacion.max}</strong>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-details" data-id="${sol.id}">Ver Detalles</button>
                </div>
            `;
            listado.appendChild(card);
        });
    }

    function mostrarDetalles(solicitudId) {
        const sol = solicitudesCache.find(s => s.id == solicitudId);
        if (!sol) return;
        let respuestasHtml = '<h4>Respuestas Específicas:</h4><ul>';
        try {
            const respuestas = JSON.parse(sol.respuestas);
            for (const [key, value] of Object.entries(respuestas)) {
                if(value) {
                    const pregunta = key.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
                    respuestasHtml += `<li><strong>${pregunta}:</strong> ${value}</li>`;
                }
            }
        } catch (e) {
            respuestasHtml += '<li>No se pudieron cargar las respuestas.</li>';
        }
        respuestasHtml += '</ul>';
        if(modalTitle) modalTitle.textContent = `Solicitud de ${sol.nombre}`;
        if(modalMessage) modalMessage.innerHTML = respuestasHtml;
        showModal(detailsModal);
    }
    
    function mostrarEstadisticas(solicitudes) {
        const conteoTipos = {};
        solicitudes.forEach(sol => {
            const tipo = sol.tipo || 'Sin especificar';
            conteoTipos[tipo] = (conteoTipos[tipo] || 0) + 1;
        });
        const labels = Object.keys(conteoTipos);
        const data = Object.values(conteoTipos);
        const canvas = document.getElementById('statsChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (myChart) {
            myChart.destroy();
        }
        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Solicitudes por Tipo',
                    data: data,
                    backgroundColor: ['#8a2be2', '#6a0dad', '#9932cc', '#ba55d3', '#dda0dd', '#e6e6fa', '#4b0082', '#800080'],
                    borderColor: '#1e1e1e',
                    borderWidth: 3
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'top', labels: { color: '#f0f0f0' } } } }
        });
        showModal(statsModal);
    }
    
    function exportarACSV(solicitudes) {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Fecha,Nombre,Empresa,Telefono,Tipo,Respuestas,PrecioMin,PrecioMax\r\n";
        solicitudes.forEach(sol => {
            const estimacion = sol.estimacion_precio ? JSON.parse(sol.estimacion_precio) : { min: 0, max: 0 };
            const respuestas = sol.respuestas ? JSON.stringify(JSON.parse(sol.respuestas)) : "{}";
            const row = [sol.id, sol.createdAt, `"${sol.nombre || ''}"`, `"${sol.empresa || ''}"`, sol.telefono || '', sol.tipo || '', `"${respuestas.replace(/"/g, '""')}"`, estimacion.min, estimacion.max].join(",");
            csvContent += row + "\r\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "cotizaciones.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    async function cargarSolicitudes() {
        try {
            const response = await fetch('/api/submissions');
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            solicitudesCache = await response.json();
            renderizarSolicitudes(solicitudesCache);
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
            if(listado) listado.innerHTML = `<div class="empty-state error"><h3>Error al Cargar</h3><p>No se pudieron obtener los datos. Intenta de nuevo.</p></div>`;
        }
    }

    // --- MANEJO DE EVENTOS ---
    if (listado) {
        listado.addEventListener('click', (e) => {
            const target = e.target.closest('.btn-details');
            if (target) {
                mostrarDetalles(target.dataset.id);
            }
        });
    }
    
    btnStats?.addEventListener('click', () => {
        if (solicitudesCache.length > 0) mostrarEstadisticas(solicitudesCache);
        else alert("No hay datos para mostrar estadísticas.");
    });

    btnExport?.addEventListener('click', () => {
        if (solicitudesCache.length > 0) exportarACSV(solicitudesCache);
        else alert("No hay datos para exportar.");
    });
    
    // Aquí usamos la versión corregida del botón de logout
    btnLogout?.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/logout', { method: 'POST' });
            if (response.ok) {
                window.location.href = '/login.html';
            } else {
                alert('Error al cerrar la sesión.');
            }
        } catch (error) {
            console.error('Error en la petición de logout:', error);
        }
    });

    closeDetailsModalBtn?.addEventListener('click', () => closeModal(detailsModal));
    closeStatsModalBtn?.addEventListener('click', () => closeModal(statsModal));
    
    window.addEventListener('click', (e) => {
        if (e.target === detailsModal) closeModal(detailsModal);
        if (e.target === statsModal) closeModal(statsModal);
    });

    // --- INICIALIZACIÓN ---
    cargarSolicitudes();
}

// Esto es lo que inicia todo el proceso cuando la página carga
document.addEventListener('DOMContentLoaded', verificarSesionYContinuar);