// 게임 로직 관련 함수들

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// 픽셀 스케일과 물리 상수
let PIXEL_SCALE = 3;
const GRAVITY = 0.8;
const JUMP_POWER = -18;
const JUMP_FORWARD_SPEED = 6;
let GROUND_Y = 240; // 동적으로 변경됨

// 모바일 감지 함수
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0);
}

// 디바이스별 점프 파워 계산
function getJumpPower() {
    if (isMobileDevice()) {
        // 모바일에서는 점프 파워를 줄임
        return -14;
    } else {
        // PC에서는 기본 점프 파워
        return -18;
    }
}

// 게임 상태 먼저 초기화
let gameState = {
    running: false,
    score: 0,
    stage: 1,
    selectedDans: [],
    selectedOps: [],
    selectedCharacter: 'jiyul',
    distance: 0,
    speed: 4,
    questionActive: false,
    currentEnemy: null,
    backgroundOffset: 0,
    currentQuestion: '',
    correctAnswer: 0,
    isMoving: true,
    cameraX: 0,
    screenShake: 0,
    shakeTimer: 0,
    mountEnabled: false  // 탑승 기능 사용 여부
};

// 플레이어 캐릭터 초기화
let player = {
    x: 100,
    y: 240,
    worldX: 100,
    width: 16 * PIXEL_SCALE,
    height: 16 * PIXEL_SCALE,
    hp: 100,
    animFrame: 0,
    animTimer: 0,
    sprite: 'jiyul',
    velocityY: 0,
    velocityX: 0,
    isJumping: false,
    onGround: true,
    runSpeed: 4
};

// 게임 오브젝트들
let obstacles = [];
let enemies = [];

// 캔버스 크기 조정 (모바일 가로 최적화)
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    const controls = document.getElementById('controls');
    const controlsHeight = controls ? controls.offsetHeight : 0;
    
    // 실제 화면 크기 가져오기
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - controlsHeight;
    
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    
    // 모바일 가로 모드 감지
    if (screenWidth > screenHeight) {
        // 가로 모드 - 픽셀 스케일 조정
        PIXEL_SCALE = Math.floor(screenHeight / 120); // 화면 높이에 맞춰 스케일 조정
        if (PIXEL_SCALE < 2) PIXEL_SCALE = 2;
        if (PIXEL_SCALE > 4) PIXEL_SCALE = 4;
    } else {
        // 세로 모드
        PIXEL_SCALE = 3;
    }
    
    // 캐릭터 크기 재조정
    if (player) {
        player.width = 16 * PIXEL_SCALE;
        player.height = 16 * PIXEL_SCALE;
    }
    
    // 바닥 위치 재조정
    GROUND_Y = screenHeight - (screenHeight * 0.25);
    
    // 플레이어 위치 조정 (gameState가 존재할 때만)
    if (player && gameState && !gameState.questionActive) {
        player.y = GROUND_Y;
    }
}

// 전체화면 기능
function toggleFullscreen() {
    // iOS 감지
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        // iOS에서는 풀스크린 대신 안내 메시지 표시
        showIOSFullscreenGuide();
        return;
    }
    
    // 안드로이드 및 기타 브라우저
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        
        // 화면 방향 잠금 시도
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {});
        }
        
        document.getElementById('fullscreenBtn').textContent = 'EXIT';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        document.getElementById('fullscreenBtn').textContent = 'FULL';
    }
}

// iOS 풀스크린 가이드 표시
function showIOSFullscreenGuide() {
    const guideDiv = document.createElement('div');
    guideDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #FF69B4, #FFB6C1);
        color: white;
        padding: 30px;
        border: 3px solid #FFF;
        border-radius: 20px;
        font-size: 16px;
        z-index: 10000;
        font-family: 'Jua', sans-serif;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        box-shadow: 0 5px 20px rgba(0,0,0,0.5);
        text-align: center;
        line-height: 1.8;
        max-width: 90vw;
    `;
    
    guideDiv.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 20px;">🍎 아이폰 사용자님께 🍎</div>
        <div style="margin-bottom: 20px;">
            전체화면으로 플레이하시려면:<br><br>
            1. Safari 하단의 <span style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 10px;">공유 버튼</span>을 누르세요<br>
            2. <span style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 10px;">"홈 화면에 추가"</span>를 선택하세요<br>
            3. 홈 화면에서 앱처럼 실행하세요!
        </div>
        <button onclick="this.parentElement.remove()" style="
            background: linear-gradient(135deg, #32CD32, #90EE90);
            border: 3px solid #FFF;
            color: white;
            padding: 15px 30px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            font-family: 'Jua', sans-serif;
            border-radius: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        ">확인</button>
    `;
    
    document.body.appendChild(guideDiv);
    
    // 5초 후 자동으로 사라짐
    setTimeout(() => {
        if (guideDiv.parentElement) {
            guideDiv.remove();
        }
    }, 5000);
}

