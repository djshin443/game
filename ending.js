// ========== 엔딩 시스템 ==========

// 엔딩 표시
const PIXEL_SCALE = 3;  // 이 줄을 추가

function showEnding() {
    gameState.running = false;
    gameState.isMoving = false;
    
    // 엔딩 화면 생성
    const endingDiv = document.createElement('div');
    endingDiv.id = 'endingScreen';
    endingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #FFB6C1, #FFE4E1);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Jua', sans-serif;
        text-align: center;
        padding: 20px;
    `;
    
    // 엔딩 캔버스
    const endingCanvas = document.createElement('canvas');
    endingCanvas.width = 480;
    endingCanvas.height = 320;
    endingCanvas.style.cssText = `
        background: #87CEEB;
        border: 5px solid #FF69B4;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        image-rendering: pixelated;
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
        max-width: 90vw;
        height: auto;
    `;
    
    // 엔딩 텍스트
    const endingText = document.createElement('div');
    endingText.style.cssText = `
        margin-top: 30px;
        font-size: 24px;
        color: #FF1493;
        text-shadow: 2px 2px 0 #FFF;
        background: rgba(255,255,255,0.9);
        padding: 20px 40px;
        border-radius: 20px;
        border: 3px solid #FF69B4;
    `;
    
    // 캐릭터별 엔딩 설정
    switch(gameState.selectedCharacter) {
        case 'jiyul':
            endingText.innerHTML = `
                <h2 style="margin-bottom: 15px;">🎊 축하해요! 🎊</h2>
                <p>짜국이가 모든 스테이지를 클리어했어요!</p>
                <p style="color: #8B008B; margin-top: 10px;">엄마 아빠가 자랑스러워하고 있어요! 💕</p>
            `;
            break;
        case 'kiwi':
            endingText.innerHTML = `
                <h2 style="margin-bottom: 15px;">🥝 대단해요! 🥝</h2>
                <p>키위가 모든 모험을 완료했어요!</p>
                <p style="color: #8B008B; margin-top: 10px;">맛있는 간식을 받을 시간이에요!</p>
            `;
            break;
        case 'whitehouse':
            endingText.innerHTML = `
                <h2 style="margin-bottom: 15px;">🏰 모험 완료! 🏰</h2>
                <p>화이트하우스와 함께한 여정이 끝났어요!</p>
                <p style="color: #8B008B; margin-top: 10px;">이제 텐트 안에서 놀이 시간! 🎪</p>
            `;
            break;
    }
    
    // 다시 시작 버튼
    const restartBtn = document.createElement('button');
    restartBtn.textContent = '🏠 메인으로';
    restartBtn.style.cssText = `
        margin-top: 30px;
        background: linear-gradient(135deg, #32CD32, #90EE90);
        border: 3px solid #FFF;
        color: white;
        padding: 15px 30px;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        font-family: 'Jua', sans-serif;
        border-radius: 25px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    `;
    restartBtn.onclick = () => {
        document.body.removeChild(endingDiv);
        showMenu();
    };
    
    endingDiv.appendChild(endingCanvas);
    endingDiv.appendChild(endingText);
    endingDiv.appendChild(restartBtn);
    document.body.appendChild(endingDiv);
    
    // 엔딩 애니메이션 시작
    const endingCtx = endingCanvas.getContext('2d');
    endingCtx.imageSmoothingEnabled = false;
    animateEnding(endingCtx, endingCanvas);
    
    // 축하 파티클
    createEndingParticles();
}

// 엔딩 애니메이션
function animateEnding(ctx, canvas) {
    let frame = 0;
    
    function drawEndingScene() {
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 배경 그리기
        drawEndingBackground(ctx, canvas);
        
        // 캐릭터별 엔딩 씬
        switch(gameState.selectedCharacter) {
            case 'jiyul':
                drawJiyulEnding(ctx, canvas, frame);
                break;
            case 'kiwi':
                drawKiwiEnding(ctx, canvas, frame);
                break;
            case 'whitehouse':
                drawWhitehouseEnding(ctx, canvas, frame);
                break;
        }
        
        frame++;
        requestAnimationFrame(drawEndingScene);
    }
    
    drawEndingScene();
}

// 엔딩 배경
function drawEndingBackground(ctx, canvas) {
    // 땅
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    // 꽃들
    for (let i = 0; i < 8; i++) {
        const x = i * 60 + 30;
        const y = canvas.height - 60;
        
        // 줄기
        ctx.strokeStyle = '#32CD32';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 20);
        ctx.stroke();
        
        // 꽃
        ctx.fillStyle = ['#FF69B4', '#FFB6C1', '#FF1493', '#FFD700'][i % 4];
        ctx.beginPath();
        ctx.arc(x, y - 25, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 짜국이 엔딩 - 엄마 아빠와 함께
function drawJiyulEnding(ctx, canvas, frame) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 120;
    
    // 배경 장식 - 축하 리본
    drawCelebrationRibbons(ctx, canvas, frame);
    
    // 짜국이 (중앙) - 기쁨 표현
    const jiyulData = pixelData.jiyul;
    const jiyulX = centerX - 24;
    const jiyulY = centerY;
    
    // 점프 애니메이션
    const jumpOffset = Math.abs(Math.sin(frame * 0.05)) * 20;
    drawPixelSprite(jiyulData.idle, jiyulData.colorMap, jiyulX, jiyulY - jumpOffset, 3);
    
    // 기쁨 표현 - 짜국이 위에 반짝이
    if (frame % 20 < 10) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(jiyulX - 10, jiyulY - jumpOffset - 40, 6, 6);
        ctx.fillRect(jiyulX + 20, jiyulY - jumpOffset - 50, 4, 4);
        ctx.fillRect(jiyulX + 30, jiyulY - jumpOffset - 35, 5, 5);
    }
    
    // 엄마 (왼쪽) - 16비트 스타일
    drawDetailedMom(ctx, centerX - 100, centerY, frame);
    
    // 아빠 (오른쪽) - 16비트 스타일
    drawDetailedDad(ctx, centerX + 80, centerY, frame);
    
    // 가족 사랑 하트들
    drawFamilyHearts(ctx, centerX, centerY, frame);
    
    // 축하 폭죽 효과
    drawFireworks(ctx, canvas, frame);
    
    // 축하 메시지
    ctx.fillStyle = '#FF1493';
    ctx.font = 'bold 20px Jua';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3;
    ctx.strokeText('구구단 마스터 완성! 🎊', centerX, 50);
    ctx.fillText('구구단 마스터 완성! 🎊', centerX, 50);
}

// 키위 엔딩 - 밥 먹기
function drawKiwiEnding(ctx, canvas, frame) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 100;
    
    // 배경 - 집 안 분위기
    drawHomeBackground(ctx, canvas);
    
    // 키위 (중앙) - 먹는 애니메이션
    const kiwiData = pixelData.kiwi;
    const kiwiX = centerX - 24;
    const kiwiY = centerY;
    
    // 먹는 동작 애니메이션 (머리 위아래)
    const eatOffset = Math.sin(frame * 0.15) * 5;
    drawPixelSprite(kiwiData.idle, kiwiData.colorMap, kiwiX, kiwiY + eatOffset, 3);
    
    // 짜국이 (왼쪽에서 지켜보기)
    const jiyulData = pixelData.jiyul;
    drawPixelSprite(jiyulData.idle, jiyulData.colorMap, centerX - 120, centerY - 10, 2.5);
    
    // 엄마 (오른쪽에서 미소)
    drawDetailedMom(ctx, centerX + 80, centerY - 10, frame, 0.8);
    
    // 먹이 그릇 (더 상세하게)
    drawFoodBowl(ctx, centerX, centerY + 50, frame);
    
    // 도마뱀 친구 (껄충껑충 뛰는 모습)
    drawLizardFriend(ctx, centerX, centerY + 30, frame);
    
    // 키위 만족도 표시
    drawKiwiHappiness(ctx, kiwiX + 60, kiwiY - 30, frame);
    
    // 따뜻한 분위기 효과
    drawWarmAtmosphere(ctx, canvas, frame);
    
    // 메시지
    ctx.fillStyle = '#32CD32';
    ctx.font = 'bold 18px Jua';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeText('키위가 맛있게 간식을 먹고 있어요!', centerX, 40);
    ctx.fillText('키위가 맛있게 간식을 먹고 있어요!', centerX, 40);
}

// 화이트하우스 엔딩 - 텐트 안에서 놀기
function drawWhitehouseEnding(ctx, canvas, frame) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 100;
    
    // 방 배경
    drawPlayroomBackground(ctx, canvas);
    
    // 하얀색 네모 텐트 (명확하게)
    drawWhiteSquareTent(ctx, centerX, centerY, frame);
    
    // 텐트 주변 장난감들
    drawAdvancedToyCollection(ctx, centerX, centerY, frame);
    
    // 텐트 안 따뜻한 조명
    drawTentInteriorLighting(ctx, centerX, centerY, frame);
    
    // 마법같은 놀이 효과
    drawEnhancedPlayEffects(ctx, centerX, centerY, frame);
    
    // 메시지
    ctx.fillStyle = '#9370DB';
    ctx.font = 'bold 18px Jua';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeText('하얀 텐트에서 즐거운 놀이시간! 🎪', centerX, 40);
    ctx.fillText('하얀 텐트에서 즐거운 놀이시간! 🎪', centerX, 40);
}

// ========== 엔딩 디테일 함수들 ==========

// 16비트 스타일 엄마 그리기 (더 여성스럽게)
function drawDetailedMom(ctx, x, y, frame, scale = 1) {
    const s = scale;
    const waveOffset = Math.sin(frame * 0.1) * 3;
    
    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x - 8*s, y + 85*s, 55*s, 8*s);
    
    // 긴 머리카락 (우아한 웨이브)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 5*s, y - 30*s, 40*s, 25*s);
    ctx.fillRect(x + 2*s, y - 35*s, 26*s, 15*s);
    // 양쪽 웨이브
    ctx.fillRect(x - 8*s, y - 25*s + waveOffset, 10*s, 25*s);
    ctx.fillRect(x + 30*s, y - 25*s - waveOffset, 10*s, 25*s);
    // 앞머리
    ctx.fillRect(x + 5*s, y - 32*s, 20*s, 8*s);
    
    // 얼굴 (더 부드럽게)
    ctx.fillStyle = '#FFE0BD';
    ctx.fillRect(x + 5*s, y - 12*s, 20*s, 28*s);
    
    // 눈 (더 크고 반짝이게)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 8*s, y - 5*s, 3*s, 5*s);
    ctx.fillRect(x + 17*s, y - 5*s, 3*s, 5*s);
    // 속눈썹
    ctx.fillRect(x + 7*s, y - 7*s, 1*s, 2*s);
    ctx.fillRect(x + 12*s, y - 7*s, 1*s, 2*s);
    ctx.fillRect(x + 16*s, y - 7*s, 1*s, 2*s);
    ctx.fillRect(x + 21*s, y - 7*s, 1*s, 2*s);
    
    if (frame % 60 < 5) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 9*s, y - 3*s, 1*s, 2*s);
        ctx.fillRect(x + 18*s, y - 3*s, 1*s, 2*s);
    }
    
    // 입술 (더 여성스럽게)
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(x + 12*s, y + 8*s, 6*s, 3*s);
    ctx.fillRect(x + 11*s, y + 7*s, 2*s, 2*s);
    ctx.fillRect(x + 17*s, y + 7*s, 2*s, 2*s);
    
    // 목걸이
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 10*s, y + 16*s, 10*s, 2*s);
    ctx.fillRect(x + 14*s, y + 18*s, 2*s, 3*s);
    
    // 우아한 드레스 상의
    ctx.fillStyle = '#FF1493';
    ctx.fillRect(x - 2*s, y + 16*s, 34*s, 40*s);
    // 드레스 장식 (레이스 패턴)
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(x + 3*s + i * 5*s, y + 20*s, 3*s, 1*s);
        ctx.fillRect(x + 3*s + i * 5*s, y + 30*s, 3*s, 1*s);
        ctx.fillRect(x + 3*s + i * 5*s, y + 40*s, 3*s, 1*s);
    }
    
    // 팔 (우아한 박수 동작)
    const clapOffset = Math.sin(frame * 0.3) * 10*s;
    ctx.fillStyle = '#FFE0BD';
    // 왼팔
    ctx.fillRect(x - 10*s - clapOffset, y + 22*s, 8*s, 22*s);
    ctx.fillRect(x - 14*s - clapOffset, y + 20*s, 6*s, 10*s);
    // 오른팔
    ctx.fillRect(x + 32*s + clapOffset, y + 22*s, 8*s, 22*s);
    ctx.fillRect(x + 38*s + clapOffset, y + 20*s, 6*s, 10*s);
    
    // 긴 스커트 (A라인)
    ctx.fillStyle = '#8A2BE2';
    ctx.fillRect(x - 8*s, y + 56*s, 46*s, 30*s);
    // 스커트 플리츠
    ctx.fillStyle = '#6A1B9A';
    for (let i = 0; i < 8; i++) {
        ctx.fillRect(x - 6*s + i * 6*s, y + 56*s, 2*s, 30*s);
    }
    
    // 다리 (스타킹)
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(x + 10*s, y + 86*s, 5*s, 12*s);
    ctx.fillRect(x + 17*s, y + 86*s, 5*s, 12*s);
    
    // 하이힐
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(x + 8*s, y + 98*s, 9*s, 6*s);
    ctx.fillRect(x + 15*s, y + 98*s, 9*s, 6*s);
    // 힐
    ctx.fillRect(x + 14*s, y + 104*s, 2*s, 4*s);
    ctx.fillRect(x + 21*s, y + 104*s, 2*s, 4*s);
}

// 16비트 스타일 아빠 그리기 (티셔츠 버전)
function drawDetailedDad(ctx, x, y, frame, scale = 1) {
    const s = scale;
    const nodOffset = Math.sin(frame * 0.08) * 3;
    
    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x - 5*s, y + 85*s, 50*s, 8*s);
    
    // 머리카락 (단정한 헤어)
    ctx.fillStyle = '#2C1810';
    ctx.fillRect(x + 2*s, y - 28*s, 26*s, 23*s);
    ctx.fillRect(x + 5*s, y - 32*s, 20*s, 8*s);
    // 옆머리
    ctx.fillRect(x, y - 20*s, 6*s, 15*s);
    ctx.fillRect(x + 24*s, y - 20*s, 6*s, 15*s);
    
    // 얼굴
    ctx.fillStyle = '#FFE0BD';
    ctx.fillRect(x + 4*s, y - 10*s + nodOffset, 22*s, 28*s);
    
    // 안경 (더 디테일하게)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2*s;
    // 렌즈
    ctx.strokeRect(x + 6*s, y - 6*s + nodOffset, 7*s, 7*s);
    ctx.strokeRect(x + 17*s, y - 6*s + nodOffset, 7*s, 7*s);
    // 다리
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 13*s, y - 2*s + nodOffset, 4*s, 1*s);
    ctx.fillRect(x + 4*s, y - 4*s + nodOffset, 3*s, 1*s);
    ctx.fillRect(x + 23*s, y - 4*s + nodOffset, 3*s, 1*s);
    
    // 눈 (안경 너머)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 8*s, y - 4*s + nodOffset, 3*s, 3*s);
    ctx.fillRect(x + 19*s, y - 4*s + nodOffset, 3*s, 3*s);
    
    // 입 (따뜻한 미소)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 12*s, y + 10*s + nodOffset, 6*s, 2*s);
    ctx.fillRect(x + 10*s, y + 9*s + nodOffset, 2*s, 2*s);
    ctx.fillRect(x + 18*s, y + 9*s + nodOffset, 2*s, 2*s);
    
    // 캐주얼 티셔츠 (밝은 색상)
    ctx.fillStyle = '#FF6347'; // 토마토 레드
    ctx.fillRect(x - 3*s, y + 18*s, 36*s, 45*s);
    
    // 티셔츠 로고/패턴
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 10*s, y + 25*s, 10*s, 8*s);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 12*s, y + 27*s, 6*s, 4*s);
    
    // 티셔츠 소매
    ctx.fillStyle = '#FF6347';
    ctx.fillRect(x - 8*s, y + 20*s, 8*s, 15*s);
    ctx.fillRect(x + 30*s, y + 20*s, 8*s, 15*s);
    
    // 팔 (박수)
    const clapOffset = Math.sin(frame * 0.3) * 10*s;
    ctx.fillStyle = '#FFE0BD';
    // 왼팔
    ctx.fillRect(x - 12*s - clapOffset, y + 25*s, 8*s, 20*s);
    ctx.fillRect(x - 16*s - clapOffset, y + 23*s, 6*s, 10*s);
    // 오른팔
    ctx.fillRect(x + 34*s + clapOffset, y + 25*s, 8*s, 20*s);
    ctx.fillRect(x + 40*s + clapOffset, y + 23*s, 6*s, 10*s);
    
    // 청바지
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(x - 3*s, y + 63*s, 36*s, 25*s);
    
    // 청바지 스티치
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1*s;
    ctx.beginPath();
    ctx.moveTo(x + 2*s, y + 65*s);
    ctx.lineTo(x + 2*s, y + 85*s);
    ctx.moveTo(x + 28*s, y + 65*s);
    ctx.lineTo(x + 28*s, y + 85*s);
    ctx.stroke();
    
    // 다리
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(x + 8*s, y + 88*s, 6*s, 15*s);
    ctx.fillRect(x + 16*s, y + 88*s, 6*s, 15*s);
    
    // 운동화
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 6*s, y + 103*s, 10*s, 6*s);
    ctx.fillRect(x + 14*s, y + 103*s, 10*s, 6*s);
    // 운동화 줄무늬
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 8*s, y + 105*s, 6*s, 1*s);
    ctx.fillRect(x + 16*s, y + 105*s, 6*s, 1*s);
}

// 주황색 도마뱀 (키위 친구) 그리기 - 꼬리 없는 버전
function drawLizardFriend(ctx, centerX, centerY, frame) {
    // 도마뱀 기본 위치와 움직임
    const lizardX = centerX - 40;
    const baseY = centerY;
    
    // 껄충껑충 뛰는 애니메이션 (더 역동적으로)
    const jumpPhase = (frame % 120) / 120;
    let jumpY = 0;
    let isJumping = false;
    
    if (jumpPhase < 0.3) {
        // 점프 상승
        jumpY = Math.sin(jumpPhase * Math.PI / 0.3) * 25;
        isJumping = true;
    } else if (jumpPhase < 0.6) {
        // 착지 후 잠시 정지
        jumpY = 0;
        isJumping = false;
    } else if (jumpPhase < 0.9) {
        // 두 번째 점프
        jumpY = Math.sin((jumpPhase - 0.6) * Math.PI / 0.3) * 20;
        isJumping = true;
    }
    
    const lizardY = baseY - jumpY;
    
    // 도마뱀 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    const shadowWidth = isJumping ? 20 : 25;
    ctx.fillRect(lizardX - 2, baseY + 8, shadowWidth, 6);
    
    // 도마뱀 몸통 (주황색)
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(lizardX, lizardY, 20, 8);
    
    // 도마뱀 머리 (진한 주황색)
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(lizardX + 18, lizardY - 2, 8, 12);
    
    // 도마뱀 눈
    ctx.fillStyle = '#000000';
    ctx.fillRect(lizardX + 22, lizardY + 1, 2, 2);
    ctx.fillRect(lizardX + 22, lizardY + 5, 2, 2);
    
    // 눈 반짝임
    if (frame % 80 < 5) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(lizardX + 22, lizardY + 1, 1, 1);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(lizardX + 22, lizardY + 5, 1, 1);
    }
    
    // 도마뱀 다리 (뛸 때 접힘) - 어두운 주황색
    ctx.fillStyle = '#FF6600';
    if (isJumping) {
        // 뛸 때 - 다리 접힘
        ctx.fillRect(lizardX + 2, lizardY + 6, 4, 3);
        ctx.fillRect(lizardX + 14, lizardY + 6, 4, 3);
        // 뒷다리
        ctx.fillRect(lizardX - 2, lizardY + 4, 4, 5);
        ctx.fillRect(lizardX + 18, lizardY + 4, 4, 5);
    } else {
        // 서있을 때 - 다리 펴짐
        ctx.fillRect(lizardX + 2, lizardY + 8, 3, 6);
        ctx.fillRect(lizardX + 15, lizardY + 8, 3, 6);
        // 뒷다리
        ctx.fillRect(lizardX - 1, lizardY + 8, 3, 6);
        ctx.fillRect(lizardX + 18, lizardY + 8, 3, 6);
    }
    
    // 도마뱀 등 무늬 (어두운 주황색 점들)
    ctx.fillStyle = '#CC4400';
    ctx.fillRect(lizardX + 3, lizardY + 1, 2, 2);
    ctx.fillRect(lizardX + 8, lizardY + 2, 2, 1);
    ctx.fillRect(lizardX + 13, lizardY + 1, 2, 2);
    
    // 도마뱀 배 (연한 주황색)
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(lizardX + 2, lizardY + 6, 16, 2);
    
    // 혀 (가끔 날름)
    if (frame % 60 < 8) {
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(lizardX + 26, lizardY + 3, 4, 1);
    }
    
    // 기쁨 표현 (하트나 별)
    if (jumpY > 15) {
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(lizardX + 10, lizardY - 10, 6, 4);
        ctx.fillRect(lizardX + 8, lizardY - 8, 2, 2);
        ctx.fillRect(lizardX + 14, lizardY - 8, 2, 2);
    }
}

// 축하 리본 그리기
function drawCelebrationRibbons(ctx, canvas, frame) {
    const colors = ['#FF69B4', '#FFD700', '#87CEEB', '#98FB98'];
    
    for (let i = 0; i < 4; i++) {
        const x = (i * canvas.width / 3) + (Math.sin(frame * 0.02 + i) * 20);
        const y = 20 + Math.sin(frame * 0.03 + i) * 10;
        
        ctx.fillStyle = colors[i];
        // 리본 모양
        ctx.fillRect(x, y, 40, 8);
        ctx.fillRect(x + 5, y - 5, 30, 18);
        // 리본 끝
        ctx.fillRect(x - 10, y + 18, 15, 25);
        ctx.fillRect(x + 35, y + 18, 15, 25);
    }
}

// 가족 사랑 하트
function drawFamilyHearts(ctx, centerX, centerY, frame) {
    const hearts = [
        {x: centerX - 60, y: centerY - 50, size: 1},
        {x: centerX + 40, y: centerY - 60, size: 0.8},
        {x: centerX, y: centerY - 80, size: 1.2}
    ];
    
    hearts.forEach((heart, i) => {
        const phase = (frame + i * 20) % 60;
        const alpha = (Math.sin(phase * 0.1) + 1) * 0.5;
        const scale = heart.size * (1 + Math.sin(phase * 0.1) * 0.2);
        
        ctx.fillStyle = `rgba(255, 105, 180, ${alpha})`;
        // 하트 모양
        const x = heart.x;
        const y = heart.y;
        const s = scale * 8;
        
        ctx.fillRect(x - s, y, s * 2, s);
        ctx.fillRect(x - s * 1.5, y - s * 0.5, s, s);
        ctx.fillRect(x + s * 0.5, y - s * 0.5, s, s);
        ctx.fillRect(x - s * 0.5, y + s, s, s * 0.5);
    });
}

// 폭죽 효과
function drawFireworks(ctx, canvas, frame) {
    const fireworks = [
        {x: 80, y: 80, phase: frame % 120, color: '#FFD700'},
        {x: canvas.width - 80, y: 60, phase: (frame + 40) % 120, color: '#FF69B4'},
        {x: canvas.width / 2, y: 100, phase: (frame + 80) % 120, color: '#87CEEB'}
    ];
    
    fireworks.forEach(fw => {
        if (fw.phase < 60) {
            const size = (fw.phase / 60) * 40;
            const alpha = 1 - (fw.phase / 60);
            
            ctx.fillStyle = fw.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            
            // 폭죽 파편들
            for (let i = 0; i < 12; i++) {
                const angle = (i * Math.PI * 2) / 12;
                const x = fw.x + Math.cos(angle) * size;
                const y = fw.y + Math.sin(angle) * size;
                
                ctx.fillRect(x, y, 4, 4);
                
                // 꼬리 효과
                const tailX = fw.x + Math.cos(angle) * size * 0.7;
                const tailY = fw.y + Math.sin(angle) * size * 0.7;
                ctx.fillRect(tailX, tailY, 2, 2);
            }
        }
    });
}

// 집 안 배경
function drawHomeBackground(ctx, canvas) {
    // 벽 (하얀색)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 60);
    
    // 바닥 타일
    ctx.fillStyle = '#DEB887';
    for (let x = 0; x < canvas.width; x += 30) {
        for (let y = canvas.height - 60; y < canvas.height; y += 30) {
            ctx.fillRect(x, y, 28, 28);
        }
    }
    
    // 창문
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(canvas.width - 80, 40, 60, 60);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width - 80, 40, 60, 60);
    ctx.strokeRect(canvas.width - 50, 40, 0, 60);
    ctx.strokeRect(canvas.width - 80, 70, 60, 0);
    
    // 햇빛
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.fillRect(canvas.width - 120, 100, 40, 30);
}

// 먹이 그릇 (상세 버전)
function drawFoodBowl(ctx, centerX, centerY, frame) {
    // 그릇 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(centerX - 35, centerY + 15, 70, 8);
    
    // 그릇 바닥
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - 30, centerY, 60, 20);
    
    // 그릇 테두리
    ctx.fillStyle = '#CD853F';
    ctx.fillRect(centerX - 35, centerY - 5, 70, 8);
    ctx.fillRect(centerX - 35, centerY + 17, 70, 8);
    
    // 물 (약간 출렁이는 효과)
    const waterOffset = Math.sin(frame * 0.1) * 2;
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(centerX - 25, centerY + 3 + waterOffset, 50, 12);
    
    // 물 반사 효과
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(centerX - 20, centerY + 5 + waterOffset, 40, 3);
    
    // 그릇 장식
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(centerX - 10, centerY - 8, 20, 3);
    ctx.font = '12px Arial';
    ctx.fillText('KIWI', centerX - 15, centerY - 10);
}

// 키위 행복 표시
function drawKiwiHappiness(ctx, x, y, frame) {
    const happiness = [
        {type: 'heart', offset: 0, color: '#FF69B4'},
        {type: 'star', offset: 20, color: '#FFD700'},
        {type: 'note', offset: 40, color: '#32CD32'}
    ];
    
    happiness.forEach((item, i) => {
        const phase = (frame + i * 15) % 60;
        const floatY = y - Math.sin(phase * 0.1) * 20;
        const alpha = (Math.sin(phase * 0.1) + 1) * 0.5;
        
        ctx.fillStyle = item.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        
        switch(item.type) {
            case 'heart':
                // 하트
                ctx.fillRect(x - 4, floatY, 8, 6);
                ctx.fillRect(x - 6, floatY - 2, 4, 4);
                ctx.fillRect(x + 2, floatY - 2, 4, 4);
                break;
            case 'star':
                // 별
                ctx.fillRect(x + item.offset - 2, floatY, 4, 4);
                ctx.fillRect(x + item.offset, floatY - 2, 0, 8);
                ctx.fillRect(x + item.offset - 4, floatY + 2, 8, 0);
                break;
            case 'note':
                // 음표
                ctx.fillRect(x + item.offset, floatY, 2, 12);
                ctx.fillRect(x + item.offset - 3, floatY + 8, 6, 4);
                break;
        }
    });
}

// 따뜻한 분위기 효과
function drawWarmAtmosphere(ctx, canvas, frame) {
    // 따뜻한 빛 입자들
    for (let i = 0; i < 20; i++) {
        const x = (i * 50 + Math.sin(frame * 0.02 + i) * 30) % canvas.width;
        const y = 100 + Math.sin(frame * 0.03 + i) * 50;
        const alpha = (Math.sin(frame * 0.05 + i) + 1) * 0.3;
        
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 놀이방 배경
function drawPlayroomBackground(ctx, canvas) {
    // 벽지 (귀여운 패턴)
    ctx.fillStyle = '#FFE4E1';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 60);
    
    // 벽지 패턴 (작은 하트들)
    ctx.fillStyle = 'rgba(255, 182, 193, 0.3)';
    for (let x = 0; x < canvas.width; x += 40) {
        for (let y = 0; y < canvas.height - 60; y += 40) {
            ctx.fillRect(x + 15, y + 15, 8, 6);
            ctx.fillRect(x + 13, y + 13, 4, 4);
            ctx.fillRect(x + 19, y + 13, 4, 4);
        }
    }
    
    // 카펫
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(50, canvas.height - 120, canvas.width - 100, 80);
    ctx.fillStyle = '#FFB6C1';
    ctx.fillRect(60, canvas.height - 110, canvas.width - 120, 60);
}

// 하얀색 네모 텐트 (명확하게)
function drawWhiteSquareTent(ctx, centerX, centerY, frame) {
    const tentWidth = 140;
    const tentHeight = 80;
    
    // 텐트 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(centerX - tentWidth/2 - 8, centerY + tentHeight - 5, tentWidth + 16, 12);
    
    // 텐트 바닥 (회색 매트)
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(centerX - tentWidth/2, centerY + tentHeight - 15, tentWidth, 15);
    
    // 텐트 뒷벽 (하얀색)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(centerX - tentWidth/2, centerY + tentHeight - 15 - tentHeight, tentWidth, tentHeight);
    
    // 텐트 테두리 (검은 라인)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - tentWidth/2, centerY + tentHeight - 15 - tentHeight, tentWidth, tentHeight);
    
    // 텐트 지붕 (삼각형, 하얀색)
    ctx.fillStyle = '#F8F8FF';
    ctx.beginPath();
    ctx.moveTo(centerX - tentWidth/2, centerY + tentHeight - 15 - tentHeight);
    ctx.lineTo(centerX, centerY + tentHeight - 15 - tentHeight - 30);
    ctx.lineTo(centerX + tentWidth/2, centerY + tentHeight - 15 - tentHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 지붕 중앙선
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + tentHeight - 15 - tentHeight - 30);
    ctx.lineTo(centerX, centerY + tentHeight - 15 - tentHeight);
    ctx.stroke();
    
    // 텐트 입구 (네모난 문)
    const doorWidth = 40;
    const doorHeight = 50;
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(centerX - doorWidth/2, centerY + tentHeight - 15 - doorHeight, doorWidth, doorHeight);
    
    // 문 테두리
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - doorWidth/2, centerY + tentHeight - 15 - doorHeight, doorWidth, doorHeight);
    
    // 텐트 창문 (양쪽에)
    const windowSize = 15;
    // 왼쪽 창문
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(centerX - tentWidth/2 + 15, centerY + tentHeight - 15 - tentHeight + 20, windowSize, windowSize);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - tentWidth/2 + 15, centerY + tentHeight - 15 - tentHeight + 20, windowSize, windowSize);
    // 창문 십자
    ctx.beginPath();
    ctx.moveTo(centerX - tentWidth/2 + 15 + windowSize/2, centerY + tentHeight - 15 - tentHeight + 20);
    ctx.lineTo(centerX - tentWidth/2 + 15 + windowSize/2, centerY + tentHeight - 15 - tentHeight + 20 + windowSize);
    ctx.moveTo(centerX - tentWidth/2 + 15, centerY + tentHeight - 15 - tentHeight + 20 + windowSize/2);
    ctx.lineTo(centerX - tentWidth/2 + 15 + windowSize, centerY + tentHeight - 15 - tentHeight + 20 + windowSize/2);
    ctx.stroke();
    
    // 오른쪽 창문
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(centerX + tentWidth/2 - 30, centerY + tentHeight - 15 - tentHeight + 20, windowSize, windowSize);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX + tentWidth/2 - 30, centerY + tentHeight - 15 - tentHeight + 20, windowSize, windowSize);
    // 창문 십자
    ctx.beginPath();
    ctx.moveTo(centerX + tentWidth/2 - 30 + windowSize/2, centerY + tentHeight - 15 - tentHeight + 20);
    ctx.lineTo(centerX + tentWidth/2 - 30 + windowSize/2, centerY + tentHeight - 15 - tentHeight + 20 + windowSize);
    ctx.moveTo(centerX + tentWidth/2 - 30, centerY + tentHeight - 15 - tentHeight + 20 + windowSize/2);
    ctx.lineTo(centerX + tentWidth/2 - 30 + windowSize, centerY + tentHeight - 15 - tentHeight + 20 + windowSize/2);
    ctx.stroke();
    
    // 텐트 깃발 (지붕 위)
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(centerX - 2, centerY + tentHeight - 15 - tentHeight - 40, 4, 15);
    ctx.fillRect(centerX + 2, centerY + tentHeight - 15 - tentHeight - 35, 12, 8);
}

// 고급 장난감 컬렉션 (더 디테일하게)
function drawAdvancedToyCollection(ctx, centerX, centerY, frame) {
    const baseY = centerY + 60;
    
    // 레고 블록 타워 (무지개색)
    const blockColors = ['#FF0000', '#FFD700', '#00FF00', '#0000FF', '#9370DB'];
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = blockColors[i];
        ctx.fillRect(centerX - 80, baseY - i * 15, 20, 15);
        // 블록 돌기들
        ctx.fillStyle = blockColors[i];
        for (let j = 0; j < 4; j++) {
            ctx.beginPath();
            ctx.arc(centerX - 75 + j * 5, baseY - i * 15 - 3, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        // 블록 테두리
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX - 80, baseY - i * 15, 20, 15);
    }
    
    // 공들 (여러 개, 굴러가는 애니메이션)
    const balls = [
        {x: centerX - 40, color: '#FF69B4', size: 12},
        {x: centerX - 20, color: '#32CD32', size: 10},
        {x: centerX, color: '#FFD700', size: 8}
    ];
    
    balls.forEach((ball, i) => {
        const ballX = ball.x + Math.sin(frame * 0.05 + i) * 15;
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ballX, baseY + 10, ball.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 공 패턴/무늬
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ballX - ball.size/3, baseY + 10 - ball.size/3, ball.size/4, 0, Math.PI * 2);
        ctx.fill();
        
        // 공 그림자
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(ballX, baseY + 20, ball.size * 0.8, ball.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 테디베어 (큰 인형)
    const bearX = centerX + 30;
    const bearY = baseY - 10;
    const bearSway = Math.sin(frame * 0.06) * 2;
    
    // 곰 몸
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(bearX + bearSway, bearY, 18, 25);
    
    // 곰 머리
    ctx.fillStyle = '#DEB887';
    ctx.beginPath();
    ctx.arc(bearX + 9 + bearSway, bearY - 5, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // 곰 귀
    ctx.beginPath();
    ctx.arc(bearX + 3 + bearSway, bearY - 12, 5, 0, Math.PI * 2);
    ctx.arc(bearX + 15 + bearSway, bearY - 12, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 곰 눈
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(bearX + 6 + bearSway, bearY - 7, 2, 0, Math.PI * 2);
    ctx.arc(bearX + 12 + bearSway, bearY - 7, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 곰 코
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(bearX + 8 + bearSway, bearY - 3, 2, 2);
    
    // 곰 팔다리
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(bearX - 3 + bearSway, bearY + 5, 8, 15);
    ctx.fillRect(bearX + 13 + bearSway, bearY + 5, 8, 15);
    ctx.fillRect(bearX + 3 + bearSway, bearY + 25, 6, 12);
    ctx.fillRect(bearX + 9 + bearSway, bearY + 25, 6, 12);
    
    // 자동차들 (더 디테일하게)
    const cars = [
        {x: centerX + 60, color: '#FF0000', type: 'sports'},
        {x: centerX + 85, color: '#0000FF', type: 'truck'},
        {x: centerX + 110, color: '#00FF00', type: 'police'}
    ];
    
    cars.forEach(car => {
        const carY = baseY + 5;
        
        // 차 몸체
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x, carY, 22, 10);
        
        if (car.type === 'truck') {
            // 트럭 적재함
            ctx.fillRect(car.x - 8, carY, 8, 10);
        } else if (car.type === 'sports') {
            // 스포츠카 스포일러
            ctx.fillRect(car.x - 3, carY + 2, 3, 6);
        }
        
        // 바퀴
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(car.x + 4, carY + 12, 4, 0, Math.PI * 2);
        ctx.arc(car.x + 18, carY + 12, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 바퀴 림
        ctx.fillStyle = '#SILVER';
        ctx.beginPath();
        ctx.arc(car.x + 4, carY + 12, 2, 0, Math.PI * 2);
        ctx.arc(car.x + 18, carY + 12, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 창문
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(car.x + 3, carY + 1, 16, 6);
        
        // 경찰차 표시
        if (car.type === 'police') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(car.x + 8, carY + 3, 6, 2);
        }
    });
    
    // 퍼즐 조각들 (바닥에 흩어져 있는)
    const puzzlePieces = [
        {x: centerX - 60, y: baseY + 25, color: '#FF69B4'},
        {x: centerX - 45, y: baseY + 30, color: '#32CD32'},
        {x: centerX - 30, y: baseY + 28, color: '#FFD700'},
        {x: centerX - 15, y: baseY + 32, color: '#9370DB'}
    ];
    
    puzzlePieces.forEach((piece, i) => {
        const rotation = Math.sin(frame * 0.03 + i) * 0.2;
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(rotation);
        
        ctx.fillStyle = piece.color;
        ctx.fillRect(-6, -6, 12, 12);
        // 퍼즐 돌기
        ctx.fillRect(6, -2, 4, 4);
        ctx.fillRect(-2, -10, 4, 4);
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-6, -6, 12, 12);
        ctx.strokeRect(6, -2, 4, 4);
        ctx.strokeRect(-2, -10, 4, 4);
        
        ctx.restore();
    });
}

// 텐트 내부 조명 (개선)
function drawTentInteriorLighting(ctx, centerX, centerY, frame) {
    // 따뜻한 내부 조명 효과
    const lightIntensity = (Math.sin(frame * 0.04) + 1) * 0.2 + 0.3;
    
    const gradient = ctx.createRadialGradient(
        centerX, centerY + 20, 0,
        centerX, centerY + 20, 100
    );
    gradient.addColorStop(0, `rgba(255, 248, 220, ${lightIntensity})`);
    gradient.addColorStop(0.7, `rgba(255, 248, 220, ${lightIntensity * 0.5})`);
    gradient.addColorStop(1, 'rgba(255, 248, 220, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(centerX - 100, centerY - 40, 200, 120);
}

// 향상된 놀이 효과
function drawEnhancedPlayEffects(ctx, centerX, centerY, frame) {
    // 비눗방울들
    for (let i = 0; i < 8; i++) {
        const bubbleX = centerX + Math.sin(frame * 0.02 + i) * 60;
        const bubbleY = centerY - 30 + Math.cos(frame * 0.03 + i) * 20;
        const bubbleSize = 3 + Math.sin(frame * 0.05 + i) * 2;
        
        // 방울 외곽
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
        ctx.stroke();
        
        // 방울 반사광
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(bubbleX - bubbleSize/3, bubbleY - bubbleSize/3, bubbleSize/3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 음표들 (즐거운 분위기)
    const notes = ['♪', '♫', '♩', '♬'];
    for (let i = 0; i < 4; i++) {
        const noteX = centerX - 50 + i * 30;
        const noteY = centerY - 50 + Math.sin(frame * 0.08 + i) * 15;
        const alpha = (Math.sin(frame * 0.06 + i) + 1) * 0.4;
        
        ctx.fillStyle = `rgba(255, 105, 180, ${alpha})`;
        ctx.font = '16px Arial';
        ctx.fillText(notes[i], noteX, noteY);
    }
    
    // 반짝이는 먼지 (더 세밀하게)
    for (let i = 0; i < 20; i++) {
        const sparkleX = centerX + Math.cos(frame * 0.03 + i) * 80;
        const sparkleY = centerY + Math.sin(frame * 0.04 + i) * 40;
        const sparklePhase = (frame + i * 5) % 40;
        const alpha = sparklePhase < 20 ? sparklePhase / 20 : (40 - sparklePhase) / 20;
        
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.9})`;
        ctx.fillRect(sparkleX - 1, sparkleY - 1, 2, 2);
        
        // 십자 반짝임
        if (alpha > 0.5) {
            ctx.fillRect(sparkleX - 3, sparkleY, 6, 1);
            ctx.fillRect(sparkleX, sparkleY - 3, 1, 6);
        }
    }
}

// 엔딩 파티클 생성 함수
function createEndingParticles() {
    // particles 배열이 game.js에 정의되어 있는지 확인
    if (typeof particles === 'undefined') {
        window.particles = [];
    }
    
    // 축하 파티클 효과 생성
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 10,
            vy: Math.random() * -10 - 5,
            color: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98'][Math.floor(Math.random() * 4)],
            life: 100 + Math.random() * 50
        });
    }

}
