/**
 * Aplicación Principal - Academia Telegram
 */

class AcademyApp {
    constructor() {
        this.parser = new TelegramParser();
        this.allMessages = [];
        this.filteredMessages = [];
        this.activeCategories = [];
        this.activeTypes = [];
        this.currentView = 'grid';
        this.currentSearch = '';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
        // Search
        document.getElementById('searchInput').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.search();
        });

        document.getElementById('searchBtn').addEventListener('click', () => this.search());

        // Filters
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());
        document.getElementById('toggleView').addEventListener('click', () => this.toggleViewMode());

        // View toggles
        document.querySelectorAll('.view-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setViewMode(e.target.dataset.view);
            });
        });

        // Modal
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('contentModal').addEventListener('click', (e) => {
            if (e.target.id === 'contentModal') this.closeModal();
        });
    }

    async loadData() {
        // Intenta cargar datos de múltiples fuentes
        const data = await this.fetchTelegramData();
        if (data) {
            this.allMessages = this.parser.loadFromJSON(data);
            this.render();
        } else {
            this.showEmptyState();
        }
    }

    async fetchTelegramData() {
        // Intenta cargar el archivo de datos exportado
        try {
            // Primero intenta con archivo JSON directo
            const response = await fetch('telegram-data.json');
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.log('No se encontró telegram-data.json');
        }

        // Si no hay datos, carga datos de demostración
        return this.getDemoData();
    }

    getDemoData() {
        return [
            {
                id: 1,
                timestamp: '2026-06-29 14:30',
                author: 'Academia',
                text: 'Tutorial: Primeros pasos con JavaScript - Guía completa para principiantes. Aprende sobre variables, funciones y control de flujo.',
                media: { images: [], videos: [], files: [], audio: [], stickers: [] },
                type: 'artículo',
                category: 'tutoriales',
                links: [{ url: 'https://ejemplo.com/js-tutorial', text: 'Ver tutorial' }],
                mentions: [],
            },
            {
                id: 2,
                timestamp: '2026-06-28 10:15',
                author: 'Instructor',
                text: 'Nueva plantilla de proyecto React disponible. Descarga y comienza tu proyecto en 5 minutos.',
                media: { images: [], videos: [], files: [{ url: '#', name: 'react-template.zip' }], audio: [], stickers: [] },
                type: 'archivo',
                category: 'recursos',
                links: [{ url: 'https://github.com/ejemplo/react-template', text: 'GitHub' }],
                mentions: [],
            },
            {
                id: 3,
                timestamp: '2026-06-27 16:45',
                author: 'Comunidad',
                text: '¿Alguien sabe cómo configurar ESLint en React? Necesito ayuda con la configuración.',
                media: { images: [], videos: [], files: [], audio: [], stickers: [] },
                type: 'mensaje',
                category: 'preguntas',
                links: [],
                mentions: [],
            },
            {
                id: 4,
                timestamp: '2026-06-26 09:00',
                author: 'Instructor',
                text: 'WEBINAR EN VIVO: Arquitectura de Microservicios - Hoy a las 7 PM. No te lo pierdas!',
                media: { images: [], videos: [], files: [], audio: [], stickers: [] },
                type: 'mensaje',
                category: 'eventos',
                links: [{ url: 'https://zoom.us/ejemplo', text: 'Enlace Zoom' }],
                mentions: [],
            },
            {
                id: 5,
                timestamp: '2026-06-25 13:20',
                author: 'Academia',
                text: 'Ejercicio Práctico #5: Construye un carrito de compras en React con Context API. Duración: 3 horas. Nivel: Intermedio.',
                media: { images: [], videos: [], files: [{ url: '#', name: 'ejercicio-5-starter.zip' }], audio: [], stickers: [] },
                type: 'archivo',
                category: 'ejercicios',
                links: [{ url: 'https://github.com/ejercicios/carrito', text: 'Solución' }],
                mentions: [],
            },
            {
                id: 6,
                timestamp: '2026-06-24 15:30',
                author: 'Estudiante',
                text: 'Compartiendo mi solución al ejercicio de componentes. ¿Qué opinan del enfoque que usé?',
                media: { images: [{ url: 'images/screenshot.png', title: 'Screenshot' }], videos: [], files: [], audio: [], stickers: [] },
                type: 'imagen',
                category: 'discusiones',
                links: [],
                mentions: ['@Academia', '@Instructor'],
            },
        ];
    }

    render() {
        this.applyFilters();
        this.renderFilters();
        this.renderContent();
        this.updateStats();
    }

    applyFilters() {
        this.filteredMessages = this.parser.filter({
            categories: this.activeCategories.length > 0 ? this.activeCategories : undefined,
            types: this.activeTypes.length > 0 ? this.activeTypes : undefined,
            search: this.currentSearch,
        });
    }

    renderFilters() {
        // Categorías
        const categoryContainer = document.getElementById('categoryFilters');
        const categories = Array.from(this.parser.categories).sort();

        categoryContainer.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `category-badge ${this.activeCategories.includes(cat) ? 'active' : ''}`;
            btn.textContent = this.getCategoryLabel(cat);
            btn.addEventListener('click', () => this.toggleCategory(cat));
            categoryContainer.appendChild(btn);
        });

        // Tipos de contenido
        const typeContainer = document.getElementById('typeFilters');
        const types = Array.from(this.parser.contentTypes).sort();

        typeContainer.innerHTML = '';
        types.forEach(type => {
            const btn = document.createElement('button');
            btn.className = `category-badge ${this.activeTypes.includes(type) ? 'active' : ''}`;
            btn.textContent = this.getTypeLabel(type);
            btn.addEventListener('click', () => this.toggleType(type));
            typeContainer.appendChild(btn);
        });
    }

    renderContent() {
        const gridContainer = document.getElementById('contentGrid');
        const listContainer = document.getElementById('contentList');
        const emptyState = document.getElementById('emptyState');

        // Limpia contenedores
        gridContainer.innerHTML = '';
        listContainer.innerHTML = '';

        if (this.filteredMessages.length === 0) {
            this.showEmptyState();
            return;
        }

        emptyState.style.display = 'none';

        // Renderiza según vista
        if (this.currentView === 'grid') {
            gridContainer.style.display = 'grid';
            listContainer.style.display = 'none';
            this.filteredMessages.forEach(msg => {
                gridContainer.appendChild(this.createCardElement(msg));
            });
        } else {
            gridContainer.style.display = 'none';
            listContainer.style.display = 'flex';
            this.filteredMessages.forEach(msg => {
                listContainer.appendChild(this.createListItemElement(msg));
            });
        }
    }

    createCardElement(msg) {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.addEventListener('click', () => this.openModal(msg));

        // Media
        let mediaHTML = '';
        const iconMap = {
            imagen: '🖼️',
            video: '🎬',
            audio: '🎵',
            archivo: '📄',
            enlace: '🔗',
            artículo: '📰',
            mensaje: '💬',
        };

        const mediaClass = msg.media.images.length > 0 ? 'has-image' :
                          msg.media.videos.length > 0 ? 'has-video' :
                          msg.media.audio.length > 0 ? 'has-audio' : '';

        if (msg.media.images.length > 0) {
            mediaHTML = `<img src="${msg.media.images[0].url}" alt="${msg.media.images[0].title}">`;
        } else if (msg.media.videos.length > 0) {
            mediaHTML = `<div class="card-media has-video">${iconMap[msg.type]}</div>`;
        } else {
            mediaHTML = `<div class="card-media">${iconMap[msg.type]}</div>`;
        }

        const content = `
            <div class="card-media ${mediaClass}">
                ${mediaHTML}
            </div>
            <div class="card-content">
                <span class="card-category">${this.getCategoryLabel(msg.category)}</span>
                <h3 class="card-title">${this.getTitleFromMessage(msg)}</h3>
                <p class="card-description">${msg.text.substring(0, 150)}...</p>
                <div class="card-meta">
                    <div class="card-date">
                        <span>📅</span>
                        <span>${this.formatDate(msg.timestamp)}</span>
                    </div>
                    <div class="card-actions">
                        <button class="card-action-btn" title="Más información">ℹ️</button>
                        ${msg.links.length > 0 ? '<button class="card-action-btn" title="Contiene enlaces">🔗</button>' : ''}
                    </div>
                </div>
            </div>
        `;

        card.innerHTML = content;
        return card;
    }

    createListItemElement(msg) {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.addEventListener('click', () => this.openModal(msg));

        const iconMap = {
            imagen: '🖼️',
            video: '🎬',
            audio: '🎵',
            archivo: '📄',
            enlace: '🔗',
            artículo: '📰',
            mensaje: '💬',
        };

        const mediaHTML = msg.media.images.length > 0
            ? `<img src="${msg.media.images[0].url}" alt="${msg.media.images[0].title}">`
            : `<div style="font-size: 2.5rem;">${iconMap[msg.type]}</div>`;

        const content = `
            <div class="list-media">
                ${mediaHTML}
            </div>
            <div class="list-content">
                <div class="list-title">${this.getTitleFromMessage(msg)}</div>
                <div class="list-meta">
                    <span>${this.getCategoryLabel(msg.category)}</span>
                    <span>${msg.author}</span>
                    <span>${this.formatDate(msg.timestamp)}</span>
                </div>
            </div>
            <div class="list-actions">
                <button class="card-action-btn" title="Ver detalles">👁️</button>
                ${msg.links.length > 0 ? '<button class="card-action-btn" title="Contiene enlaces">🔗</button>' : ''}
            </div>
        `;

        item.innerHTML = content;
        return item;
    }

    openModal(msg) {
        const modal = document.getElementById('contentModal');
        document.getElementById('modalTitle').textContent = this.getTitleFromMessage(msg);

        const date = new Date(msg.timestamp).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        document.getElementById('modalMeta').innerHTML = `
            <span>👤 ${msg.author}</span>
            <span>📅 ${date}</span>
            <span>🏷️ ${this.getCategoryLabel(msg.category)}</span>
        `;

        let body = `<p>${this.linkifyText(msg.text)}</p>`;

        // Añade media
        if (msg.media.images.length > 0) {
            body += '<div style="margin-top: 1.5rem;"><h4>📸 Imágenes:</h4>';
            msg.media.images.forEach(img => {
                body += `<div style="margin: 1rem 0;"><img src="${img.url}" style="max-width: 100%; border-radius: 8px;" alt="${img.title}"><p style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">${img.title}</p></div>`;
            });
            body += '</div>';
        }

        if (msg.media.videos.length > 0) {
            body += '<div style="margin-top: 1.5rem;"><h4>🎬 Videos:</h4>';
            msg.media.videos.forEach(video => {
                body += `<p><a href="${video.url}" target="_blank" style="color: var(--primary);">${video.title}</a></p>`;
            });
            body += '</div>';
        }

        if (msg.media.files.length > 0) {
            body += '<div style="margin-top: 1.5rem;"><h4>📄 Archivos:</h4>';
            msg.media.files.forEach(file => {
                body += `<p><a href="${file.url}" download style="color: var(--primary);">📥 ${file.name}</a></p>`;
            });
            body += '</div>';
        }

        if (msg.links.length > 0) {
            body += '<div style="margin-top: 1.5rem;"><h4>🔗 Enlaces:</h4>';
            msg.links.forEach(link => {
                body += `<p><a href="${link.url}" target="_blank" style="color: var(--primary);">${link.text}</a></p>`;
            });
            body += '</div>';
        }

        document.getElementById('modalBody').innerHTML = body;
        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('contentModal').classList.remove('active');
    }

    toggleCategory(cat) {
        const index = this.activeCategories.indexOf(cat);
        if (index > -1) {
            this.activeCategories.splice(index, 1);
        } else {
            this.activeCategories.push(cat);
        }
        this.render();
    }

    toggleType(type) {
        const index = this.activeTypes.indexOf(type);
        if (index > -1) {
            this.activeTypes.splice(index, 1);
        } else {
            this.activeTypes.push(type);
        }
        this.render();
    }

    search() {
        this.currentSearch = document.getElementById('searchInput').value;
        this.render();
    }

    clearFilters() {
        this.activeCategories = [];
        this.activeTypes = [];
        this.currentSearch = '';
        document.getElementById('searchInput').value = '';
        this.render();
    }

    toggleViewMode() {
        this.currentView = this.currentView === 'grid' ? 'list' : 'grid';
        this.setViewMode(this.currentView);
    }

    setViewMode(mode) {
        this.currentView = mode;
        document.querySelectorAll('.view-toggle').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === mode) {
                btn.classList.add('active');
            }
        });
        this.renderContent();
    }

    updateStats() {
        document.getElementById('resultCount').textContent = this.filteredMessages.length;
        document.getElementById('totalCount').textContent = this.allMessages.length;
    }

    showEmptyState() {
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('contentGrid').style.display = 'none';
        document.getElementById('contentList').style.display = 'none';
    }

    // Helper methods
    getTitleFromMessage(msg) {
        if (msg.text.length < 60) return msg.text;
        const words = msg.text.split(' ');
        let title = '';
        for (let word of words) {
            if ((title + word).length < 60) {
                title += word + ' ';
            } else {
                break;
            }
        }
        return title.trim() + '...';
    }

    getCategoryLabel(cat) {
        const labels = {
            'tutoriales': '📚 Tutoriales',
            'recursos': '🛠️ Recursos',
            'enlaces': '🔗 Enlaces',
            'videos': '🎬 Videos',
            'preguntas': '❓ Preguntas',
            'anuncios': '📢 Anuncios',
            'ejercicios': '✏️ Ejercicios',
            'código': '💻 Código',
            'discusiones': '💬 Discusiones',
            'eventos': '🎪 Eventos',
            'general': '📌 General',
        };
        return labels[cat] || cat;
    }

    getTypeLabel(type) {
        const labels = {
            'imagen': '🖼️ Imagen',
            'video': '🎬 Video',
            'audio': '🎵 Audio',
            'archivo': '📄 Archivo',
            'enlace': '🔗 Enlace',
            'artículo': '📰 Artículo',
            'mensaje': '💬 Mensaje',
        };
        return labels[type] || type;
    }

    formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (date.toDateString() === today.toDateString()) {
                return `Hoy ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
            } else if (date.toDateString() === yesterday.toDateString()) {
                return 'Ayer';
            } else {
                return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
            }
        } catch (e) {
            return dateStr;
        }
    }

    linkifyText(text) {
        return text.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" target="_blank" style="color: var(--primary);">$1</a>'
        );
    }
}

// Inicializa la app cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AcademyApp();
});
