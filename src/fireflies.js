// fireflies.js
// --- Настройки (УВЕЛИЧЕНЫ для лучшей видимости) ---
const NUM_PARTICLES = 50; 
const MIN_RADIUS = 1.0;   
const MAX_RADIUS = 3.0;   
const COLOR = '255, 255, 200'; 
const MIN_SPEED = 0.1;    
const MAX_SPEED = 0.5;    

// --- Класс для одной частицы ---
class Particle {
    constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.radius = Math.random() * (MAX_RADIUS - MIN_RADIUS) + MIN_RADIUS;
        this.vx = (Math.random() - 0.5) * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
        this.vy = (Math.random() - 0.5) * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
        this.initialOpacity = Math.random();
        this.timeOffset = Math.random() * 100;
    }

    update(w, h) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
        const currentMs = Date.now() / 500;
        this.opacity = this.initialOpacity + Math.sin(currentMs + this.timeOffset) * 0.4;
        this.opacity = Math.max(0.1, Math.min(1.0, this.opacity));
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${COLOR}, ${this.opacity})`;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = this.radius * 7; 
        ctx.shadowColor = `rgba(${COLOR}, ${this.opacity})`;
    }
}

// --- Инициализация и цикл анимации ---
const canvas = document.getElementById('fireflyCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let W, H;
let animationFrameId = null; // Будет хранить ID текущего requestAnimationFrame
let isRunning = false; // Изначально анимация не запущена, ждем команды

function resizeCanvas() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    
    particles = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push(new Particle(W, H));
    }
}

export function toggleFireflies(show) {
    // Получаем canvas здесь, чтобы не зависеть от elements в main.js
    const canvas = document.getElementById('fireflyCanvas');
    if (!canvas) return; // Выходим, если canvas не найден

    // Устанавливаем флаг
    isRunning = show;

    // Управление видимостью/прозрачностью Canvas
    canvas.style.transition = 'opacity 0.5s ease-in-out';
    canvas.style.opacity = show ? '1' : '0';
    
    if (show) {
        canvas.style.display = 'block'; // Показываем перед появлением
        if (!animationFrameId) { // Запускаем анимацию, только если она не запущена
            animate();
        }
    } else {
        // После завершения анимации opacity, полностью скрываем элемент
        setTimeout(() => {
            if (!isRunning) { // Убедиться, что состояние не изменилось
                canvas.style.display = 'none';
            }
        }, 500); // Соответствует transition-duration
    }
}

function animate() {
    if (!isRunning) {
        // Если анимация должна быть остановлена, отменяем следующий кадр
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null; // Сбрасываем ID
        return; 
    }

    ctx.clearRect(0, 0, W, H);
    ctx.shadowBlur = 0; 
    
    for (const p of particles) {
        p.update(W, H);
        p.draw(ctx);
    }

    animationFrameId = requestAnimationFrame(animate); // Сохраняем ID
}

// События
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Инициализация размеров Canvas

// --- Анимация луны (оставлена без изменений) ---
const moon = document.getElementById('moon');
if (moon) {
    let moon_x_offset = 0;
    let moon_y_offset = 0;
    const MOON_SPEED_X = 0.005;
    const MOON_SPEED_Y = 0.002;

    function animateMoon() {
        moon_x_offset += MOON_SPEED_X;
        moon_y_offset += MOON_SPEED_Y;
        moon.style.transform = `translate(${moon_x_offset}px, ${moon_y_offset}px)`;
        requestAnimationFrame(animateMoon);
    }
    animateMoon();
}

// Изначально запускаем светлячков
toggleFireflies(true);