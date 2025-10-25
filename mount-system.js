// 탑승 시스템 관련 코드

// 탑승 상태 관리
let mountState = {
    isMounted: false,
    mountType: null, // 'kiwi' 또는 'whitehouse'
    mountAnimFrame: 0,
    mountAnimTimer: 0,
    mountBobOffset: 0,
    availableMount: null, // 근처에 있는 탑승 가능한 대상
    canMount: false
};

// 탑승 가능한 동물/캐릭터들
let mounts = [];

// 탑승 시스템 초기화
function initMountSystem() {
    mountState.isMounted = false;
    mountState.mountType = null;
    mountState.mountAnimFrame = 0;
    mountState.mountAnimTimer = 0;
    mountState.mountBobOffset = 0;
    mountState.availableMount = null;
    mountState.canMount = false;
    mounts = [];
    
    // 지율이를 선택했을 때만 탑승 옵션 표시
    if (gameState.selectedCharacter === 'jiyul' && gameState.mountEnabled) {
        generateMounts();
    }
}

// 탑승 가능한 캐릭터 생성
function generateMounts() {
    // 키위 생성
    mounts.push({
        type: 'kiwi',
        x: 500,
        y: GROUND_Y,
        width: 16 * PIXEL_SCALE,
        height: 16 * PIXEL_SCALE,
        velocityY: 0,
        onGround: true,
        animFrame: 0,
        animTimer: 0,
        mounted: false,
        speed: 6, // 키위는 빠름
        jumpPower: -20 // 키위는 점프력이 좋음
    });
    
    // 화이트하우스 생성
    mounts.push({
        type: 'whitehouse',
        x: 1000,
        y: GROUND_Y,
        width: 16 * PIXEL_SCALE,
        height: 16 * PIXEL_SCALE,
        velocityY: 0,
        onGround: true,
        animFrame: 0,
        animTimer: 0,
        mounted: false,
        speed: 4, // 화이트하우스는 중간 속도
        jumpPower: -22 // 화이트하우스는 점프력이 매우 좋음
    });
}

// 추가 탑승 가능 캐릭터 생성 (무한 맵용)
function generateMoreMounts() {
    if (gameState.selectedCharacter !== 'jiyul' || !gameState.mountEnabled) return;
    
    const lastMountX = mounts.length > 0 ? Math.max(...mounts.map(m => m.x)) : player.worldX;
    const spacing = 2000 + Math.random() * 1000;
    
    // 랜덤하게 키위나 화이트하우스 생성
    const mountType = Math.random() > 0.5 ? 'kiwi' : 'whitehouse';
    
    mounts.push({
        type: mountType,
        x: lastMountX + spacing,
        y: GROUND_Y,
        width: 16 * PIXEL_SCALE,
        height: 16 * PIXEL_SCALE,
        velocityY: 0,
        onGround: true,
        animFrame: 0,
        animTimer: 0,
        mounted: false,
        speed: mountType === 'kiwi' ? 6 : 4,
        jumpPower: mountType === 'kiwi' ? -20 : -22
    });
}

// 탑승 시스템 업데이트
function updateMountSystem() {
    // 탑승 중이 아닐 때만 근처 탑승 가능 체크
    if (!mountState.isMounted) {
        mountState.availableMount = null;
        mountState.canMount = false;
        
        mounts.forEach(mount => {
            if (!mount.mounted) {
                const distance = Math.abs(player.worldX - mount.x);
                if (distance < 100) {
                    mountState.availableMount = mount;
                    mountState.canMount = true;
                }
            }
        });
    }
    
    // 탑승 중일 때 애니메이션 업데이트
    if (mountState.isMounted) {
        // 상하 움직임 (말 타는 느낌)
        mountState.mountBobOffset = Math.sin(gameState.distance * 0.1) * 3;
        
        // 탑승 애니메이션 프레임 업데이트
        mountState.mountAnimTimer++;
        if (mountState.mountAnimTimer >= 10) {
            mountState.mountAnimFrame = (mountState.mountAnimFrame + 1) % 4;
            mountState.mountAnimTimer = 0;
        }
    }
    
    // 탑승 가능한 캐릭터들 물리 업데이트
    mounts.forEach(mount => {
        if (!mount.mounted) {
            // 중력 적용
            if (!mount.onGround) {
                mount.velocityY += GRAVITY;
                mount.y += mount.velocityY;
                
                if (mount.y >= GROUND_Y) {
                    mount.y = GROUND_Y;
                    mount.velocityY = 0;
                    mount.onGround = true;
                }
            }
            
            // 애니메이션 업데이트
            mount.animTimer++;
            if (mount.animTimer >= 20) {
                mount.animFrame = (mount.animFrame + 1) % 2;
                mount.animTimer = 0;
            }
        }
    });
    
    // 화면 밖으로 나간 탑승 캐릭터 제거
    mounts = mounts.filter(mount => 
        mount.mounted || mount.x > gameState.cameraX - 500
    );
    
    // 새로운 탑승 캐릭터 생성 (앞쪽에 부족하면)
    const aheadMounts = mounts.filter(mount => 
        !mount.mounted && mount.x > player.worldX && mount.x < player.worldX + 3000
    );
    
    if (aheadMounts.length < 1 && gameState.mountEnabled) {
        generateMoreMounts();
    }
}