// iOS 체크 함수 추가
function checkIOSFullscreen() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true;
    
    if (isIOS && !isStandalone) {
        // 풀스크린 버튼 텍스트 변경
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.textContent = '🏠추가';
        }
    }
}

// 게임 시작 시 iOS 체크 추가
window.addEventListener('load', checkIOSFullscreen);

// 게임 초기화
function initGame() {
    gameState.running = true;
    gameState.score = 0;
    gameState.stage = 1;
    gameState.distance = 0;
    gameState.speed = 4;
    gameState.questionActive = false;
    gameState.isMoving = true;
    gameState.cameraX = 0;

    document.getElementById('questionPanel').style.display = 'none';
    
    // 선택된 캐릭터로 플레이어 초기화
    player.sprite = gameState.selectedCharacter;
    player.x = 100;
    player.worldX = 100;
    player.y = GROUND_Y;
    player.hp = 100;
    player.velocityY = 0;
    player.velocityX = 0;
    player.onGround = true;
    player.isJumping = false;
    
    // 파티클 초기화
    if (typeof clearParticles === 'function') {
        clearParticles();
    }
    
    // 탑승 시스템 초기화
    if (typeof initMountSystem === 'function') {
        initMountSystem();
    }
    
    generateLevel();
    gameLoop();
    updateUI();
}

