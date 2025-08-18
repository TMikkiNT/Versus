// Общий обработчик для всех страниц Steam
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Обработчик кнопки "Назад"
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', handleBack);
        console.log('Back button handler attached');
    }

    // Обработчик кнопки "В главное меню" (для error.html)
    const backToMainBtn = document.getElementById('backToMainBtn');
    if (backToMainBtn) {
        backToMainBtn.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = '../../index.html';
        });
    }

    // Определение текущей страницы
    if (document.querySelector('.action-buttons')) {
        console.log('Initializing Steam page');
        initSteamPage();
    }
    
    if (document.getElementById('gameList')) {
        console.log('Initializing Game Selection page');
        initGameSelection();
    }
    
    if (document.querySelector('.pc-selection')) {
        console.log('Initializing PC Selection page');
        initPCSelection();
    }
    
    if (document.getElementById('progressBar')) {
        console.log('Initializing Wait Screen');
        initWaitScreen();
    }
    
    if (document.getElementById('errorMessage')) {
        console.log('Initializing Error Screen');
        initErrorScreen();
    }
});

// ===== ОБЩИЕ ФУНКЦИИ =====
function handleBack() {
    console.log('Back button clicked');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Для страницы управления Steam возвращаемся в главное меню
    if (currentPage === 'steam.html') {
        window.location.href = '../../index.html';
        return;
    }
    
    // Для остальных страниц стандартное поведение
    if (currentPage === 'select-pc.html') {
        const action = new URLSearchParams(window.location.search).get('action');
        if (action === 'launch') {
            window.location.href = 'select-game.html?action=launch';
        } else {
            window.location.href = 'steam.html';
        }
    } 
    else if (currentPage === 'select-game.html') {
        window.location.href = 'steam.html';
    }
    else {
        window.history.back();
    }
}

// ===== ГЛАВНАЯ СТРАНИЦА STEAM =====
function initSteamPage() {
    console.log('Setting up Steam page actions');
    
    const actionButtons = document.querySelectorAll('.action-btn');
    console.log(`Found ${actionButtons.length} action buttons`);
    
    actionButtons.forEach(btn => {
        const action = btn.getAttribute('data-action');
        console.log(`Button action: ${action}`);
        
        btn.addEventListener('click', function() {
            console.log(`Action button clicked: ${action}`);
            
            if (action === 'launch') {
                window.location.href = 'select-game.html?action=launch';
            } else {
                window.location.href = `select-pc.html?action=${action}`;
            }
        });
    });
}

// ===== СТРАНИЦА ВЫБОРА ИГРЫ =====
function initGameSelection() {
    console.log('Setting up game selection');
    
    // Увеличиваем библиотеку игр для демонстрации прокрутки
    const gameLibrary = [
        { id: 1, name: "Half-Life: Alyx" },
        { id: 2, name: "Beat Saber" },
        { id: 3, name: "Boneworks" },
        { id: 4, name: "Pavlov VR" },
        { id: 5, name: "Superhot VR" },
        { id: 6, name: "The Walking Dead" },
        { id: 7, name: "Skyrim VR" },
        { id: 8, name: "Fallout 4 VR" },
        { id: 9, name: "No Man's Sky" },
        { id: 10, name: "Moss" },
        { id: 11, name: "Lone Echo" },
        { id: 12, name: "Robo Recall" }
    ];

    const gameList = document.getElementById('gameList');
    
    // Восстановление выбранной игры
    const selectedGame = JSON.parse(localStorage.getItem('selectedGame'));
    
    // Загрузка списка игр
    gameLibrary.forEach(game => {
        const gameEl = document.createElement('div');
        gameEl.className = 'game-item';
        gameEl.dataset.id = game.id;
        gameEl.innerHTML = `<div class="game-name">${game.name}</div>`;
        
        // Выделение выбранной игры
        if (selectedGame && selectedGame.id === game.id) {
            gameEl.classList.add('selected');
        }
        
        gameEl.addEventListener('click', function() {
            console.log(`Game selected: ${game.name}`);
            document.querySelectorAll('.game-item').forEach(item => {
                item.classList.remove('selected');
            });
            this.classList.add('selected');
            localStorage.setItem('selectedGame', JSON.stringify(game));
            
            // Автоматический переход к выбору ПК
            setTimeout(() => {
                window.location.href = 'select-pc.html?action=launch';
            }, 300);
        });
        
        gameList.appendChild(gameEl);
    });
}

