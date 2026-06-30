/**
 * Parser para extraer y clasificar contenido del export de Telegram
 */

class TelegramParser {
    constructor() {
        this.messages = [];
        this.categories = new Map();
        this.contentTypes = new Set();
    }

    /**
     * Parsea el HTML del export de Telegram
     */
    async parseHTML(htmlText) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const messages = [];
        const divs = doc.querySelectorAll('.message');

        divs.forEach((messageDiv, index) => {
            const message = this.extractMessage(messageDiv, index);
            if (message) {
                messages.push(message);
            }
        });

        return messages;
    }

    /**
     * Extrae información de un mensaje individual
     */
    extractMessage(messageDiv, index) {
        try {
            const message = {
                id: index,
                timestamp: this.extractTimestamp(messageDiv),
                author: this.extractAuthor(messageDiv),
                text: this.extractText(messageDiv),
                media: this.extractMedia(messageDiv),
                type: 'unknown',
                category: 'general',
                links: this.extractLinks(messageDiv),
                mentions: this.extractMentions(messageDiv),
            };

            // Clasificar mensaje
            message.type = this.classifyContentType(message);
            message.category = this.classifyCategory(message);

            return message;
        } catch (e) {
            console.error('Error parsing message:', e);
            return null;
        }
    }

    /**
     * Extrae timestamp del mensaje
     */
    extractTimestamp(messageDiv) {
        const timeDiv = messageDiv.querySelector('.pull_right.date');
        if (timeDiv) {
            return timeDiv.getAttribute('title') || timeDiv.textContent.trim();
        }
        return new Date().toISOString();
    }

    /**
     * Extrae autor del mensaje
     */
    extractAuthor(messageDiv) {
        const authorDiv = messageDiv.querySelector('.from_name');
        return authorDiv ? authorDiv.textContent.trim() : 'Desconocido';
    }

    /**
     * Extrae texto del mensaje
     */
    extractText(messageDiv) {
        const textDiv = messageDiv.querySelector('.text');
        if (!textDiv) return '';

        // Limpia el HTML y convierte a texto legible
        const clone = textDiv.cloneNode(true);

        // Convierte enlaces a formato markdown
        clone.querySelectorAll('a').forEach(link => {
            const text = link.textContent;
            const href = link.getAttribute('href');
            link.replaceWith(`[${text}](${href})`);
        });

        return clone.textContent.trim();
    }

    /**
     * Extrae media (imágenes, videos, archivos)
     */
    extractMedia(messageDiv) {
        const media = {
            images: [],
            videos: [],
            files: [],
            audio: [],
            stickers: [],
        };

        // Imágenes
        const imgLinks = messageDiv.querySelectorAll('a.image');
        imgLinks.forEach(link => {
            media.images.push({
                url: link.getAttribute('href'),
                title: link.textContent.trim(),
            });
        });

        // Videos
        const videoLinks = messageDiv.querySelectorAll('a.video');
        videoLinks.forEach(link => {
            media.videos.push({
                url: link.getAttribute('href'),
                title: link.textContent.trim(),
            });
        });

        // Archivos
        const fileLinks = messageDiv.querySelectorAll('a.file');
        fileLinks.forEach(link => {
            media.files.push({
                url: link.getAttribute('href'),
                name: link.textContent.trim(),
            });
        });

        // Audio
        const audioLinks = messageDiv.querySelectorAll('a.audio');
        audioLinks.forEach(link => {
            media.audio.push({
                url: link.getAttribute('href'),
                title: link.textContent.trim(),
            });
        });

        return media;
    }

    /**
     * Extrae enlaces del mensaje
     */
    extractLinks(messageDiv) {
        const links = [];
        const allLinks = messageDiv.querySelectorAll('a');

        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();

            // Filtra enlaces válidos
            if (href && href.startsWith('http')) {
                links.push({ url: href, text: text });
            }
        });

        return links;
    }

    /**
     * Extrae menciones (@usuario)
     */
    extractMentions(messageDiv) {
        const mentions = [];
        const mentionPattern = /@[\w_]+/g;
        const text = messageDiv.textContent;

        const matches = text.match(mentionPattern);
        if (matches) {
            mentions.push(...matches);
        }

        return [...new Set(mentions)];
    }

    /**
     * Clasifica el tipo de contenido
     */
    classifyContentType(message) {
        if (message.media.images.length > 0) return 'imagen';
        if (message.media.videos.length > 0) return 'video';
        if (message.media.audio.length > 0) return 'audio';
        if (message.media.files.length > 0) return 'archivo';
        if (message.links.length > 0) return 'enlace';
        if (message.text.length > 500) return 'artículo';
        return 'mensaje';
    }

    /**
     * Clasifica el mensaje en categoría automáticamente
     */
    classifyCategory(message) {
        const text = message.text.toLowerCase();
        const allContent = `${text} ${message.author.toLowerCase()}`.toLowerCase();

        // Palabras clave por categoría
        const categories = {
            'tutoriales': ['tutorial', 'cómo', 'guía', 'paso a paso', 'aprende', 'enseña', 'instrucciones'],
            'recursos': ['recurso', 'herramienta', 'tool', 'plantilla', 'template', 'descarga', 'pdf', 'documento'],
            'enlaces': ['http', 'link', 'url', 'web', 'sitio', 'blog', 'artículo', 'lee'],
            'videos': ['video', 'youtube', 'vimeo', 'streaming', 'película', 'clip'],
            'preguntas': ['¿', '?', 'pregunta', 'ayuda', 'help', 'cómo puedo', 'dudas'],
            'anuncios': ['anuncio', 'importante', '⚠️', '📢', 'noticia', 'actualización'],
            'ejercicios': ['ejercicio', 'tarea', 'trabajo', 'práctica', 'actividad', 'deber'],
            'código': ['code', 'código', 'javascript', 'python', 'html', 'css', 'react', 'git', '{', '}'],
            'discusiones': ['opinión', 'debate', 'qué opinan', 'ustedes', 'comentarios', 'discusión'],
            'eventos': ['evento', 'webinar', 'taller', 'encuentro', 'live', 'en vivo', 'sesión', 'reunión'],
        };

        // Busca coincidencias
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => allContent.includes(keyword))) {
                return category;
            }
        }

        return 'general';
    }

    /**
     * Procesa un JSON de datos precargados
     */
    loadFromJSON(jsonData) {
        this.messages = jsonData || [];
        this.extractCategories();
        return this.messages;
    }

    /**
     * Extrae todas las categorías únicas
     */
    extractCategories() {
        const categories = new Set();
        const types = new Set();

        this.messages.forEach(msg => {
            categories.add(msg.category);
            types.add(msg.type);
        });

        this.categories = categories;
        this.contentTypes = types;
    }

    /**
     * Filtra mensajes por criterios
     */
    filter(options = {}) {
        let filtered = [...this.messages];

        if (options.categories && options.categories.length > 0) {
            filtered = filtered.filter(msg => options.categories.includes(msg.category));
        }

        if (options.types && options.types.length > 0) {
            filtered = filtered.filter(msg => options.types.includes(msg.type));
        }

        if (options.search) {
            const searchLower = options.search.toLowerCase();
            filtered = filtered.filter(msg =>
                msg.text.toLowerCase().includes(searchLower) ||
                msg.author.toLowerCase().includes(searchLower) ||
                msg.mentions.some(m => m.toLowerCase().includes(searchLower))
            );
        }

        return filtered;
    }

    /**
     * Obtiene estadísticas del contenido
     */
    getStats() {
        const stats = {
            totalMessages: this.messages.length,
            categories: {},
            types: {},
            totalLinks: 0,
            totalImages: 0,
            totalVideos: 0,
            totalFiles: 0,
        };

        this.messages.forEach(msg => {
            stats.categories[msg.category] = (stats.categories[msg.category] || 0) + 1;
            stats.types[msg.type] = (stats.types[msg.type] || 0) + 1;
            stats.totalLinks += msg.links.length;
            stats.totalImages += msg.media.images.length;
            stats.totalVideos += msg.media.videos.length;
            stats.totalFiles += msg.media.files.length;
        });

        return stats;
    }
}

// Exporta el parser
window.TelegramParser = TelegramParser;