// 탑승/하차 함수
function toggleMount() {
    if (mountState.isMounted) {
        // 하차
        dismount();
    } else if (mountState.canMount && mountState.availableMount) {
        // 탑승
        mount(mountState.availableMount);
    }
}

// 탑승 함수
function mount(mountTarget) {
    if (!mountTarget || mountTarget.mounted) return;
    
    mountState.isMounted = true;
    mountState.mountType = mountTarget.type;
    mountTarget.mounted = true;
    
    // 플레이어 속성 변경
    player.runSpeed = mountTarget.speed;
    gameState.speed = mountTarget.speed;
    
    // 탑승 효과
    if (typeof createParticles === 'function') {
        createParticles(player.x, player.y, 'defeat');
    }
    
    // 탑승 메시지
    showMountMessage(`${mountTarget.type === 'kiwi' ? '키위' : '화이트하우스'}에 탑승했어요! 🎉`);
}

// 하차 함수
function dismount() {
    if (!mountState.isMounted) return;
    
    // 현재 탑승 중인 대상 찾기
    const currentMount = mounts.find(m => m.mounted && m.type === mountState.mountType);
    if (currentMount) {
        currentMount.mounted = false;
        currentMount.x = player.worldX;
        currentMount.y = player.y;
    }
    
    mountState.isMounted = false;
    mountState.mountType = null;
    
    // 플레이어 속성 복원
    player.runSpeed = 4;
    gameState.speed = 4;
    
    // 하차 효과
    if (typeof createParticles === 'function') {
        createParticles(player.x, player.y, 'hint');
    }
    
    showMountMessage('하차했어요!');
}

// 탑승 점프 함수 (탑승 시 특별한 점프)
function mountJump() {
    if (!mountState.isMounted || !player.onGround || gameState.questionActive) return;
    
    const currentMount = mounts.find(m => m.mounted && m.type === mountState.mountType);
    if (!currentMount) return;
    
    // 탑승한 캐릭터의 점프력 사용
    player.velocityY = currentMount.jumpPower;
    
    // 전진 속도 증가
    const forwardSpeed = currentMount.type === 'kiwi' ? 8 : 10;
    player.velocityX = forwardSpeed;
    
    player.isJumping = true;
    player.onGround = false;
    gameState.isMoving = true;
    
    // 점프 효과
    if (typeof createParticles === 'function') {
        createParticles(player.x, player.y + 20, 'defeat');
    }
    
    // 점수 보너스
    gameState.score += 3;
    updateUI();
}