// ===== СТРАНИЦА ВЫБОРА ПК =====
function initPCSelection() {
    console.log('Setting up PC selection');
    
    const confirmBtn = document.getElementById('confirmActionBtn');
    const pcItems = document.querySelectorAll('.pc-item');
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    console.log(`Action: ${action}`);
    
    let selectedPCs = [];
    try {
        const saved = localStorage.getItem('selectedPCs');
        if (saved) selectedPCs = JSON.parse(saved);
    } catch (e) {
        console.error('Error parsing selectedPCs:', e);
    }
    
    console.log('Saved PCs:', selectedPCs);

    // Восстановление выбранных ПК
    pcItems.forEach(item => {
        const pcNum = item.getAttribute('data-pc');
        
        if (selectedPCs.includes(pcNum)) {
            item.classList.add('selected');
        }
        
        item.addEventListener('click', function() {
            console.log(`PC ${pcNum} clicked`);
            const index = selectedPCs.indexOf(pcNum);
            
            if (index > -1) {
                selectedPCs.splice(index, 1);
                item.classList.remove('selected');
            } else {
                selectedPCs.push(pcNum);
                item.classList.add('selected');
            }
            
            localStorage.setItem('selectedPCs', JSON.stringify(selectedPCs));
            confirmBtn.disabled = selectedPCs.length === 0;
        });
    });
    
    confirmBtn.disabled = selectedPCs.length === 0;
    
    // Подтверждение выбора ПК
    confirmBtn.addEventListener('click', function() {
        console.log('Confirm action button clicked');
        
        if (action === 'launch') {
            const selectedGame = JSON.parse(localStorage.getItem('selectedGame'));
            if (!selectedGame) {
                alert('Выберите игру!');
                return;
            }
        }
        
        window.location.href = `wait.html?action=${action}`;
    });
}

// ===== ЭКРАН ОЖИДАНИЯ =====
function initWaitScreen() {
    console.log('Initializing wait screen');
    
    const steamActions = {
        launch: {
            title: 'Запуск игры',
            message: 'Запуск игры... Пожалуйста подождите',
            success: 'Игра успешно запущена!',
            error: 'Не удалось запустить игру! Проверьте установку игры и запустите ВНОВЬ'
        },
        stop: {
            title: 'Остановка игры',
            message: 'Остановка игры... Пожалуйста подождите',
            success: 'Игра успешно остановлена!',
            error: 'Не удалось остановить игру! Проверьте состояние ПК и запустите ВНОВЬ'
        },
        shutdown: {
            title: 'Выключение SteamVR',
            message: 'Выключение SteamVR... Пожалуйста подождите',
            success: 'SteamVR успешно выключен!',
            error: 'Не удалось выключить SteamVR! Проверьте состояние ПК и запустите ВНОВЬ'
        },
        restart: {
            title: 'Перезапуск Steam',
            message: 'Перезапуск Steam... Пожалуйста подождите',
            success: 'Steam успешно перезапущен!',
            error: 'Не удалось перезапустить Steam! Проверьте состояние ПК и запустите ВНОВЬ'
        }
    };
    
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const actionInfo = steamActions[action] || steamActions.launch;
    
    document.getElementById('waitTitle').textContent = actionInfo.title;
    document.getElementById('waitMessage').textContent = actionInfo.message;
    const progressBar = document.getElementById('progressBar');
    
    // Имитация прогресса
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        progressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            finishAction(action, actionInfo);
        }
    }, 60);
}

function finishAction(action, actionInfo) {
    console.log(`Finishing action: ${action}`);
    const isSuccess = Math.random() > 0.3; // 70% успеха
    
    if (isSuccess) {
        console.log('Action succeeded');
        
        // Показываем экран успеха
        document.getElementById('waitTitle').textContent = 'Успешно!';
        document.getElementById('waitMessage').textContent = actionInfo.success;
        document.querySelector('.loading').style.display = 'none';
        document.querySelector('.progress-bar').style.display = 'none';
        
        // Добавляем иконку успеха
        const successIcon = document.createElement('div');
        successIcon.innerHTML = '✓';
        successIcon.style.cssText = `
            font-size: 80px;
            color: #4CAF50;
            margin: 20px 0;
            text-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
        `;
        document.querySelector('.info-text').insertAdjacentElement('beforebegin', successIcon);
        
        // Добавляем отсчет времени
        const countdown = document.createElement('div');
        countdown.className = 'countdown';
        countdown.textContent = 'Возврат на главный экран через: 3 сек.';
        document.querySelector('.info-text').insertAdjacentElement('afterend', countdown);
        
        // Обновляем отсчет времени
        let seconds = 3;
        const countdownInterval = setInterval(() => {
            seconds--;
            countdown.textContent = `Возврат на главный экран через: ${seconds} сек.`;
            
            if (seconds <= 0) {
                clearInterval(countdownInterval);
                localStorage.removeItem('selectedPCs');
                localStorage.removeItem('selectedGame');
                window.location.href = '../../index.html';
            }
        }, 1000);
    } else {
        console.log('Action failed');
        localStorage.setItem('errorMessage', actionInfo.error);
        window.location.href = 'error.html';
    }
}

// ===== ЭКРАН ОШИБКИ =====
function initErrorScreen() {
    console.log('Initializing error screen');
    
    const errorMessage = document.getElementById('errorMessage');
    const retryBtn = document.getElementById('retryBtn');
    
    const message = localStorage.getItem('errorMessage') || 'Произошла неизвестная ошибка';
    errorMessage.textContent = message;
    
    retryBtn.addEventListener('click', function() {
        console.log('Retry button clicked');
        const action = new URLSearchParams(window.location.search).get('action');
        
        if (action === 'launch') {
            window.location.href = 'select-game.html?action=launch';
        } else if (action) {
            window.location.href = `select-pc.html?action=${action}`;
        } else {
            window.location.href = 'steam.html';
        }
    });
}