// 수학 연산 관련 함수들

// 구구단 문제 생성
function generateQuestion() {
    if (gameState.selectedOps.length > 0) {
        // 연산 선택된 경우
        const op = gameState.selectedOps[Math.floor(Math.random() * gameState.selectedOps.length)];
        let num1, num2, questionText, answer;
        
        switch(op) {
            case 'add':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                questionText = `${num1} + ${num2}`;
                answer = num1 + num2;
                break;
            case 'sub':
                num1 = Math.floor(Math.random() * 50) + 20;
                num2 = Math.floor(Math.random() * num1) + 1;
                questionText = `${num1} - ${num2}`;
                answer = num1 - num2;
                break;
            case 'mul':
                if (gameState.selectedDans.length > 0) {
                    // 구구단도 선택된 경우
                    num1 = gameState.selectedDans[Math.floor(Math.random() * gameState.selectedDans.length)];
                    num2 = Math.floor(Math.random() * 9) + 1;
                } else {
                    num1 = Math.floor(Math.random() * 9) + 1;
                    num2 = Math.floor(Math.random() * 9) + 1;
                }
                questionText = `${num1} × ${num2}`;
                answer = num1 * num2;
                break;
            case 'div':
                num2 = Math.floor(Math.random() * 9) + 1;
                answer = Math.floor(Math.random() * 9) + 1;
                num1 = num2 * answer;
                questionText = `${num1} ÷ ${num2}`;
                break;
        }
        
        gameState.currentQuestion = questionText;
        gameState.correctAnswer = answer;
    } else {
        // 구구단만 선택된 경우
        const dan = gameState.selectedDans[Math.floor(Math.random() * gameState.selectedDans.length)];
        const num2 = Math.floor(Math.random() * 9) + 1;
        gameState.currentQuestion = `${dan} × ${num2}`;
        gameState.correctAnswer = dan * num2;
    }
}

// 답 제출 (개선된 버전)
function submitAnswer() {
    const answerInput = document.getElementById('answerInput');
    const userAnswer = parseInt(answerInput.value);
    
    if (isNaN(userAnswer)) {
        // 입력 오류시 힌트 표시
        answerInput.style.borderColor = '#FF0000';
        answerInput.placeholder = '숫자만 입력하세요!';
        setTimeout(() => {
            answerInput.style.borderColor = '#FF69B4';
            answerInput.placeholder = '답은?';
        }, 1000);
        return;
    }
    
    if (userAnswer === gameState.correctAnswer) {
        // 정답! 더 화려한 효과
        gameState.score += 20;
        answerInput.style.borderColor = '#00FF00';
        
        if (gameState.currentEnemy) {
            gameState.currentEnemy.hp -= 1;
            const enemyScreenX = gameState.currentEnemy.x - gameState.cameraX;
            createParticles(enemyScreenX, gameState.currentEnemy.y, 'hit');
            
            if (gameState.currentEnemy.hp <= 0) {
                gameState.currentEnemy.alive = false;
                gameState.score += gameState.currentEnemy.type === 'boss' ? 100 : 50;
                createParticles(enemyScreenX, gameState.currentEnemy.y, 'defeat');
                
                // 몬스터 처치 시 화면 이동 재개
                gameState.isMoving = true;
                
                // 전투 종료
                document.getElementById('questionPanel').style.display = 'none';
                gameState.questionActive = false;
                gameState.currentEnemy = null;
                
                // 성공 메시지
                showFloatingText(jiyul.x, jiyul.y - 50, '완료!', '#00FF00');
            } else {
                // 몬스터가 아직 살아있으면 다음 문제
                generateQuestion();
                updateQuestionPanel();
                showFloatingText(jiyul.x, jiyul.y - 30, '맞았어요!', '#FFD700');
            }
        }
    } else {
        // 오답 - 더 명확한 피드백
        answerInput.style.borderColor = '#FF0000';
        jiyul.hp -= 15;
        createParticles(jiyul.x, jiyul.y, 'hurt');
        showFloatingText(jiyul.x, jiyul.y - 30, `틀렸어요! 정답: ${gameState.correctAnswer}`, '#FF0000');
        
        if (jiyul.hp <= 0) {
            gameOver();
            return;
        }
        
        // 틀렸을 때 힌트 제공
        setTimeout(() => {
            answerInput.style.borderColor = '#FF69B4';
            generateQuestion(); // 새 문제 생성
            updateQuestionPanel();
        }, 1500);
    }
    
    answerInput.value = '';
    answerInput.focus();
    updateUI();
}

// 떠다니는 텍스트 효과 (새 기능)
function showFloatingText(x, y, text, color) {
    const textParticle = {
        x: x,
        y: y,
        text: text,
        color: color,
        life: 60,
        vy: -2,
        alpha: 1.0
    };
    
    // 텍스트 파티클을 별도로 관리
    if (!window.textParticles) {
        window.textParticles = [];
    }
    window.textParticles.push(textParticle);
}