// 레벨 생성
function generateLevel() {
    obstacles = [];
    enemies = [];

    // 장애물 배치 (더 많이, 더 전략적으로)
    const obstacleSpacing = 200 + Math.random() * 150;
    for (let i = 0; i < 12; i++) {
        const types = ['rock', 'spike', 'pipe'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        obstacles.push({
            x: 600 + i * obstacleSpacing,
            y: GROUND_Y,
            width: 16 * PIXEL_SCALE,
            height: 16 * PIXEL_SCALE,
            type: type,
            passed: false
        });
    }

    // 몬스터 배치 (무한 생성)
    generateMoreEnemies();
}

// 몬스터 무한 생성 함수 추가
function generateMoreEnemies() {
    const currentMaxX = Math.max(...enemies.map(e => e.x), player.worldX);
    const startX = Math.max(currentMaxX + 300, player.worldX + 800);
    
    // 새로운 몬스터들 추가
    for (let i = 0; i < 5; i++) {
        const baseSpeed = 1.5 + (gameState.stage - 1) * 0.5;
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        enemies.push({
            x: startX + i * 400 + Math.random() * 200,
            y: GROUND_Y,
            width: 16 * PIXEL_SCALE,
            height: 16 * PIXEL_SCALE,
            hp: 1,
            maxHp: 1,
            type: Math.random() > 0.5 ? 'slime' : 'goblin',
            alive: true,
            animFrame: 0,
            velocityY: 0,
            velocityX: 0,
            isMoving: true,
            walkSpeed: baseSpeed,
            direction: direction,
            isJumping: false,
            onGround: true,
            jumpCooldown: 0,
            patrolStart: startX + i * 400,
            patrolRange: 150
        });
    }

    // 가끔 보스도 추가
    if (Math.random() < 0.3) {
        const bossX = startX + 1000;
        enemies.push({
            x: bossX,
            y: GROUND_Y,
            width: 16 * PIXEL_SCALE,
            height: 16 * PIXEL_SCALE,
            hp: 1, // 보스는 한 번의 문제로 처치
            maxHp: 1,
            type: 'boss',
            alive: true,
            animFrame: 0,
            velocityY: 0,
            velocityX: 0,
            isJumping: false,
            onGround: true,
            jumpCooldown: 0,
            isMoving: true,
            walkSpeed: 1 + gameState.stage * 0.3,
            direction: -1,
            patrolStart: bossX,
            patrolRange: 200,
            aggroRange: 300,
            isAggro: false
        });
    }
}

// 메인 게임 루프
function gameLoop() {
    if (!gameState.running) return;

    update();
    render();
    requestAnimationFrame(gameLoop);
}

// 게임 업데이트
function update() {
    // 화면이 움직일 때만 거리와 배경 업데이트
    if (gameState.isMoving && !gameState.questionActive) {
        gameState.distance += gameState.speed;
        gameState.backgroundOffset += gameState.speed * 0.5; // 양수로 증가
        gameState.cameraX += gameState.speed;
        
        // 플레이어도 자동으로 앞으로 이동
        player.worldX += gameState.speed;
    }

    // 화면 흔들림 효과 업데이트
    if (gameState.shakeTimer > 0) {
        gameState.shakeTimer--;
        gameState.screenShake = Math.sin(gameState.shakeTimer * 0.5) * (gameState.shakeTimer / 10);
    } else {
        gameState.screenShake = 0;
    }

    // 플레이어 물리 업데이트
    updatePlayerPhysics();
    
    // 몬스터 물리 업데이트
    updateEnemyPhysics();
    
    // 탑승 시스템 업데이트
    if (typeof updateMountSystem === 'function') {
        updateMountSystem();
        updateMountButton();
    }
    
    checkCollisions();
    updateAnimations();
    
    // 파티클 업데이트 (파티클 시스템이 로드되었을 때만)
    if (typeof updateParticles === 'function') {
        updateParticles();
    }

    // 죽은 적들 정리 (화면 뒤로 많이 간 적들도 정리)
    enemies = enemies.filter(enemy => 
        enemy.alive && (enemy.x > gameState.cameraX - 500)
    );

    // 새로운 몬스터 생성 (앞쪽에 몬스터가 부족하면)
    const aheadEnemies = enemies.filter(enemy => 
        enemy.x > player.worldX && enemy.x < player.worldX + 2000
    );
    
    if (aheadEnemies.length < 3) {
        generateMoreEnemies();
    }
    
    // 거리 기반 스테이지 업그레이드
    if (gameState.distance > gameState.stage * 3000) {
        // 20스테이지에서 엔딩
        if (gameState.stage >= 20) {
            showEnding();
            return;
        }
        nextStage();
    }
}

// 플레이어 물리 업데이트
function updatePlayerPhysics() {
    // 중력 적용
    if (!player.onGround) {
        player.velocityY += GRAVITY;
    }
    
    // Y축 이동
    player.y += player.velocityY;
    
    // X축 이동 (점프나 조작 시)
    if (player.velocityX !== 0) {
        player.worldX += player.velocityX;
        // 마찰력 적용 (점프 중에는 덜 적용)
        const friction = player.isJumping ? 0.98 : 0.92;
        player.velocityX *= friction;
        if (Math.abs(player.velocityX) < 0.1) {
            player.velocityX = 0;
        }
    }
    
    // 바닥 충돌 체크
    if (player.y >= GROUND_Y) {
        player.y = GROUND_Y;
        player.velocityY = 0;
        player.onGround = true;
        player.isJumping = false;
        
        // 착지 시 파티클 효과
        if (player.velocityX > 2 && typeof createParticles === 'function') {
            createParticles(player.x, player.y, 'hint');
        }
    }
    
    // 화면의 1/4 지점에 고정된 위치 설정 (더 뒤로 이동)
    const targetScreenX = canvas.width / 4;
    player.x = targetScreenX;
    
    // 카메라를 플레이어의 월드 위치에 맞춰 조정 (플레이어는 계속 오른쪽으로 진행)
    gameState.cameraX = player.worldX - targetScreenX;
}

// 몬스터 물리 처리 (대폭 개선)
function updateEnemyPhysics() {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        const enemyScreenX = enemy.x - gameState.cameraX;
        
        // 화면 범위 내에서만 활동
        if (enemyScreenX > -200 && enemyScreenX < canvas.width + 200) {
            
            // 보스의 경우 플레이어 추적
            if (enemy.type === 'boss') {
                const distanceToPlayer = Math.abs(enemy.x - player.worldX);
                
                if (distanceToPlayer < enemy.aggroRange) {
                    enemy.isAggro = true;
                    // 플레이어 방향으로 이동
                    if (enemy.x > player.worldX) {
                        enemy.direction = -1;
                    } else {
                        enemy.direction = 1;
                    }
                    enemy.walkSpeed = 2 + gameState.stage * 0.3;
                } else {
                    enemy.isAggro = false;
                    enemy.walkSpeed = 1 + gameState.stage * 0.2;
                }
            }
            
            // 일반 몬스터 패트롤 움직임
            if (enemy.isMoving && !gameState.questionActive) {
                enemy.x += enemy.walkSpeed * enemy.direction;
                
                // 패트롤 범위 체크
                if (enemy.patrolStart && enemy.patrolRange) {
                    if (enemy.x <= enemy.patrolStart - enemy.patrolRange || 
                        enemy.x >= enemy.patrolStart + enemy.patrolRange) {
                        enemy.direction *= -1; // 방향 반전
                    }
                }
                
                // 랜덤 점프 (20% 확률)
                if (Math.random() < 0.005 && enemy.onGround && enemy.jumpCooldown <= 0) {
                    enemy.velocityY = JUMP_POWER * 0.7;
                    enemy.isJumping = true;
                    enemy.onGround = false;
                    enemy.jumpCooldown = 90 + Math.random() * 60;
                }
            }
        }
        
        // 점프 쿨다운 감소
        if (enemy.jumpCooldown > 0) {
            enemy.jumpCooldown--;
        }
        
        // 몬스터 중력 적용
        if (!enemy.onGround) {
            enemy.velocityY += GRAVITY;
            enemy.y += enemy.velocityY;
            
            // 바닥 충돌
            if (enemy.y >= GROUND_Y) {
                enemy.y = GROUND_Y;
                enemy.velocityY = 0;
                enemy.onGround = true;
                enemy.isJumping = false;
            }
        }
    });
}