// 탑승 상태 렌더링
function renderMounts(ctx) {
    // 탑승 가능한 캐릭터들 그리기
    mounts.forEach(mount => {
        if (!mount.mounted) {
            const screenX = mount.x - gameState.cameraX;
            if (screenX > -100 && screenX < canvas.width + 100) {
                const data = pixelData[mount.type];
                
                // 탑승 가능 표시 (근처에 있을 때)
                if (mountState.availableMount === mount) {
                    // 빛나는 효과
                    ctx.save();
                    ctx.shadowColor = '#FFD700';
                    ctx.shadowBlur = 20;
                    drawPixelSprite(data.idle, data.colorMap, screenX, mount.y - mount.height);
                    ctx.restore();
                    
                    // "탑승 가능!" 텍스트
                    ctx.fillStyle = '#FFD700';
                    ctx.font = 'bold 14px Jua';
                    ctx.textAlign = 'center';
                    ctx.fillText('탑승 가능!', screenX + mount.width/2, mount.y - mount.height - 20);
                } else {
                    // 일반 그리기
                    drawPixelSprite(data.idle, data.colorMap, screenX, mount.y - mount.height);
                }
            }
        }
    });
    
    // 탑승 중인 경우 특별 렌더링
    if (mountState.isMounted) {
        renderMountedPlayer(ctx);
    }
}

// 탑승한 플레이어 렌더링
function renderMountedPlayer(ctx) {
    const mountData = pixelData[mountState.mountType];
    const playerData = pixelData['jiyul'];
    
    // 탑승물 그리기 (플레이어 위치에)
    let mountSprite;
    if (player.isJumping) {
        mountSprite = mountData.jump || mountData.idle;
    } else if (gameState.isMoving && !gameState.questionActive) {
        // 걷기 애니메이션
        if (mountState.mountAnimFrame % 2 === 0) {
            mountSprite = mountData.walking1 || mountData.idle;
        } else {
            mountSprite = mountData.walking2 || mountData.idle;
        }
    } else {
        mountSprite = mountData.idle;
    }
    
    // 탑승물 그리기
    const mountY = player.y - player.height + mountState.mountBobOffset;
    drawPixelSprite(mountSprite, mountData.colorMap, player.x, mountY);
    
    // 지율이를 탑승물 위에 그리기 (앉은 자세)
    const riderY = mountY - player.height * 0.7; // 탑승물 위에 앉은 높이
    const riderSprite = playerData.idle; // 앉은 자세는 idle 사용
    
    // 크기를 약간 줄여서 앉은 느낌 표현
    ctx.save();
    ctx.scale(1, 0.9); // 세로로 약간 압축
    drawPixelSprite(riderSprite, playerData.colorMap, player.x, riderY / 0.9);
    ctx.restore();
}

// 탑승 메시지 표시
function showMountMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: white;
        padding: 15px 30px;
        border: 3px solid #FFF;
        border-radius: 20px;
        font-size: 20px;
        font-family: 'Jua', sans-serif;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: fadeInOut 2s ease;
    `;
    
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    
    // CSS 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
    `;
    document.head.appendChild(style);
    
    // 2초 후 제거
    setTimeout(() => {
        msgDiv.remove();
        style.remove();
    }, 2000);
}

// 탑승 버튼 표시/숨기기
function updateMountButton() {
    let mountBtn = document.getElementById('mountBtn');
    
    if (!mountBtn) {
        // 탑승 버튼 생성
        mountBtn = document.createElement('button');
        mountBtn.id = 'mountBtn';
        mountBtn.className = 'control-btn mount-btn';
        mountBtn.style.cssText = `
            background: linear-gradient(135deg, #FFD700, #FFA500);
            border: 3px solid #FFF;
            color: white;
            padding: 15px 25px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            font-family: 'Jua', sans-serif;
            border-radius: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            min-width: 100px;
        `;
        
        const controls = document.getElementById('controls');
        if (controls) {
            controls.appendChild(mountBtn);
        }
        
        mountBtn.addEventListener('click', toggleMount);
    }
    
    // 버튼 텍스트와 표시 상태 업데이트
    if (gameState.selectedCharacter === 'jiyul' && gameState.mountEnabled) {
        mountBtn.style.display = 'block';
        
        if (mountState.isMounted) {
            mountBtn.textContent = '하차';
            mountBtn.style.background = 'linear-gradient(135deg, #FF69B4, #FF1493)';
        } else if (mountState.canMount) {
            mountBtn.textContent = '탑승!';
            mountBtn.style.background = 'linear-gradient(135deg, #32CD32, #00FF00)';
            mountBtn.style.animation = 'pulse 1s infinite';
        } else {
            mountBtn.textContent = '탑승';
            mountBtn.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
            mountBtn.style.animation = 'none';
        }
    } else {
        mountBtn.style.display = 'none';
    }
}