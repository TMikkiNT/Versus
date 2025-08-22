const WS_SERVER = 'ws://192.168.1.120:8080';

function sendCommandToPCs(pcNumbers, command) {
    pcNumbers.forEach(pcNum => {
        try {
            const socket = new WebSocket(WS_SERVER);
            
            socket.onopen = function() {
                socket.send(JSON.stringify({
                    targetPc: pcNum,
                    command: command,
                    from: 'website'
                }));
                socket.close();
            };
            
            socket.onerror = function(error) {
                console.error('WebSocket ошибка:', error);
            };
        } catch (error) {
            console.error('Ошибка отправки команды:', error);
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
    // Определение текущего экрана
    if (document.querySelector('.pc-selection')) {
        initSelectPCScreen();
    } else if (document.getElementById('progressBar')) {
        initWaitScreen();
    } else if (document.getElementById('errorMessage')) {
        initErrorScreen();
    }
});

// ===== ЭКРАН ВЫБОРА ПК =====
function initSelectPCScreen() {
    const state = {
        selectedPCs: [],
        pcIPs: {
            1: '192.168.1.111',
            2: '192.168.1.112',
            3: '192.168.1.113',
            4: '192.168.1.114'
        }
    };

    // Восстановление выбранных ПК
    const savedPCs = localStorage.getItem('selectedPCs');
    if (savedPCs) {
        state.selectedPCs = JSON.parse(savedPCs);
    }

    // Обработчики ПК
    document.querySelectorAll('.pc-item').forEach(item => {
        const pcNum = item.dataset.pc;
        if (state.selectedPCs.includes(pcNum)) {
            item.classList.add('selected');
        }

        item.addEventListener('click', function() {
            const index = state.selectedPCs.indexOf(pcNum);
            if (index > -1) {
                state.selectedPCs.splice(index, 1);
                item.classList.remove('selected');
            } else {
                state.selectedPCs.push(pcNum);
                item.classList.add('selected');
            }
            localStorage.setItem('selectedPCs', JSON.stringify(state.selectedPCs));
        });
    });

    // Кнопка подтверждения
    document.getElementById('confirmBtn').addEventListener('click', function() {
        if (state.selectedPCs.length === 0) {
            alert('Выберите хотя бы один ПК!');
            return;
        }
        window.location.href = 'wait.html';
    });

    // Кнопка назад
    document.getElementById('backBtn').addEventListener('click', function() {
        window.location.href = '../index.html';
    });
}

// ===== ЭКРАН ОЖИДАНИЯ =====
function initWaitScreen() {
    // Восстановление выбранных ПК
    const savedPCs = localStorage.getItem('selectedPCs');
    if (!savedPCs || JSON.parse(savedPCs).length === 0) {
        window.location.href = 'select-pc.html';
        return;
    }
    const selectedPCs = JSON.parse(savedPCs);

    // Элементы интерфейса
    const progressBar = document.getElementById('progressBar');
    const waitTitle = document.getElementById('waitTitle');
    const waitMessage = document.getElementById('waitMessage');

    // Имитация прогресса
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        progressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            finishTranslation(selectedPCs);
        }
    }, 60);
}

// Завершение трансляции
function finishTranslation(selectedPCs) {
    const isSuccess = Math.random() > 0.2; // 80% успеха
    
    if (isSuccess) {
        // Отправка команды на ПК
        sendCommandToPCs(selectedPCs, 'start_streaming');
        
        // Успешное завершение
        document.querySelector('.loading').style.display = 'none';
        document.querySelector('.progress-bar').style.display = 'none';
        
        waitTitle.textContent = 'Успешно!';
        waitMessage.textContent = `Трансляция запущена на ПК: ${selectedPCs.join(', ')}`;
        
        // Отсчет до возврата
        let seconds = 3;
        const countdown = document.createElement('div');
        countdown.className = 'countdown';
        countdown.textContent = `Возврат через: ${seconds} сек.`;
        document.querySelector('.info-text').insertAdjacentElement('afterend', countdown);
        
        const countdownInterval = setInterval(() => {
            seconds--;
            countdown.textContent = `Возврат через: ${seconds} сек.`;
            
            if (seconds <= 0) {
                clearInterval(countdownInterval);
                localStorage.removeItem('selectedPCs');
                window.location.href = '../index.html';
            }
        }, 1000);
    } else {
        // Ошибка
        setTimeout(() => {
            window.location.href = 'error.html';
        }, 500);
    }
}

// ===== ЭКРАН ОШИБКИ =====
function initErrorScreen() {
    document.getElementById('retryBtn').addEventListener('click', function() {
        window.location.href = 'select-pc.html';
    });

    document.getElementById('backToMainBtn').addEventListener('click', function() {
        localStorage.removeItem('selectedPCs');
        window.location.href = '../index.html';
    });
}

// ===== ОТПРАВКА КОМАНД НА ПК =====
function sendCommandToPCs(pcNumbers, command) {
    pcNumbers.forEach(pcNum => {
        const ip = getPCIP(pcNum);
        console.log(`Отправка команды "${command}" на ПК ${pcNum} (${ip})`);
        
        // Реализация отправки команды:
        // 1. WebSocket: const socket = new WebSocket(`ws://${ip}:8080`);
        // 2. HTTP: fetch(`http://${ip}/command`, { method: 'POST', body: command })
        // 3. ADB: adb -s ${ip} shell ${command}
    });
}

function getPCIP(pcNum) {
    const ips = {
        1: '192.168.1.111',
        2: '192.168.1.112',
        3: '192.168.1.113',
        4: '192.168.1.114'
    };
    return ips[pcNum] || '';
}