// 충돌 체크 (개선된 버전)
function checkCollisions() {
    // 장애물과의 충돌
    obstacles.forEach(obstacle => {
        const obstacleScreenX = obstacle.x - gameState.cameraX;
        
        // 화면에 있는 장애물만 체크
        if (obstacleScreenX > -100 && obstacleScreenX < canvas.width + 100) {
            
            // 플레이어 월드 좌표로 충돌 체크
            if (checkBoxCollision(
                {x: player.worldX, y: player.y, width: player.width, height: player.height},
                {x: obstacle.x, y: obstacle.y, width: obstacle.width, height: obstacle.height}
            )) {
                // spike는 데미지를 입힘
                if (obstacle.type === 'spike' && !obstacle.passed) {
                    obstacle.passed = true;
                    if (typeof createParticles === 'function') {
                        createParticles(player.x, player.y, 'hint'); // hurt → hint로 변경
                    }
                    
                    // 통과 보너스 점수 (데미지 제거)
                    gameState.score += 5;
                    updateUI();
                }
                // 다른 장애물은 점프 중이 아닐 때만 막힘
                else if (obstacle.type !== 'spike' && player.onGround) {
                    // 장애물 앞에서 멈춤 (바닥에 있을 때만)
                    player.worldX = obstacle.x - player.width - 5;
                    player.velocityX = 0;
                    
                    // 화면 이동 정지
                    gameState.isMoving = false;
                    
                    // 약간의 충돌 효과
                    gameState.shakeTimer = 10;
                    
                    // 점프로만 넘어갈 수 있도록 힌트
                    if (Math.random() < 0.01 && typeof createParticles === 'function') { // 가끔 힌트 표시
                        createParticles(player.x, player.y - 30, 'hint');
                    }
                }
            } else {
                // 장애물을 넘어갔으면 다시 이동 시작
                if (player.worldX > obstacle.x + obstacle.width && !obstacle.passed) {
                    obstacle.passed = true;
                    gameState.isMoving = true;
                    gameState.score += 10; // 장애물 통과 보너스
                    if (typeof createParticles === 'function') {
                        createParticles(player.x, player.y - 20, 'hint'); // 성공 파티클
                    }
                    updateUI();
                }
            }
        }
    });
    
    // 적과의 충돌
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        const enemyScreenX = enemy.x - gameState.cameraX;
        
        if (enemyScreenX > -100 && enemyScreenX < canvas.width + 100) {
            if (checkBoxCollision(
                {x: player.worldX, y: player.y, width: player.width, height: player.height},
                {x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height}
            )) {
                // 문제 출제
                if (!gameState.questionActive) {
                    gameState.questionActive = true;
                    gameState.currentEnemy = enemy;
                    gameState.isMoving = false; // 전투 중에는 화면 정지
                    generateQuestion();
                    updateQuestionPanel();
                    document.getElementById('questionPanel').style.display = 'block';
                    
                    // 입력창 초기화 및 모바일 키보드 완전 차단
                    const answerInput = document.getElementById('answerInput');
                    answerInput.value = '';
                    answerInput.blur(); // 포커스 제거로 모바일 키보드 방지
                    
                    // 추가 보안 조치
                    answerInput.setAttribute('readonly', 'readonly');
                    answerInput.setAttribute('inputmode', 'none');
                    
                    // 모든 포커스 제거
                    document.activeElement.blur();
                }
            }
        }
    });
}

