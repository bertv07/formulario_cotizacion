document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM (Según tu HTML) ---
    const form = document.getElementById('cotizacion-form');
    const steps = document.querySelectorAll('.step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const tiposContainer = document.getElementById('tipos-container');
    const panelDinamico = document.getElementById('panel-dinamico');
    const seccionInfo = document.getElementById('seccion-info');
    const prevSectionBtn = document.getElementById('prev-section-btn');
    const nextSectionBtn = document.getElementById('next-section-btn');
    const resumenContainer = document.getElementById('resumen-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const modal = document.getElementById('alert-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const closeModalBtn = document.querySelector('.close-modal-btn');

    // --- ESTADO DEL FORMULARIO ---
    let currentStep = 1;
    let selectedWebType = null;
    let respuestasUsuario = {};
    let preguntasAgrupadas = [];
    let seccionActual = 0;

    // --- DATOS COMPLETOS (TIPOS, PREGUNTAS, PRECIOS) ---
    const tipos = [
        { id: 'landing', title: 'Landing Page', icon: 'rocket' },
        { id: 'corporativa', title: 'Web Corporativa', icon: 'building' },
        { id: 'portafolio', title: 'Portafolio Creativo', icon: 'palette' },
        { id: 'blog', title: 'Blog Personal', icon: 'blog' },
        { id: 'ecommerce', title: 'E-commerce', icon: 'shopping-cart' },
        { id: 'experiencia3d', title: 'Experiencia 3D', icon: 'cube' },
        { id: 'educativo', title: 'Sitio Educativo', icon: 'graduation-cap' },
        { id: 'agendar', title: 'Sitio para Agendar', icon: 'calendar-alt' }
    ];

    const preguntas = {
        generales: [
            { id: 'gen-objetivo-sitio', texto: 'Objetivo del sitio', tipo: 'textarea' },
            { id: 'gen-plazo-estimado', texto: 'Plazo estimado', tipo: 'text' },
            { id: 'gen-dominio-hosting', texto: '¿Ya tienes dominio y hosting?', tipo: 'radio', opciones: ['Sí', 'No', 'Necesito asesoría'] },
            { id: 'gen-identidad-visual', texto: '¿Tienes identidad visual (logo, colores)?', tipo: 'radio', opciones: ['Sí', 'No', 'Estoy en proceso'] },
            { id: 'gen-multi-idioma', texto: '¿Necesitas el sitio en más de un idioma?', tipo: 'radio', opciones: ['Sí', 'No'] },
            { id: 'gen-mantenimiento', texto: '¿Requieres mantenimiento posterior?', tipo: 'radio', opciones: ['Sí', 'No', 'Lo evaluaré después'] },
        ],
        landing: {
            'Visuales': [
                { id: 'lan-estilo-visual', texto: '¿Qué estilo visual prefieres? (minimalista, moderno, etc.)', tipo: 'text' },
                { id: 'lan-scroll-largo', texto: '¿Deseas que tenga scroll largo con secciones?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'lan-animaciones', texto: '¿Necesitas animaciones o efectos visuales?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'lan-responsive', texto: '¿Requiere adaptación a móviles (responsive)?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ],
            'Textuales': [
                { id: 'lan-redaccion', texto: '¿Tienes los textos listos o necesitas redacción?', tipo: 'radio', opciones: ['Los tengo', 'Necesito redacción'] },
                { id: 'lan-copywriting', texto: '¿Requieres copywriting persuasivo?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'lan-textos-legales', texto: '¿Necesitas textos legales (Política de privacidad, etc.)?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ],
            'Funcionalidad': [
                { id: 'lan-formulario', texto: '¿Tipo de formulario? (contacto, suscripción, etc.)', tipo: 'text' },
                { id: 'lan-integracion-crm', texto: '¿Integración con CRM, email marketing o Sheets?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'lan-chat-vivo', texto: '¿Botón de WhatsApp o chat en vivo?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'lan-pixeles', texto: '¿Seguimiento con píxeles (Facebook, Google Ads, etc.)?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ],
            'Multimedia': [
                { id: 'lan-videos', texto: '¿Deseas incluir videos embebidos?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'lan-galeria', texto: '¿Galería de imágenes o carrusel?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'lan-descargables', texto: '¿Archivos descargables (PDF, ZIP)?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ],
            'Extras': [
                { id: 'lan-cms', texto: '¿Deseas que se pueda actualizar fácilmente (CMS)?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'lan-analytics', texto: '¿Necesitas Google Analytics o Tag Manager?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'lan-seo', texto: '¿Requieres optimización SEO básica?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ]
        },
        corporativa: {
            'Visuales': [
                { id: 'corp-estilo-marca', texto: '¿Qué estilo visual representa mejor tu marca?', tipo: 'text' },
                { id: 'corp-manual-marca', texto: '¿Tienes ya un manual de marca?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'corp-animaciones', texto: '¿Deseas animaciones en secciones como "Nosotros" o "Servicios"?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'corp-diseno-tipo', texto: '¿Diseño personalizado o basado en plantilla?', tipo: 'radio', opciones: ['Personalizado', 'Plantilla'] },
            ],
            'Textuales': [
                { id: 'corp-redaccion', texto: '¿Tienes los textos listos o necesitas redacción?', tipo: 'radio', opciones: ['Los tengo', 'Necesito redacción'] },
                { id: 'corp-secciones', texto: '¿Qué secciones incluirá el sitio? (Inicio, Nosotros, etc.)', tipo: 'textarea' },
                { id: 'corp-seo-textos', texto: '¿Necesitas optimización SEO en los textos?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ],
            'Funcionalidad': [
                { id: 'corp-mapa', texto: '¿Mapa de ubicación (Google Maps)?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'corp-blog', texto: '¿Blog o sección de noticias?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'corp-cms', texto: '¿Panel de administración para actualizar contenido (CMS)?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ],
            'Multimedia': [
                { id: 'corp-videos', texto: '¿Deseas incluir videos institucionales?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'corp-galeria', texto: '¿Galería de imágenes o carrusel de proyectos?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ],
        },
        portafolio: {
            'Visuales': [
                { id: 'port-estilo', texto: '¿Qué estilo visual deseas? (oscuro, minimalista, etc.)', tipo: 'text' },
                { id: 'port-layout', texto: '¿Cómo mostrar proyectos? (cuadrícula, carrusel, etc.)', tipo: 'text' },
                { id: 'port-animaciones', texto: '¿Animaciones al pasar el cursor (hover)?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ],
            'Funcionalidad': [
                { id: 'port-filtros', texto: '¿Deseas filtros por categoría?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'port-cms', texto: '¿Panel de administración para subir nuevos proyectos?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'port-cv', texto: '¿Descargar CV o portafolio en PDF?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ],
        },
        blog: {
            'Visuales': [
                { id: 'blog-estilo', texto: '¿Qué estilo visual prefieres? (revista, minimalista, etc.)', tipo: 'text' },
                { id: 'blog-dark-mode', texto: '¿Quieres modo oscuro?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ],
            'Funcionalidad': [
                { id: 'blog-comentarios', texto: '¿Permitir comentarios de usuarios?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'blog-buscador', texto: '¿Necesitas buscador interno?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'blog-suscripcion', texto: '¿Integración con boletines o suscripciones por correo?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'blog-cms', texto: '¿Panel de administración para publicar y editar artículos?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ],
        },
        ecommerce: {
            'Funcionalidad': [
                { id: 'ecom-productos-iniciales', texto: '¿Cuántos productos planeas vender inicialmente?', tipo: 'text' },
                { id: 'ecom-pagos', texto: '¿Qué métodos de pago necesitas? (PayPal, Stripe, etc.)', tipo: 'textarea' },
                { id: 'ecom-inventario', texto: '¿Necesitas gestión de inventario?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'ecom-cupones', texto: '¿Sistema de cupones o descuentos?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ],
            'Extras': [
                 { id: 'ecom-panel', texto: '¿Panel de administración para productos y pedidos?', tipo: 'radio', opciones: ['Sí', 'No'] },
                 { id: 'ecom-logistica', texto: '¿Necesitas integración con logística de envíos?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ]
        },
        experiencia3d: {
            'Visuales': [
                { id: '3d-modelos', texto: '¿Tienes ya los modelos 3D o necesitamos crearlos?', tipo: 'radio', opciones: ['Los tengo', 'Necesito creación'] },
                { id: '3d-interaccion', texto: '¿Qué tipo de interacción esperas? (rotar, zoom, etc.)', tipo: 'text' },
                { id: '3d-efectos', texto: '¿Efectos visuales como partículas o luces dinámicas?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ],
            'Funcionalidad': [
                { id: '3d-vr', texto: '¿Requieres compatibilidad con gafas VR?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: '3d-audio', texto: '¿Incluir audio ambiental o narración?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ]
        },
        educativo: {
            'Funcionalidad': [
                { id: 'edu-registro', texto: '¿Requiere sistema de registro de usuarios?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'edu-progreso', texto: '¿Necesitas seguimiento de progreso del usuario?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'edu-pagos', texto: '¿Integración con pasarelas de pago para vender cursos?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'edu-certificados', texto: '¿Descargar certificados al completar?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ]
        },
        agendar: {
            'Funcionalidad': [
                { id: 'agen-calendario', texto: '¿Integración con Google Calendar / Outlook?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'agen-pagos', texto: '¿Necesitas pagos al momento de agendar?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'agen-panel', texto: '¿Panel de administración para gestionar citas?', tipo: 'radio', opciones: ['Sí', 'No'] },
                { id: 'agen-recordatorios', texto: '¿Recordatorios automáticos por correo o WhatsApp?', tipo: 'radio', opciones: ['Sí', 'No'] },
            ]
        },
    };

    const precios = {
        base: { landing: 150, corporativa: 400, portafolio: 300, blog: 350, ecommerce: 800, experiencia3d: 1200, educativo: 600, agendar: 450 },
        adicionales: {
            'gen-dominio-hosting-Necesito asesoría': 20,
            'gen-multi-idioma-Sí': 150,
            'gen-mantenimiento-Sí': 50,
            'lan-animaciones-Sí': 100,
            'lan-redaccion-Necesito redacción': 80,
            'lan-integracion-crm-Sí': 120,
            'lan-pixeles-Sí': 70,
            'lan-cms-Sí': 200,
            'corp-diseno-tipo-Personalizado': 200,
            'corp-cms-Sí': 250,
            'port-filtros-Sí': 90,
            'port-cms-Sí': 200,
            'blog-comentarios-Sí': 80,
            'blog-suscripcion-Sí': 100,
            'blog-cms-Sí': 250,
            'ecom-inventario-Sí': 150,
            'ecom-panel-Sí': 300,
            '3d-modelos-Necesito creación': 500,
            '3d-vr-Sí': 400,
            'edu-registro-Sí': 150,
            'edu-pagos-Sí': 200,
            'edu-certificados-Sí': 100,
            'agen-calendario-Sí': 180,
            'agen-pagos-Sí': 150,
            'agen-panel-Sí': 220,
        }
    };

    // --- FUNCIONES ---

    function showModal(title, message) {
        if (!modal || !modalTitle || !modalMessage) return;
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.style.display = 'flex';
    }

    function closeModal() {
        if (!modal) return;
        modal.style.display = 'none';
    }

    function showStep(stepNumber) {
        steps.forEach(step => step.classList.remove('active'));
        document.getElementById(`step-${stepNumber}`)?.classList.add('active');
        progressSteps.forEach((progressStep) => {
            const stepIndex = parseInt(progressStep.dataset.step);
            progressStep.classList.toggle('active', stepIndex === stepNumber);
            progressStep.classList.toggle('completed', stepIndex < stepNumber);
        });
    }
    
    function renderizarTiposWeb() {
        if (!tiposContainer) return;
        tiposContainer.innerHTML = '';
        tipos.forEach(tipo => {
            const card = document.createElement('div');
            card.className = 'tipo-card';
            card.innerHTML = `<i class="fas fa-${tipo.icon} tipo-icon"></i><h3>${tipo.title}</h3>`;
            card.addEventListener('click', () => {
                document.querySelectorAll('.tipo-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedWebType = tipo.id;
                setTimeout(() => {
                    prepararPreguntas();
                    showStep(3);
                }, 300);
            });
            tiposContainer.appendChild(card);
        });
    }

    function prepararPreguntas() {
        preguntasAgrupadas = [];
        preguntasAgrupadas.push({ nombre: 'Preguntas Generales', preguntas: preguntas.generales });
        if (selectedWebType && preguntas[selectedWebType]) {
            for (const [nombreSeccion, listaPreguntas] of Object.entries(preguntas[selectedWebType])) {
                preguntasAgrupadas.push({ nombre: nombreSeccion, preguntas: listaPreguntas });
            }
        }
        seccionActual = 0;
        mostrarSeccion();
    }
    
    function mostrarSeccion() {
        if (!panelDinamico) return;
        const seccion = preguntasAgrupadas[seccionActual];
        panelDinamico.innerHTML = '';
        seccion.preguntas.forEach(p => panelDinamico.appendChild(crearElementoPregunta(p)));
        if(seccionInfo) seccionInfo.textContent = `Sección ${seccionActual + 1} de ${preguntasAgrupadas.length}: ${seccion.nombre}`;
        if(prevSectionBtn) prevSectionBtn.style.display = seccionActual > 0 ? 'inline-flex' : 'none';
        if(nextSectionBtn) nextSectionBtn.style.display = 'inline-flex';
    }
    
    function crearElementoPregunta(p) {
        const wrapper = document.createElement('div');
        wrapper.className = 'input-group';
        let inputHtml = `<label for="${p.id}">${p.texto}</label>`;
        const valor = respuestasUsuario[p.id] || '';
        switch(p.tipo) {
            case 'textarea': 
                inputHtml += `<textarea id="${p.id}" name="${p.id}">${valor}</textarea>`; 
                break;
            case 'radio':
                inputHtml += '<div class="radio-group">';
                p.opciones.forEach(op => {
                    const checked = valor === op ? 'checked' : '';
                    inputHtml += `<label><input type="radio" name="${p.id}" value="${op}" ${checked}><span>${op}</span></label>`;
                });
                inputHtml += '</div>';
                break;
            default: 
                inputHtml += `<input type="text" id="${p.id}" name="${p.id}" value="${valor}">`; 
                break;
        }
        wrapper.innerHTML = inputHtml;
        return wrapper;
    }
    
    function validarSeccionActual() {
        let esValido = true;
        const gruposDePreguntas = panelDinamico.querySelectorAll('.input-group');
        gruposDePreguntas.forEach(grupo => {
            grupo.classList.remove('error');
            const inputs = grupo.querySelectorAll('input, textarea');
            let preguntaRespondida = false;
            if (inputs[0].type === 'radio') {
                if (grupo.querySelector('input[type="radio"]:checked')) {
                    preguntaRespondida = true;
                }
            } else {
                if (inputs[0].value.trim() !== '') {
                    preguntaRespondida = true;
                }
            }
            if (!preguntaRespondida) {
                esValido = false;
                grupo.classList.add('error');
            }
        });
        if (!esValido) {
            showModal('Campos Incompletos', 'Por favor, responde todas las preguntas marcadas en rojo para poder continuar.');
        }
        return esValido;
    }

    function guardarRespuestasSeccion() {
        const inputs = panelDinamico.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) respuestasUsuario[input.name] = input.value;
            } else if(input.name) {
                respuestasUsuario[input.name] = input.value;
            }
        });
    }

    function renderizarResumen() {
        if (!resumenContainer) return;
        let html = '<h3>Resumen de tu Solicitud</h3>';
        const datosIniciales = ['nombre', 'empresa', 'telefono'];
        datosIniciales.forEach(key => {
            const labelEl = document.querySelector(`label[for="${key}"]`);
            const label = labelEl ? labelEl.textContent : key;
            html += `<p><strong>${label}:</strong> ${respuestasUsuario[key] || 'No provisto'}</p>`;
        });
        html += `<p><strong>Tipo de Web:</strong> ${selectedWebType}</p><hr>`;
        for(const [key, value] of Object.entries(respuestasUsuario)) {
            if(value && !datosIniciales.includes(key)) {
                const preguntaElem = document.querySelector(`label[for="${key}"]`);
                const preguntaTexto = preguntaElem ? preguntaElem.textContent : key.replace(/-/g, ' ');
                html += `<p><strong>${preguntaTexto.charAt(0).toUpperCase() + preguntaTexto.slice(1)}:</strong> ${value}</p>`;
            }
        }
        resumenContainer.innerHTML = html;
    }

    function calcularPrecioEstimado() {
        let min = precios.base[selectedWebType] || 0;
        for(const [key, value] of Object.entries(respuestasUsuario)) {
            const claveAdicional = `${key}-${value}`;
            if(precios.adicionales[claveAdicional]) {
                min += precios.adicionales[claveAdicional];
            }
        }
        return { min, max: Math.round(min * 1.5) };
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        if (loadingIndicator) loadingIndicator.style.display = 'flex';
        const { nombre, empresa, telefono, ...restoRespuestas } = respuestasUsuario;
        const payload = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            nombre, empresa, telefono,
            tipo: selectedWebType,
            respuestas: restoRespuestas,
            estimacion_precio: calcularPrecioEstimado()
        };

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                showStep(5);
            } else {
                showModal('Error de Envío', 'Hubo un problema al enviar tu solicitud. Por favor, inténtalo de nuevo más tarde.');
            }
        } catch (error) {
            showModal('Error de Conexión', 'No se pudo conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.');
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }

    // --- MANEJO DE EVENTOS ---
    document.getElementById('next-step-1')?.addEventListener('click', () => {
        const nombreInput = document.getElementById('nombre');
        const telefonoInput = document.getElementById('telefono');
        if (!nombreInput || !telefonoInput || !nombreInput.value.trim() || !telefonoInput.value.trim()) {
            showModal('Datos Requeridos', 'Por favor, completa tu nombre y teléfono para continuar.');
            return;
        }
        ['nombre', 'empresa', 'telefono'].forEach(id => {
            const el = document.getElementById(id);
            if (el) respuestasUsuario[id] = el.value;
        });
        showStep(2);
    });
    
    document.getElementById('back-step-2')?.addEventListener('click', () => showStep(1));

    nextSectionBtn?.addEventListener('click', () => {
        if (!validarSeccionActual()) {
            return;
        }
        guardarRespuestasSeccion();
        if (seccionActual < preguntasAgrupadas.length - 1) {
            seccionActual++;
            mostrarSeccion();
        } else {
            renderizarResumen();
            showStep(4);
        }
    });

    prevSectionBtn?.addEventListener('click', () => {
        guardarRespuestasSeccion();
        seccionActual--;
        mostrarSeccion();
    });

    document.getElementById('back-step-4')?.addEventListener('click', () => showStep(3));
    
    form?.addEventListener('submit', handleFormSubmit);

    closeModalBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- INICIALIZACIÓN ---
    renderizarTiposWeb();
    showStep(1);
});

