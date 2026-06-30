/**
 * Script de conversión: Telegram Export HTML → JSON
 *
 * Uso:
 * node convert-telegram.js <ruta-al-messages.html> <ruta-salida.json>
 *
 * Ejemplo:
 * node convert-telegram.js "./telegram-export/messages.html" "./telegram-data.json"
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

class TelegramHTMLToJSON {
    constructor(htmlPath) {
        this.htmlPath = htmlPath;
        this.messages = [];
    }

    /**
     * Carga y parsea el HTML de Telegram
     */
    async parse() {
        try {
            const htmlContent = fs.readFileSync(this.htmlPath, 'utf-8');
            const dom = new JSDOM(htmlContent);
            const doc = dom.window.document;

            // Busca todos los mensajes
            const messageElements = doc.querySelectorAll('.message');
            console.log(`✅ Se encontraron ${messageElements.length} mensajes`);

            messageElements.forEach((elem, index) => {
                const message = this.extractMessage(elem, index);
                if (message && (message.text || message.media.images.length || message.media.videos.length)) {
                    this.messages.push(message);
                }
            });

            console.log(`📊 Se extrajeron ${this.messages.length} mensajes válidos`);
            return this.messages;
        } catch (error) {
            console.error('❌ Error al parsear HTML:', error.message);
            throw error;
        }
    }

    /**
     * Extrae información de un mensaje individual
     */
    extractMessage(elem, index) {
        try {
            const message = {
                id: index,
                timestamp: this.extractTimestamp(elem),
                author: this.extractAuthor(elem),
                text: this.extractText(elem),
                media: this.extractMedia(elem),
                type: 'unknown',
                category: 'general',
                links: this.extractLinks(elem),
                mentions: this.extractMentions(elem),
            };

            // Clasifica el mensaje
            message.type = this.classifyContentType(message);
            message.category = this.classifyCategory(message);

            return message;
        } catch (error) {
            console.error(`Advertencia al procesar mensaje ${index}:`, error.message);
            return null;
        }
    }

    extractTimestamp(elem) {
        const timeElem = elem.querySelector('.pull_right.date');
        if (timeElem) {
            return timeElem.getAttribute('title') || timeElem.textContent.trim();
        }
        return new Date().toISOString();
    }

    extractAuthor(elem) {
        const authorElem = elem.querySelector('.from_name');
        return authorElem ? authorElem.textContent.trim() : 'Desconocido';
    }

    extractText(elem) {
        const textElem = elem.querySelector('.text');
        if (!textElem) return '';

        let text = '';
        const walker = elem.ownerDocument.createTreeWalker(
            textElem,
            elem.ownerDocument.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            text += node.textContent;
        }

        return text.trim();
    }

    extractMedia(elem) {
        const media = {
            images: [],
            videos: [],
            files: [],
            audio: [],
            stickers: [],
        };

        // Imágenes
        const imgLinks = elem.querySelectorAll('a.image');
        imgLinks.forEach(link => {
            media.images.push({
                url: link.getAttribute('href'),
                title: link.textContent.trim() || 'Imagen',
            });
        });

        // Videos
        const videoLinks = elem.querySelectorAll('a.video');
        videoLinks.forEach(link => {
            media.videos.push({
                url: link.getAttribute('href'),
                title: link.textContent.trim() || 'Video',
            });
        });

        // Archivos
        const fileLinks = elem.querySelectorAll('a.file, a.document');
        fileLinks.forEach(link => {
            media.files.push({
                url: link.getAttribute('href'),
                name: link.textContent.trim() || 'Archivo',
            });
        });

        // Audio
        const audioLinks = elem.querySelectorAll('a.audio, a.voice');
        audioLinks.forEach(link => {
            media.audio.push({
                url: link.getAttribute('href'),
                title: link.textContent.trim() || 'Audio',
            });
        });

        return media;
    }

    extractLinks(elem) {
        const links = [];
        const allLinks = elem.querySelectorAll('a');

        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();

            if (href && href.startsWith('http') && !href.includes('javascript')) {
                links.push({ url: href, text: text || href });
            }
        });

        return links;
    }

    extractMentions(elem) {
        const mentions = [];
        const text = elem.textContent;
        const mentionPattern = /@[\w_]+/g;
        const matches = text.match(mentionPattern);

        if (matches) {
            mentions.push(...new Set(matches));
        }

        return mentions;
    }

    classifyContentType(message) {
        if (message.media.images.length > 0) return 'imagen';
        if (message.media.videos.length > 0) return 'video';
        if (message.media.audio.length > 0) return 'audio';
        if (message.media.files.length > 0) return 'archivo';
        if (message.links.length > 0) return 'enlace';
        if (message.text.length > 500) return 'artículo';
        return 'mensaje';
    }

    classifyCategory(message) {
        const text = message.text.toLowerCase();
        const allContent = `${text} ${message.author.toLowerCase()}`.toLowerCase();

        const categories = {
            'tutoriales': ['tutorial', 'cómo', 'guía', 'paso a paso', 'aprende', 'enseña', 'instrucciones', 'como hacer'],
            'recursos': ['recurso', 'herramienta', 'tool', 'plantilla', 'template', 'descarga', 'pdf', 'documento', 'cheatsheet'],
            'enlaces': ['http', 'link', 'url', 'web', 'sitio', 'blog', 'artículo', 'lee', 'lee aquí'],
            'videos': ['video', 'youtube', 'vimeo', 'streaming', 'película', 'clip', 'canal', 'tutorial en video'],
            'preguntas': ['¿', '?', 'pregunta', 'ayuda', 'help', 'cómo puedo', 'dudas', 'consulta', 'me ayudan'],
            'anuncios': ['anuncio', 'importante', '⚠️', '📢', 'noticia', 'actualización', 'comunicado', 'aviso'],
            'ejercicios': ['ejercicio', 'tarea', 'trabajo', 'práctica', 'actividad', 'deber', 'reto', 'challenge'],
            'código': ['code', 'código', 'javascript', 'python', 'html', 'css', 'react', 'git', '{', '}', 'const', 'function'],
            'discusiones': ['opinión', 'debate', 'qué opinan', 'ustedes', 'comentarios', 'discusión', 'thoughts', 'compartir'],
            'eventos': ['evento', 'webinar', 'taller', 'encuentro', 'live', 'en vivo', 'sesión', 'reunión', 'conferencia'],
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => allContent.includes(keyword))) {
                return category;
            }
        }

        return 'general';
    }

    /**
     * Guarda los mensajes en JSON
     */
    saveJSON(outputPath) {
        try {
            const json = JSON.stringify(this.messages, null, 2);
            fs.writeFileSync(outputPath, json, 'utf-8');
            console.log(`✅ Datos guardados en: ${outputPath}`);
            console.log(`📈 Total de mensajes: ${this.messages.length}`);

            // Imprime estadísticas
            this.printStats();
        } catch (error) {
            console.error('❌ Error al guardar JSON:', error.message);
            throw error;
        }
    }

    printStats() {
        const categories = {};
        const types = {};

        this.messages.forEach(msg => {
            categories[msg.category] = (categories[msg.category] || 0) + 1;
            types[msg.type] = (types[msg.type] || 0) + 1;
        });

        console.log('\n📊 Estadísticas:');
        console.log('Categorías:');
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`  • ${cat}: ${count}`);
        });

        console.log('\nTipos de contenido:');
        Object.entries(types).forEach(([type, count]) => {
            console.log(`  • ${type}: ${count}`);
        });
    }
}

// Ejecución desde línea de comandos
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('❌ Uso: node convert-telegram.js <input.html> <output.json>');
        console.log('\nEjemplo:');
        console.log('  node convert-telegram.js "./telegram-export/messages.html" "./telegram-data.json"');
        process.exit(1);
    }

    const [inputPath, outputPath] = args;

    if (!fs.existsSync(inputPath)) {
        console.error(`❌ No se encontró el archivo: ${inputPath}`);
        process.exit(1);
    }

    console.log(`📂 Procesando: ${inputPath}`);
    console.log(`💾 Salida: ${outputPath}\n`);

    const converter = new TelegramHTMLToJSON(inputPath);
    converter.parse()
        .then(() => {
            converter.saveJSON(outputPath);
            console.log('\n✨ ¡Conversión completada!');
        })
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}

module.exports = TelegramHTMLToJSON;