// 박스 충돌 체크
function checkBoxCollision(box1, box2) {
    return box1.x < box2.x + box2.width &&
           box1.x + box1.width > box2.x &&
           box1.y < box2.y + box2.height &&
           box1.y + box1.height > box2.y;
}

// 애니메이션 업데이트
function updateAnimations() {
    // 플레이어 애니메이션 (걷기 애니메이션 추가)
    player.animTimer++;
    if (player.animTimer >= 15) { // 걷기 애니메이션 속도 조절
        player.animFrame = (player.animFrame + 1) % 3; // 0, 1, 2로 순환
        player.animTimer = 0;
    }
    
    // 적 애니메이션
    enemies.forEach(enemy => {
        if (enemy.alive) {
            enemy.animFrame = (enemy.animFrame + 1) % 2;
        }
    });
}

// UI 업데이트
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('stageText').textContent = gameState.stage;
    document.getElementById('hp').textContent = Math.max(0, player.hp);
}

// 렌더링 (카메라 시스템 적용)
function render() {
    // 화면 흔들림 효과 적용
    ctx.save();
    if (gameState.screenShake !== 0) {
        ctx.translate(
            Math.random() * gameState.screenShake - gameState.screenShake / 2,
            Math.random() * gameState.screenShake - gameState.screenShake / 2
        );
    }
    
    // 화면 지우기
    ctx.fillStyle = '#5C94FC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 배경 그리기 (background.js 함수 사용)
    if (typeof drawBackground === 'function') {
        drawBackground(ctx, canvas, gameState);
    }
    
    // 바닥 그리기
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, GROUND_Y + 16 * PIXEL_SCALE, canvas.width, canvas.height);
    
    // 탑승 가능한 캐릭터들 그리기
    if (typeof renderMounts === 'function') {
        renderMounts(ctx);
    }
    
    // 장애물 그리기 (카메라 오프셋 적용)
    obstacles.forEach(obstacle => {
        const screenX = obstacle.x - gameState.cameraX;
        if (screenX > -100 && screenX < canvas.width + 100) {
            const data = pixelData[obstacle.type];
            drawPixelSprite(data.sprite, data.colorMap, screenX, obstacle.y - obstacle.height);
            
            // 장애물이 멈춘 이유라면 점프 힌트 표시
            if (!gameState.isMoving && Math.abs(player.worldX - obstacle.x) < 100) {
                ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                ctx.fillRect(screenX, obstacle.y - obstacle.height - 10, obstacle.width, 5);
            }
        }
    });
    
    // 적 그리기 (카메라 오프셋 적용)
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        const screenX = enemy.x - gameState.cameraX;
        if (screenX > -100 && screenX < canvas.width + 100) {
            const data = pixelData[enemy.type];
            drawPixelSprite(data.idle, data.colorMap, screenX, enemy.y - enemy.height);
            
            // 보스 어그로 상태 표시
            if (enemy.type === 'boss' && enemy.isAggro) {
                ctx.fillStyle = 'red';
                ctx.fillRect(screenX, enemy.y - enemy.height - 15, enemy.width, 3);
            }
        }
    });
    
    // 플레이어 그리기 (탑승 상태 체크)
    if (!mountState || !mountState.isMounted) {
        // 일반 플레이어 그리기
        const playerData = pixelData[player.sprite];  // ✅ 선택된 캐릭터 사용
        let sprite;
        
        // 애니메이션 상태에 따른 스프라이트 선택
        if (player.isJumping) {
            sprite = playerData.jump;  // ✅ playerData 사용
        } else if (gameState.isMoving && !gameState.questionActive) {
            if (playerData.walking1 && playerData.walking2) {
                if (player.animFrame === 1) {
                    sprite = playerData.walking1;
                } else if (player.animFrame === 2) {
                    sprite = playerData.walking2;
                } else {
                    sprite = playerData.idle;
                }
            } else {
                sprite = playerData.idle; // walking 스프라이트가 없으면 idle 사용
            }
        } else {
            sprite = playerData.idle;
        }
        
        // 일반적인 방법으로 그리기 (뒤집기 없이)
        drawPixelSprite(sprite, playerData.colorMap, player.x, player.y - player.height);
    }
    // 탑승 중인 플레이어는 renderMounts에서 처리됨
            
    // 파티클 렌더링 (particles.js 함수 사용)
    if (typeof renderParticles === 'function') {
        renderParticles(ctx);
    }
    
    // 게임 상태 표시
    if (!gameState.isMoving && !gameState.questionActive) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        ctx.font = 'bold 18px Jua';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText('점프로 장애물을 뛰어넘으세요!', canvas.width / 2, 50);
        ctx.fillText('점프로 장애물을 뛰어넘으세요!', canvas.width / 2, 50);
    }
    
    // 화면 흔들림 효과 복원
    ctx.restore();
}

