// Scroll Progress Indicator
window.addEventListener('scroll', function() {
    const scrollProgress = document.getElementById('scrollProgress');
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
});

// Enhanced Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }
});

// Mobile menu toggle
document.getElementById('menuToggle').addEventListener('click', function() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        document.getElementById('navLinks').classList.remove('active');
    });
});

// iOS-Compatible game function
function openGame(gameUrl) {
    const button = event.target;
    const originalText = button.innerHTML;
    
    // Add premium loading state
    button.innerHTML = '<span class="loading"></span> Abriendo juego...';
    button.disabled = true;
    button.style.transform = 'scale(0.98)';
    
    // iOS-compatible link opening
    setTimeout(() => {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = gameUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // For iOS compatibility, append to body and click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Reset button with bounce animation
        button.innerHTML = originalText;
        button.disabled = false;
        button.style.transform = 'scale(1)';
        
        // Show premium notification
        showPremiumNotification('¡Juego abierto! 🎮', 'success');
    }, 800);
}

// Premium notification system
function showPremiumNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgGradient = type === 'success' ? 'var(--gradient-success)' : 'var(--gradient-primary)';
    
    notification.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: ${bgGradient};
        color: white;
        padding: var(--space-4) var(--space-6);
        border-radius: var(--radius-2xl);
        box-shadow: var(--shadow-2xl), var(--glow-primary);
        z-index: 9999;
        transform: translateX(120%) scale(0.8);
        transition: all var(--transition-bounce);
        max-width: 350px;
        font-weight: 600;
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 0.95rem;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Smooth entrance animation
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0) scale(1)';
    });
    
    // Auto-remove with smooth exit
    setTimeout(() => {
        notification.style.transform = 'translateX(120%) scale(0.8)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 400);
    }, 4500);
}