// 텍스트 파티클 업데이트 (render 함수에서 호출해야 함)
function updateTextParticles(ctx) {
    if (!window.textParticles) return;
    
    window.textParticles = window.textParticles.filter(particle => {
        particle.y += particle.vy;
        particle.life--;
        particle.alpha = particle.life / 60;
        
        if (particle.life > 0) {
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.font = 'bold 16px Jua';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeText(particle.text, particle.x, particle.y);
            ctx.fillText(particle.text, particle.x, particle.y);
            ctx.restore();
        }
        
        return particle.life > 0;
    });
}

// 문제 패널 업데이트 (개선된 버전)
function updateQuestionPanel() {
    document.getElementById('questionText').textContent = `✨ ${gameState.currentQuestion} = ?`;
    if (gameState.currentEnemy) {
        const enemyName = gameState.currentEnemy.type === 'boss' ? '👑 보스' : 
                         gameState.currentEnemy.type === 'slime' ? '💧 슬라임' : '👹 고블린';
        document.getElementById('enemyInfo').textContent = 
            `${enemyName} 체력: ${gameState.currentEnemy.hp}/${gameState.currentEnemy.maxHp}`;
    }
    
    // 입력창 스타일 초기화
    const answerInput = document.getElementById('answerInput');
    answerInput.style.borderColor = '#FF69B4';
    answerInput.placeholder = '답은?';
}

// 구구단 선택 함수
function toggleDan(dan) {
    console.log('toggleDan 호출됨, dan:', dan);
    
    const index = gameState.selectedDans.indexOf(dan);
    const button = document.querySelector(`[data-dan="${dan}"]`);
    
    if (!button) {
        console.error('버튼을 찾을 수 없음, dan:', dan);
        return;
    }
    
    if (index === -1) {
        gameState.selectedDans.push(dan);
        button.classList.add('selected');
        console.log('구구단 추가됨:', dan);
    } else {
        gameState.selectedDans.splice(index, 1);
        button.classList.remove('selected');
        console.log('구구단 제거됨:', dan);
    }
    
    console.log('현재 선택된 구구단:', gameState.selectedDans);
    updateSelectedDisplay();
}

// 연산 선택 함수
function toggleOperator(op) {
    console.log('toggleOperator 호출됨, op:', op);
    
    const index = gameState.selectedOps.indexOf(op);
    const button = document.querySelector(`[data-op="${op}"]`);
    
    if (!button) {
        console.error('버튼을 찾을 수 없음, op:', op);
        return;
    }
    
    if (index === -1) {
        gameState.selectedOps.push(op);
        button.classList.add('selected');
        console.log('연산 추가됨:', op);
    } else {
        gameState.selectedOps.splice(index, 1);
        button.classList.remove('selected');
        console.log('연산 제거됨:', op);
    }
    
    console.log('현재 선택된 연산:', gameState.selectedOps);
    updateSelectedDisplay();
}

// 선택한 내용 표시 업데이트
function updateSelectedDisplay() {
    const selectedDansElement = document.getElementById('selectedDans');
    const selectedOpsElement = document.getElementById('selectedOps');
    const startButton = document.getElementById('startGameBtn');
    
    // 구구단 표시
    if (gameState.selectedDans.length > 0) {
        const sortedDans = gameState.selectedDans.sort((a, b) => a - b);
        selectedDansElement.textContent = `선택한 구구단: ${sortedDans.join(', ')}단`;
    } else {
        selectedDansElement.textContent = '선택한 구구단: 없음';
    }
    
    // 연산 표시
    if (gameState.selectedOps.length > 0) {
        const opNames = {
            'add': '더하기',
            'sub': '빼기',
            'mul': '곱하기',
            'div': '나누기'
        };
        const selectedOpNames = gameState.selectedOps.map(op => opNames[op]);
        selectedOpsElement.textContent = `선택한 연산: ${selectedOpNames.join(', ')}`;
    } else {
        selectedOpsElement.textContent = '선택한 연산: 없음';
    }
    
    // 시작 버튼 활성화 조건
    startButton.disabled = gameState.selectedDans.length === 0 && gameState.selectedOps.length === 0;
    
    console.log('선택 표시 업데이트 완료');
    console.log('구구단:', gameState.selectedDans);
    console.log('연산:', gameState.selectedOps);
    console.log('시작 버튼 비활성화:', startButton.disabled);
}

// 게임 시작
function startSelectedGame() {
    if (gameState.selectedDans.length === 0 && gameState.selectedOps.length === 0) {
        alert('구구단이나 연산을 하나 이상 선택해주세요!');
        return;
    }
    
    document.getElementById('selectMenu').style.display = 'none';
    document.getElementById('ui').style.display = 'block';
    
    // UI 텍스트 업데이트
    let displayText = '';
    if (gameState.selectedDans.length > 0) {
        const sortedDans = gameState.selectedDans.sort((a, b) => a - b);
        displayText = sortedDans.join(',') + '단';
    }
    if (gameState.selectedOps.length > 0) {
        const opSymbols = {
            'add': '+',
            'sub': '-',
            'mul': '×',
            'div': '÷'
        };
        const symbols = gameState.selectedOps.map(op => opSymbols[op]).join(',');
        displayText += (displayText ? ' ' : '') + symbols;
    }
    document.getElementById('danText').textContent = displayText;
    
    initGame();
}