// 메뉴 표시
function showMenu() {
    gameState.running = false;
    document.getElementById('characterSelectMenu').style.display = 'flex';
    document.getElementById('mathSelectMenu').style.display = 'none';
    document.getElementById('ui').style.display = 'none';
    document.getElementById('questionPanel').style.display = 'none';
}

// 새로운 화면 전환 함수들 추가
function showMathSelectMenu() {
    document.getElementById('characterSelectMenu').style.display = 'none';
    document.getElementById('mathSelectMenu').style.display = 'flex';
    updateSelectedCharacterDisplay();
    
    // 지율이를 선택했을 때만 탑승 옵션 표시
    let mountOption = document.getElementById('mountOption');
    
    // 기존 요소가 있으면 제거
    if (mountOption) {
        mountOption.remove();
    }
    
    if (gameState.selectedCharacter === 'jiyul') {
        // 탑승 옵션 UI 생성
        const mathMenu = document.getElementById('mathSelectMenu');
        const menuContent = mathMenu.querySelector('.menu-content');
        
        const mountDiv = document.createElement('div');
        mountDiv.id = 'mountOption';
        mountDiv.className = 'menu-card';
        mountDiv.innerHTML = `
            <h3 class="card-title">🦆 탑승 모드 🐴</h3>
            <div style="
                background: linear-gradient(135deg, #FFD700, #FFA500);
                border: 3px solid #FFF;
                border-radius: 20px;
                padding: 20px;
                text-align: center;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            ">
                <label style="display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <input type="checkbox" id="mountCheckbox" style="
                        width: 20px;
                        height: 20px;
                        margin-right: 10px;
                        cursor: pointer;
                    ">
                    <span style="color: white; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                        키위와 화이트하우스를 타고 모험하기!
                    </span>
                </label>
                <p style="color: #FFF; font-size: 14px; margin-top: 10px; opacity: 0.9;">
                    게임 중 탑승 가능한 친구들을 만나면 타고 갈 수 있어요!
                </p>
            </div>
        `;
        
        // 선택된 내용 표시 div 앞에 삽입
        const selectionSummary = menuContent.querySelector('.selection-summary');
        if (selectionSummary) {
            menuContent.insertBefore(mountDiv, selectionSummary);
        } else {
            // selection-summary가 없으면 버튼 그룹 앞에 삽입
            const buttonGroup = menuContent.querySelector('.button-group');
            menuContent.insertBefore(mountDiv, buttonGroup);
        }
        
        // 체크박스 이벤트 리스너 추가
        const checkbox = document.getElementById('mountCheckbox');
        if (checkbox) {
            checkbox.addEventListener('change', function(e) {
                gameState.mountEnabled = e.target.checked;
                console.log('탑승 모드:', gameState.mountEnabled ? '활성화' : '비활성화');
            });
        }
    }
}