// Enhanced contact form handling
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitButton = this.querySelector('.submit-button');
    const originalText = submitButton.innerHTML;
    
    // Premium loading state
    submitButton.innerHTML = '<span class="loading"></span> Procesando solicitud...';
    submitButton.disabled = true;
    submitButton.style.transform = 'scale(0.98)';
    
    // Get form data
    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    // Create professional mailto link
    const mailtoLink = `mailto:gestionafonia@gmail.com?subject=${encodeURIComponent(`[JuegosLogopedos] ${subject}`)}&body=${encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}\n\n---\nEnviado desde JuegosLogopedos.com\nPlataforma desarrollada por José Aserraf - Gabinete Fönia\n18 años de experiencia en logopedia digital`)}`;
    
    // Professional processing simulation
    setTimeout(() => {
        window.location.href = mailtoLink;
        
        // Reset form with premium animation
        this.reset();
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        submitButton.style.transform = 'scale(1)';
        
        // Premium confirmation
        showPremiumNotification('¡Mensaje preparado exitosamente! Se abrirá tu cliente de email. 📧', 'success');
    }, 1800);
});

// Advanced intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('about-image')) {
                entry.target.classList.add('fade-in-left');
            } else if (entry.target.classList.contains('about-text')) {
                entry.target.classList.add('fade-in-right');
            } else {
                entry.target.classList.add('fade-in-up');
            }
        }
    });
}, observerOptions);

// Observe sections and key elements
document.querySelectorAll('section, .about-image, .about-text').forEach(element => {
    observer.observe(element);
});

// Advanced game card interactions
document.querySelectorAll('.game-card:not(.coming-soon)').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-12px) scale(1.02)';
        this.style.boxShadow = 'var(--shadow-2xl), var(--glow-primary)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.boxShadow = 'var(--shadow-lg)';
    });
});

// Initialize premium features
document.addEventListener('DOMContentLoaded', function() {
    // Welcome message with delay
    setTimeout(() => {
        showPremiumNotification('¡Bienvenido a JuegosLogopedos! Experiencia premium activada 🎮', 'success');
    }, 1500);
    
    // Add stagger animation to game cards
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

// Keyboard shortcuts for accessibility
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('#contacto').scrollIntoView({ behavior: 'smooth' });
        showPremiumNotification('Navegación rápida activada ⚡', 'info');
    }
});

// Performance monitoring
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`JuegosLogopedos cargado en ${Math.round(loadTime)}ms`);
});

// ===== SISTEMA DE BÚSQUEDA Y FILTROS =====

// Variables globales
let currentSearchTerm = '';
let currentCategory = 'all';

// Elementos del DOM
const gameSearch = document.getElementById('gameSearch');
const searchClear = document.getElementById('searchClear');
const filterButtons = document.querySelectorAll('.filter-btn');
const gameCards = document.querySelectorAll('.game-card[data-categories]');
const gamesGrid = document.getElementById('gamesGrid');
const noResults = document.getElementById('noResults');
const resultsCount = document.getElementById('resultsCount');

// Función principal de filtrado
function filterGames() {
    let visibleCount = 0;
    
    gameCards.forEach(card => {
        const categories = card.dataset.categories.split(',');
        const searchTerms = card.dataset.searchTerms.toLowerCase();
        const gameTitle = card.querySelector('.game-title').textContent.toLowerCase();
        const gameDescription = card.querySelector('.game-description').textContent.toLowerCase();
        
        // Verificar categoría
        const categoryMatch = currentCategory === 'all' || categories.includes(currentCategory);
        
        // Verificar búsqueda de texto
        const searchMatch = currentSearchTerm === '' || 
                           searchTerms.includes(currentSearchTerm) ||
                           gameTitle.includes(currentSearchTerm) ||
                           gameDescription.includes(currentSearchTerm);
        
        if (categoryMatch && searchMatch) {
            card.style.display = 'block';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px) scale(0.95)';
            
            // Animación de entrada con delay escalonado
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            }, visibleCount * 100);
            
            visibleCount++;
        } else {
            card.style.transition = 'all 0.3s ease-out';
            card.style.opacity = '0';
            card.style.transform = 'translateY(-20px) scale(0.95)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
    
    // Actualizar contador de resultados
    updateResultsCount(visibleCount);
    
    // Mostrar/ocultar mensaje de "no resultados"
    if (visibleCount === 0) {
        setTimeout(() => {
            noResults.style.display = 'block';
            noResults.style.opacity = '0';
            noResults.style.transform = 'translateY(20px)';
            setTimeout(() => {
                noResults.style.transition = 'all 0.6s ease-out';
                noResults.style.opacity = '1';
                noResults.style.transform = 'translateY(0)';
            }, 100);
        }, 400);
    } else {
        noResults.style.transition = 'all 0.3s ease-out';
        noResults.style.opacity = '0';
        noResults.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            noResults.style.display = 'none';
        }, 300);
    }
}

// Actualizar contador de resultados
function updateResultsCount(count) {
    const countText = count === 1 ? '1 juego disponible' : `${count} juegos disponibles`;
    resultsCount.textContent = countText;
    
    // Animación del contador
    resultsCount.style.transform = 'scale(1.1)';
    resultsCount.style.color = 'var(--primary-600)';
    setTimeout(() => {
        resultsCount.style.transition = 'all 0.3s ease-out';
        resultsCount.style.transform = 'scale(1)';
        resultsCount.style.color = 'var(--neural-light)';
    }, 200);
}

// Búsqueda de texto
gameSearch.addEventListener('input', function() {
    currentSearchTerm = this.value.toLowerCase().trim();
    
    // Mostrar/ocultar botón de limpiar
    if (currentSearchTerm.length > 0) {
        searchClear.style.display = 'block';
        searchClear.style.opacity = '1';
    } else {
        searchClear.style.opacity = '0';
        setTimeout(() => {
            searchClear.style.display = 'none';
        }, 200);
    }
    
    // Debounce la búsqueda para mejor rendimiento
    clearTimeout(gameSearch.searchTimeout);
    gameSearch.searchTimeout = setTimeout(() => {
        filterGames();
        
        // Analytics tracking
        if (currentSearchTerm.length > 2) {
            console.log(`Búsqueda realizada: "${currentSearchTerm}"`);
        }
    }, 300);
});

// Limpiar búsqueda
searchClear.addEventListener('click', function() {
    gameSearch.value = '';
    currentSearchTerm = '';
    this.style.opacity = '0';
    setTimeout(() => {
        this.style.display = 'none';
    }, 200);
    
    // Enfocar nuevamente el input
    gameSearch.focus();
    filterGames();
    
    // Notificación
    showPremiumNotification('Búsqueda limpiada 🧹', 'info');
});

// Filtros de categoría
filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Quitar clase active de todos los botones
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.transform = 'scale(1)';
        });
        
        // Añadir clase active al botón actual
        this.classList.add('active');
        this.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.style.transition = 'all 0.3s ease-out';
            this.style.transform = 'scale(1)';
        }, 150);
        
        // Actualizar categoría actual
        currentCategory = this.dataset.category;
        
        // Filtrar juegos
        filterGames();
        
        // Analytics tracking
        console.log(`Filtro seleccionado: ${currentCategory}`);
        
        // Notificación premium
        const categoryName = this.textContent.trim();
        showPremiumNotification(`Filtro aplicado: ${categoryName} 🎯`, 'info');
    });
});

// Función para limpiar todos los filtros
function clearAllFilters() {
    // Limpiar búsqueda
    gameSearch.value = '';
    currentSearchTerm = '';
    searchClear.style.display = 'none';
    
    // Resetear categoría
    currentCategory = 'all';
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === 'all') {
            btn.classList.add('active');
        }
    });
    
    // Filtrar juegos
    filterGames();
    
    // Notificación
    showPremiumNotification('Todos los filtros han sido limpiados 🎮', 'success');
}

// Función para búsqueda por voz (experimental)
function initVoiceSearch() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            gameSearch.value = transcript;
            currentSearchTerm = transcript.toLowerCase().trim();
            filterGames();
            showPremiumNotification(`Búsqueda por voz: "${transcript}" 🎤`, 'success');
        };
        
        recognition.onerror = function(event) {
            console.log('Error en reconocimiento de voz:', event.error);
        };
        
        // Añadir botón de búsqueda por voz (opcional)
        const voiceButton = document.createElement('button');
        voiceButton.innerHTML = '🎤';
        voiceButton.className = 'voice-search-btn';
        voiceButton.style.cssText = `
            position: absolute;
            right: 60px;
            top: 50%;
            transform: translateY(-50%);
            background: var(--gradient-primary);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: var(--shadow-md);
        `;
        
        voiceButton.addEventListener('click', function() {
            recognition.start();
            this.style.transform = 'translateY(-50%) scale(1.1)';
            showPremiumNotification('Escuchando... Habla ahora 🎤', 'info');
        });
        
        document.querySelector('.search-input-wrapper').appendChild(voiceButton);
    }
}

// Inicializar búsqueda por voz si está disponible
initVoiceSearch();

// Shortcuts de teclado para búsqueda
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + F para enfocar búsqueda
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        gameSearch.focus();
        gameSearch.select();
        showPremiumNotification('Modo búsqueda activado 🔍', 'info');
    }
    
    // Escape para limpiar búsqueda
    if (e.key === 'Escape' && document.activeElement === gameSearch) {
        clearAllFilters();
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Filtrar juegos al cargar la página
    setTimeout(() => {
        filterGames();
    }, 500);
    
    // Añadir eventos de hover a las tarjetas de juegos
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = 'var(--shadow-2xl), var(--glow-primary)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'var(--shadow-lg)';
        });
    });
});