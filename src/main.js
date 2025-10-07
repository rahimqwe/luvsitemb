import { toggleFireflies } from './fireflies.js';
document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // КОНСТАНТЫ
    // ============================================
    const DIALOG_SHOW_DURATION = 6000;
    const DIALOG_HIDE_DELAY = 500;
    const TRANSITION_DURATION = 1000;

    // ============================================
    // ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ DOM
    // ============================================
    const elements = {
        bench: document.querySelector('.us_cont'),
        dialogs: [
            document.querySelector('.message-1'),
            document.querySelector('.message-2'),
            document.querySelector('.message-3'),
            document.querySelector('.message-4'),
            document.querySelector('.message-5'),
            document.querySelector('.message-6'),
            document.querySelector('.message-7'),
            document.querySelector('.message-8'),
            document.querySelector('.message-9')
        ].filter(Boolean),
        
        house: document.querySelector('.house_cont'),
        exitButton: document.getElementById('exit-btn'),
        hint: document.querySelector('.hint'),
        overlay: document.querySelector('.transition-overlay'),
        
        candle: document.querySelector('.candle_cont'),
        note: document.querySelector('.note_cont'),
        modal: document.getElementById('note-modal'),
        closeButton: document.querySelector('.close-button > span'),
        
        loadingScreen: document.getElementById('loading-screen'),
        fireflyCanvas: document.getElementById('fireflyCanvas'),
        backgroundMusic: document.getElementById('background-music') // ДОБАВЛЕНО
    };

    // ============================================
    // МОДУЛЬ УПРАВЛЕНИЯ ДИАЛОГАМИ
    // ============================================
    const DialogManager = {
        activeDialog: null,
        availableDialogs: [],
        hideTimeoutId: null,
        showTimeoutId: null,

        init() {
            if (!elements.bench || elements.dialogs.length === 0) {
                console.error('Ошибка: не найден элемент скамейки или диалоги');
                return false;
            }
            this.shuffleDialogs();
            elements.bench.addEventListener('click', () => this.showRandomDialog());
            return true;
        },

        shuffleDialogs() {
            this.availableDialogs = [...elements.dialogs].sort(() => Math.random() - 0.5);
        },

        hideDialog(dialog) {
            if (dialog) {
                dialog.style.opacity = '0';
                dialog.style.visibility = 'hidden';
            }
        },

        showDialog(dialog) {
            if (dialog) {
                dialog.style.visibility = 'visible';
                dialog.style.opacity = '1';
            }
        },

        clearTimers() {
            clearTimeout(this.hideTimeoutId);
            clearTimeout(this.showTimeoutId);
        },

        showRandomDialog() {
            this.clearTimers();

            if (this.activeDialog) {
                this.hideDialog(this.activeDialog);
            }

            if (this.availableDialogs.length === 0) {
                this.shuffleDialogs();
            }
            const newDialog = this.availableDialogs.pop();

            if (!newDialog) {
                console.warn('Не удалось выбрать новый диалог');
                return;
            }

            const delay = this.activeDialog ? DIALOG_HIDE_DELAY : 0;
            
            this.showTimeoutId = setTimeout(() => {
                this.showDialog(newDialog);
                this.activeDialog = newDialog;

                this.hideTimeoutId = setTimeout(() => {
                    if (this.activeDialog === newDialog) {
                        this.hideDialog(newDialog);
                        this.activeDialog = null;
                    }
                }, DIALOG_SHOW_DURATION);
            }, delay);
        }
    };

    // ============================================
    // МОДУЛЬ УПРАВЛЕНИЯ ПЕРЕХОДАМИ СЦЕН
    // ============================================
    const SceneManager = {
    isInside: false,

    init() {
        if (!elements.house || !elements.exitButton || !elements.overlay) {
            console.error('Ошибка: не найдены элементы сцены');
            return false;
        }

        // Предзагрузка изображения интерьера
        this.preloadInteriorImage();

        elements.house.addEventListener('click', () => this.transition('enter'));
        elements.exitButton.addEventListener('click', () => this.transition('exit'));
        return true;
    },

    preloadInteriorImage() {
        const img = new Image();
        img.src = 'textures/inside.jpeg';
        img.onload = () => console.log('✅ Интерьер предзагружен');
    },

    enterHouse() {
        this.isInside = true;

        // Batch DOM updates
        requestAnimationFrame(() => {
            elements.candle?.classList.remove('candle_hidden');
            elements.note?.classList.remove('note_hidden');
            elements.exitButton?.classList.remove('hidden');
            elements.hint?.classList.add('hidden');
        });

        // Останавливаем анимацию светлячков
        toggleFireflies(false);
    },

    exitHouse() {
        this.isInside = false;

        requestAnimationFrame(() => {
            elements.candle?.classList.add('candle_hidden');
            elements.note?.classList.add('note_hidden');
            elements.exitButton?.classList.add('hidden');
            elements.hint?.classList.remove('hidden');
        });

        // Возобновляем анимацию светлячков
        toggleFireflies(true);
    },

    transition(direction) {
        // Блокируем повторные клики
        if (elements.overlay.classList.contains('active')) return;

        elements.overlay.classList.add('active');

        setTimeout(() => {
            if (direction === 'enter') {
                this.enterHouse();
            } else {
                this.exitHouse();
            }

            elements.overlay.classList.remove('active');
        }, TRANSITION_DURATION);
    }
};


    // ============================================
    // МОДУЛЬ УПРАВЛЕНИЯ МОДАЛЬНЫМ ОКНОМ
    // ============================================
    const ModalManager = {
        init() {
            if (!elements.note || !elements.modal || !elements.closeButton) {
                console.error('Ошибка: не найдены элементы модального окна');
                return false;
            }

            elements.note.addEventListener('click', () => this.open());
            elements.closeButton.addEventListener('click', () => this.close());
            
            // Оптимизация: закрытие только по клику на overlay
            elements.modal.addEventListener('click', (e) => {
                if (e.target === elements.modal) {
                    this.close();
                }
            });
            
            return true;
        },

        open() {
            elements.modal.classList.remove('modal_hidden');
            // Блокируем прокрутку body
            document.body.style.overflow = 'hidden';
        },

        close() {
            elements.modal.classList.add('modal_hidden');
            // Возвращаем прокрутку
            document.body.style.overflow = '';
        }
    };
    const AudioManager = {
        init() {
            const loaderButton = document.querySelector('.loader_button_span');
            // Добавляем обработчик на любой клик на документе, чтобы запустить музыку
            loaderButton.addEventListener('click', this.playBackgroundMusicOnce, { once: true });
        },

        playBackgroundMusicOnce() {
            if (elements.backgroundMusic) {
                elements.backgroundMusic.volume = 0.01; // Установите громкость (0.0 до 1.0)
                elements.backgroundMusic.play().catch(error => {
                    console.warn("Автовоспроизведение музыки заблокировано браузером:", error);
                    // Здесь можно показать кнопку "Включить звук", если нужно
                });
            }
        },

        playBackgroundMusic() { // Функция для ручного запуска, если нужно
            if (elements.backgroundMusic && elements.backgroundMusic.paused) {
                elements.backgroundMusic.play();
            }
        },

        pauseBackgroundMusic() { // Функция для паузы
            if (elements.backgroundMusic && !elements.backgroundMusic.paused) {
                elements.backgroundMusic.pause();
            }
        },

        setVolume(volume) { // Функция для изменения громкости
            if (elements.backgroundMusic) {
                elements.backgroundMusic.volume = volume;
            }
        }
    };

    // ============================================
    // ИНИЦИАЛИЗАЦИЯ ВСЕХ МОДУЛЕЙ
    // ============================================
    const initSuccess = [
        DialogManager.init(),
        SceneManager.init(),
        ModalManager.init(),
        AudioManager.init()
    ].every(Boolean);

    if (initSuccess) {
        console.log('✅ Все модули инициализированы');
    }
    const loaderButton = document.querySelector('.loader_button_span');
    loaderButton.addEventListener('click', () => {
        elements.loadingScreen.classList.add('hidden');

    });
});