function showCharacterSelectMenu() {
    document.getElementById('mathSelectMenu').style.display = 'none';
    document.getElementById('characterSelectMenu').style.display = 'flex';
}

function updateSelectedCharacterDisplay() {
    const selectedCharacterPixel = document.getElementById('selectedCharacterPixel');
    const selectedCharacterName = document.getElementById('selectedCharacterName');
    
    if (selectedCharacterPixel && characterPixelData[gameState.selectedCharacter]) {
        const ctx = selectedCharacterPixel.getContext('2d');
        drawCharacterPixelSprite(
            ctx, 
            characterPixelData[gameState.selectedCharacter].idle, 
            characterPixelData[gameState.selectedCharacter].colorMap, 
            4  // 더 큰 스케일로 표시
        );
    }
    
    if (selectedCharacterName) {
        const characterNames = {
            'jiyul': '지율이',
            'kiwi': '키위',
            'whitehouse': '화이트하우스'
        };
        selectedCharacterName.textContent = characterNames[gameState.selectedCharacter] || '지율이';
    }
}

// 도움말 표시
function showHelp() {
    alert('🌸 지율이의 픽셀 수학 게임 도움말 🌸\n\n' +
          '1. 구구단이나 연산을 선택하고 시작하세요!\n' +
          '2. 점프 버튼으로 장애물을 뛰어넘으세요!\n' +
          '3. 장애물에 막히면 화면이 멈춰요!\n' +
          '4. 움직이는 몬스터를 만나면 수학 문제를 풀어요!\n' +
          '5. 정답을 맞추면 몬스터를 물리칠 수 있어요!\n\n' +
          '💕 지율이 화이팅! 💕');
}

// 게임 오버
function gameOver() {
    gameState.running = false;
    alert(`게임 오버! 😢\n최종 점수: ${gameState.score}점\n다시 도전해보세요!`);
    showMenu();
}

// 다음 스테이지
function nextStage() {
    // 20스테이지 클리어 시 엔딩
    if (gameState.stage >= 20) {
        showEnding();
        return;
    }
    
    gameState.stage++;
    gameState.speed += 0.5;
    alert(`🎉 스테이지 ${gameState.stage - 1} 클리어! 🎉\n스테이지 ${gameState.stage}로 이동합니다!`);
    
    // 새로운 몬스터들 추가 (기존 몬스터는 유지)
    generateMoreEnemies();
}

// 점프 함수 (개선된 버전)
function jump() {
    // 탑승 중이면 특별 점프
    if (mountState && mountState.isMounted) {
        if (typeof mountJump === 'function') {
            mountJump();
        }
        return;
    }
    
    // 일반 점프
    if (player.onGround && !gameState.questionActive) {
        const jumpPower = getJumpPower(); // 디바이스별 점프 파워 사용
        player.velocityY = jumpPower;
        
        // 모바일에서는 전진 속도도 조정
        const forwardSpeed = isMobileDevice() ? JUMP_FORWARD_SPEED * 1.2 : JUMP_FORWARD_SPEED * 1.5;
        player.velocityX = forwardSpeed;
        
        player.isJumping = true;
        player.onGround = false;
        
        // 점프 시 화면 이동 강제 재개
        gameState.isMoving = true;
        
        // 점프 효과음 대신 파티클
        if (typeof createParticles === 'function') {
            createParticles(player.x, player.y, 'hint');
        }
        
        // 점수 보너스 (점프 성공)
        gameState.score += 1;
        updateUI();
    }
}

// 초기 캔버스 설정
resizeCanvas();

// 이벤트 리스너 설정
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});
document.addEventListener('fullscreenchange', () => {
    setTimeout(resizeCanvas, 100);
});

// ========== 이벤트 리스너 설정 ==========
// DOM이 완전히 로드된 후 한 번만 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
}

function setupEventListeners() {
    console.log('이벤트 리스너 설정 시작');
    
    // 이미 설정되었는지 확인
    if (window.eventListenersSetup) {
        console.log('이벤트 리스너가 이미 설정되어 있음');
        return;
    }
    window.eventListenersSetup = true;
    
    // 모바일 키보드 전역 방지
    document.addEventListener('touchstart', function(e) {
        if (e.target.id === 'answerInput') {
            e.preventDefault();
            e.stopPropagation();
            document.activeElement.blur();
        }
    }, { passive: false });
    
    // 구구단 버튼들 - 이벤트 위임 방식 사용
    const danGrid = document.getElementById('danGrid');
    if (danGrid) {
        danGrid.addEventListener('click', function(e) {
            const button = e.target.closest('.dan-btn');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                const dan = parseInt(button.getAttribute('data-dan'));
                toggleDan(dan);
            }
        });
    }

    // 연산 버튼들 - 이벤트 위임 방식 사용
    const operatorGrid = document.getElementById('operatorGrid');
    if (operatorGrid) {
        operatorGrid.addEventListener('click', function(e) {
            const button = e.target.closest('.operator-btn');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                const op = button.getAttribute('data-op');
                toggleOperator(op);
            }
        });
    }

    // 기타 버튼들
    const startBtn = document.getElementById('startGameBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!this.disabled) {
                startSelectedGame();
            }
        });
    }
    
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    const jumpBtn = document.getElementById('jumpBtn');
    if (jumpBtn) {
        jumpBtn.addEventListener('click', jump);
    }
    
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
        menuBtn.addEventListener('click', showMenu);
    }
    
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', showHelp);
    }
    
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitAnswer);
    }
    
    // 다음 버튼 (캐릭터 선택 -> 수학 선택)
    const nextToMathBtn = document.getElementById('nextToMathBtn');
    if (nextToMathBtn) {
        nextToMathBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showMathSelectMenu();
        });
    }
    
    // 이전 버튼 (수학 선택 -> 캐릭터 선택)
    const backToCharacterBtn = document.getElementById('backToCharacterBtn');
    if (backToCharacterBtn) {
        backToCharacterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showCharacterSelectMenu();
        });
    }
    
    // 엔터키 이벤트
    const answerInput = document.getElementById('answerInput');
    if (answerInput) {
        answerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitAnswer();
            }
        });
    }

	// 탑승 모드 체크박스 이벤트
    const mountCheckbox = document.getElementById('mountCheckbox');
    if (mountCheckbox) {
        mountCheckbox.addEventListener('change', function(e) {
            gameState.mountEnabled = e.target.checked;
            console.log('탑승 모드:', gameState.mountEnabled ? '활성화' : '비활성화');
        });
    }
	
    // 커스텀 키보드 이벤트 - 이벤트 위임 방식 사용
    const customKeyboard = document.getElementById('customKeyboard');
    if (customKeyboard) {
        customKeyboard.addEventListener('click', function(e) {
            const keyBtn = e.target.closest('.key-btn');
            if (keyBtn) {
                e.preventDefault();
                e.stopPropagation();
                const key = keyBtn.getAttribute('data-key');
                console.log('키 버튼 클릭:', key);
                handleKeyPress(key);
            }
        });
    }
    
    // 캐릭터 선택 버튼들 - 이벤트 위임 방식 사용
    const characterGrid = document.getElementById('characterGrid');
    if (characterGrid) {
        characterGrid.addEventListener('click', function(e) {
            const button = e.target.closest('.character-btn');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                const character = button.getAttribute('data-character');
                selectCharacter(character);
            }
        });
    }
    
    console.log('모든 이벤트 설정 완료');
    
    // 기본 캐릭터 선택 (지율이)
    selectCharacter('jiyul');
}

// 커스텀 키보드 처리 함수
function handleKeyPress(key) {
    const answerInput = document.getElementById('answerInput');
    if (!answerInput) return;
    
    if (key === 'clear') {
        // 전체 지우기 (하트 버튼)
        answerInput.value = '';
        // 귀여운 효과
        answerInput.style.transform = 'scale(1.1)';
        setTimeout(() => {
            answerInput.style.transform = 'scale(1)';
        }, 200);
    } else if (key === 'back') {
        // 한 글자 지우기
        answerInput.value = answerInput.value.slice(0, -1);
    } else {
        // 숫자 입력 (최대 3자리로 제한)
        if (answerInput.value.length < 3) {
            answerInput.value += key;
            // 입력 효과
            answerInput.style.backgroundColor = '#FFE4E1';
            setTimeout(() => {
                answerInput.style.backgroundColor = '#FFF';
            }, 100);
        }
    }
}