// 배경 렌더링 시스템

// 메인 배경 그리기 함수
function drawBackground(ctx, canvas, gameState) {
    // 시간에 따른 하늘 색상 변화 (낮/노을/밤 느낌)
    const timePhase = (gameState.distance / 1000) % 3;
    let skyColors;
    
    if (timePhase < 1) {
        // 아침/낮 - 파란 하늘
        skyColors = ['#87CEEB', '#98D8E8', '#B0E0E6'];
    } else if (timePhase < 2) {
        // 노을 - 오렌지/핑크 하늘
        skyColors = ['#FF6B6B', '#FF8E8E', '#FFB6C1'];
    } else {
        // 밤 - 보라/남색 하늘
        skyColors = ['#2F1B69', '#4B0082', '#6A0DAD'];
    }
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, skyColors[0]);
    gradient.addColorStop(0.7, skyColors[1]);
    gradient.addColorStop(1, skyColors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 별과 달 (밤 시간대)
    if (timePhase >= 2) {
        drawStars(ctx, canvas, gameState);
        drawMoon(ctx, canvas);
    } else {
        // 태양과 구름 (낮/노을 시간대)
        drawSun(ctx, canvas, gameState, timePhase);
        drawClouds(ctx, canvas, gameState);
    }
    
    // 무지개 (가끔 등장)
    if (Math.sin(gameState.distance / 500) > 0.7) {
        drawRainbow(ctx, canvas);
    }
    
    // 원거리 산들 (다층 패럴랙스)
    drawMountainLayers(ctx, canvas, gameState);
    
    // 나무들과 식물들
    drawVegetation(ctx, canvas, gameState);
    
    // 꽃밭과 나비들
    drawFlowerField(ctx, canvas, gameState);
    
    // 새들과 구름 그림자
    drawFlyingElements(ctx, canvas, gameState);
    
    // 마법같은 파티클들
    drawMagicalParticles(ctx, canvas, gameState);
}

// 별들 그리기
function drawStars(ctx, canvas, gameState) {
    ctx.fillStyle = '#FFFF99';
    for (let i = 0; i < 50; i++) {
        const x = (i * 137 + gameState.distance * 0.1) % canvas.width;
        const y = (i * 71) % (canvas.height * 0.6);
        const size = 1 + (i % 3);
        
        // 반짝이는 효과
        const twinkle = Math.sin(gameState.distance * 0.05 + i) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// 달 그리기
function drawMoon(ctx, canvas) {
    const moonX = canvas.width - 120;
    const moonY = 60;
    
    // 달 뒤 후광
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 80);
    moonGlow.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    moonGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(moonX - 80, moonY - 80, 160, 160);
    
    // 달 본체
    ctx.fillStyle = '#F5F5DC';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 35, 0, Math.PI * 2);
    ctx.fill();
    
    // 달 크레이터
    ctx.fillStyle = '#E6E6FA';
    ctx.beginPath();
    ctx.arc(moonX - 10, moonY - 5, 8, 0, Math.PI * 2);
    ctx.arc(moonX + 8, moonY + 10, 5, 0, Math.PI * 2);
    ctx.arc(moonX - 5, moonY + 15, 4, 0, Math.PI * 2);
    ctx.fill();
}

// 태양 그리기 (시간대별)
function drawSun(ctx, canvas, gameState, timePhase) {
    const sunX = canvas.width - 150;
    const sunY = 80 + Math.sin(timePhase) * 30;
    let sunColor = '#FFD700';
    
    if (timePhase >= 1) {
        // 노을 시간 - 붉은 태양
        sunColor = '#FF6347';
    }
    
    // 태양 후광
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 100);
    sunGlow.addColorStop(0, sunColor + '80');
    sunGlow.addColorStop(1, sunColor + '00');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(sunX - 100, sunY - 100, 200, 200);
    
    // 태양 본체
    ctx.fillStyle = sunColor;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // 태양 광선
    ctx.strokeStyle = sunColor;
    ctx.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12 + gameState.distance * 0.01;
        const length = 50 + Math.sin(gameState.distance * 0.1 + i) * 10;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(angle) * 50, sunY + Math.sin(angle) * 50);
        ctx.lineTo(sunX + Math.cos(angle) * length, sunY + Math.sin(angle) * length);
        ctx.stroke();
    }
}

// 구름들 그리기
function drawClouds(ctx, canvas, gameState) {
    const cloudOffset = (gameState.backgroundOffset * 0.3) % (canvas.width + 400);
    
    // 다양한 크기와 모양의 구름들
    const clouds = [
        {x: 100, y: 60, size: 1.2, opacity: 0.9},
        {x: 350, y: 40, size: 0.8, opacity: 0.7},
        {x: 600, y: 80, size: 1.5, opacity: 0.8},
        {x: 900, y: 50, size: 1.0, opacity: 0.9},
        {x: 1200, y: 70, size: 1.3, opacity: 0.6}
    ];
    
    clouds.forEach(cloud => {
        drawDetailedCloud(ctx, canvas, cloud.x - cloudOffset, cloud.y, cloud.size, cloud.opacity);
    });
}

// 상세한 구름 그리기
function drawDetailedCloud(ctx, canvas, x, y, size, opacity) {
    if (x < -200 || x > canvas.width + 200) return;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    
    // 구름의 여러 원들로 자연스러운 모양 만들기
    const circles = [
        {offsetX: 0, offsetY: 0, radius: 25 * size},
        {offsetX: 20 * size, offsetY: -5 * size, radius: 35 * size},
        {offsetX: 45 * size, offsetY: 0, radius: 25 * size},
        {offsetX: 25 * size, offsetY: -20 * size, radius: 20 * size},
        {offsetX: 60 * size, offsetY: -10 * size, radius: 18 * size}
    ];
    
    ctx.beginPath();
    circles.forEach(circle => {
        ctx.arc(x + circle.offsetX, y + circle.offsetY, circle.radius, 0, Math.PI * 2);
    });
    ctx.fill();
    
    // 구름 그림자
    ctx.fillStyle = `rgba(200, 200, 200, ${opacity * 0.3})`;
    ctx.beginPath();
    circles.forEach(circle => {
        ctx.arc(x + circle.offsetX + 5, y + circle.offsetY + 5, circle.radius * 0.9, 0, Math.PI * 2);
    });
    ctx.fill();
}

// 무지개 그리기
function drawRainbow(ctx, canvas) {
    const centerX = canvas.width * 0.7;
    const centerY = canvas.height;
    const rainbowColors = [
        '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', 
        '#0000FF', '#4B0082', '#9400D3'
    ];
    
    ctx.globalAlpha = 0.6;
    rainbowColors.forEach((color, index) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 200 - index * 12, Math.PI, 0);
        ctx.stroke();
    });
    ctx.globalAlpha = 1;
}

// 산맥 레이어들 그리기
function drawMountainLayers(ctx, canvas, gameState) {
    // 가장 먼 산맥들 (보라색 계열) - 오른쪽에서 왼쪽으로 움직임
    const farOffset = (gameState.backgroundOffset * 0.1) % (canvas.width + 600);
    ctx.fillStyle = '#9370DB';
    // 여러 개의 산을 반복해서 그리기
    for (let i = 0; i < 3; i++) {
        const xPos = i * (canvas.width + 600) - farOffset;
        drawMountainRange(ctx, canvas, xPos, GROUND_Y - 180, 8, 150);
    }
    
    // 중간 산맥들 (파란색 계열)
    const midOffset = (gameState.backgroundOffset * 0.2) % (canvas.width + 500);
    ctx.fillStyle = '#4682B4';
    for (let i = 0; i < 3; i++) {
        const xPos = i * (canvas.width + 500) - midOffset;
        drawMountainRange(ctx, canvas, xPos, GROUND_Y - 130, 6, 120);
    }
    
    // 가까운 산맥들 (초록색 계열)
    const nearOffset = (gameState.backgroundOffset * 0.3) % (canvas.width + 400);
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 3; i++) {
        const xPos = i * (canvas.width + 400) - nearOffset;
        drawMountainRange(ctx, canvas, xPos, GROUND_Y - 80, 5, 100);
    }
}

// 산맥 그리기
function drawMountainRange(ctx, canvas, startX, baseY, count, maxHeight) {
    ctx.beginPath();
    ctx.moveTo(startX, baseY);
    
    for (let i = 0; i <= count; i++) {
        const x = startX + (i * (canvas.width + 200)) / count;
        const height = maxHeight * (0.5 + Math.sin(i * 0.7) * 0.5);
        ctx.lineTo(x, baseY - height);
    }
    
    ctx.lineTo(startX + canvas.width + 200, baseY);
    ctx.closePath();
    ctx.fill();
    
    // 산에 눈 덮인 봉우리
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i <= count; i++) {
        const x = startX + (i * (canvas.width + 200)) / count;
        const height = maxHeight * (0.5 + Math.sin(i * 0.7) * 0.5);
        if (height > maxHeight * 0.7) {
            ctx.beginPath();
            ctx.arc(x, baseY - height, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 식물들 그리기
function drawVegetation(ctx, canvas, gameState) {
    const treeOffset = (gameState.backgroundOffset * 0.5) % (canvas.width + 400);
    
    // 다양한 나무들
    const trees = [
        {x: 120, type: 'pine', size: 1.0},
        {x: 280, type: 'oak', size: 1.2},
        {x: 450, type: 'pine', size: 0.8},
        {x: 620, type: 'birch', size: 1.1},
        {x: 800, type: 'oak', size: 1.3},
        {x: 950, type: 'pine', size: 0.9},
        {x: 1150, type: 'birch', size: 1.0}
    ];
    
    trees.forEach(tree => {
        drawDetailedTree(ctx, canvas, tree.x - treeOffset, GROUND_Y, tree.type, tree.size);
    });
}

// 상세한 나무 그리기
function drawDetailedTree(ctx, canvas, x, y, type, size) {
    if (x < -100 || x > canvas.width + 100) return;
    
    const trunkHeight = 60 * size;
    const trunkWidth = 12 * size;
    
    // 나무 기둥
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - trunkWidth/2, y - trunkHeight, trunkWidth, trunkHeight);
    
    // 나무 기둥 텍스처
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x - trunkWidth/2 + 2, y - trunkHeight + i * 20);
        ctx.lineTo(x + trunkWidth/2 - 2, y - trunkHeight + i * 20);
        ctx.stroke();
    }
    
    // 나무 종류별 잎사귀
    switch(type) {
        case 'pine':
            drawPineLeaves(ctx, x, y - trunkHeight, size);
            break;
        case 'oak':
            drawOakLeaves(ctx, x, y - trunkHeight + 10, size);
            break;
        case 'birch':
            drawBirchLeaves(ctx, x, y - trunkHeight + 5, size);
            break;
    }
}

// 소나무 잎 그리기
function drawPineLeaves(ctx, x, y, size) {
    ctx.fillStyle = '#228B22';
    // 삼각형 모양들
    for (let i = 0; i < 3; i++) {
        const leafY = y + i * 15 * size;
        const leafSize = (35 - i * 5) * size;
        ctx.beginPath();
        ctx.moveTo(x, leafY - leafSize);
        ctx.lineTo(x - leafSize/2, leafY);
        ctx.lineTo(x + leafSize/2, leafY);
        ctx.closePath();
        ctx.fill();
    }
}

// 참나무 잎 그리기
function drawOakLeaves(ctx, x, y, size) {
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.arc(x, y, 35 * size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(x - 20 * size, y - 10 * size, 20 * size, 0, Math.PI * 2);
    ctx.arc(x + 20 * size, y - 10 * size, 20 * size, 0, Math.PI * 2);
    ctx.fill();
}

// 자작나무 잎 그리기
function drawBirchLeaves(ctx, x, y, size) {
    ctx.fillStyle = '#90EE90';
    // 타원형 잎들
    for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const leafX = x + Math.cos(angle) * 25 * size;
        const leafY = y + Math.sin(angle) * 15 * size;
        
        ctx.beginPath();
        ctx.ellipse(leafX, leafY, 12 * size, 8 * size, angle, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 꽃밭 그리기
function drawFlowerField(ctx, canvas, gameState) {
    const flowerOffset = (gameState.backgroundOffset * 0.7) % (canvas.width + 300);
    
    // 잔디
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 50; i++) {
        const x = (i * 30 - flowerOffset) % (canvas.width + 100);
        if (x > -50 && x < canvas.width + 50) {
            drawGrass(ctx, x, GROUND_Y + 5);
        }
    }
    
    // 꽃들
    const flowers = [
        {x: 80, color: '#FF69B4', type: 'rose'},
        {x: 180, color: '#FFB6C1', type: 'daisy'},
        {x: 280, color: '#FF1493', type: 'tulip'},
        {x: 380, color: '#FFC0CB', type: 'rose'},
        {x: 480, color: '#FFD700', type: 'sunflower'},
        {x: 580, color: '#FF69B4', type: 'daisy'},
        {x: 680, color: '#9370DB', type: 'lavender'}
    ];
    
    flowers.forEach(flower => {
        drawDetailedFlower(ctx, canvas, flower.x - flowerOffset, GROUND_Y + 10, flower.color, flower.type);
    });
    
    // 나비들
    drawButterflies(ctx, canvas, gameState, flowerOffset);
}

// 잔디 그리기
function drawGrass(ctx, x, y) {
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 3, y);
        ctx.lineTo(x + i * 3 + Math.random() * 4 - 2, y - 8 - Math.random() * 5);
        ctx.stroke();
    }
}

// 상세한 꽃 그리기
function drawDetailedFlower(ctx, canvas, x, y, color, type) {
    if (x < -50 || x > canvas.width + 50) return;
    
    // 꽃 줄기
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 25);
    ctx.stroke();
    
    // 잎사귀
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.ellipse(x - 8, y - 15, 5, 10, -0.5, 0, Math.PI * 2);
    ctx.ellipse(x + 8, y - 12, 5, 10, 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 꽃 종류별 그리기
    switch(type) {
        case 'rose':
            drawRose(ctx, x, y - 25, color);
            break;
        case 'daisy':
            drawDaisy(ctx, x, y - 25, color);
            break;
        case 'tulip':
            drawTulip(ctx, x, y - 25, color);
            break;
        case 'sunflower':
            drawSunflower(ctx, x, y - 25);
            break;
        case 'lavender':
            drawLavender(ctx, x, y - 25, color);
            break;
    }
}

// 장미 그리기
function drawRose(ctx, x, y, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const petalX = x + Math.cos(angle) * 6;
        const petalY = y + Math.sin(angle) * 6;
        ctx.beginPath();
        ctx.ellipse(petalX, petalY, 8, 4, angle, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 중심
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
}

// 데이지 그리기
function drawDaisy(ctx, x, y, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(angle) * 8, y + Math.sin(angle) * 8, 4, 8, angle, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
}

// 튤립 그리기
function drawTulip(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x - 2, y - 3, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();
}

// 해바라기 그리기
function drawSunflower(ctx, x, y) {
    // 노란 꽃잎들
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(angle) * 12, y + Math.sin(angle) * 12, 5, 10, angle, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 갈색 중심
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 씨앗 패턴
    ctx.fillStyle = '#654321';
    for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI * 2) / 16;
        const dotX = x + Math.cos(angle) * 5;
        const dotY = y + Math.sin(angle) * 5;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 라벤더 그리기
function drawLavender(ctx, x, y, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(x + (i - 2) * 2, y - i * 3, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 나비들 그리기
function drawButterflies(ctx, canvas, gameState, offset) {
    const butterflies = [
        {x: 200, y: GROUND_Y - 40, color1: '#FF69B4', color2: '#FFB6C1'},
        {x: 450, y: GROUND_Y - 60, color1: '#9370DB', color2: '#DDA0DD'},
        {x: 700, y: GROUND_Y - 35, color1: '#FFD700', color2: '#FFFF99'}
    ];
    
    butterflies.forEach(butterfly => {
        const x = butterfly.x - offset * 0.8; // 방향 변경
        if (x > -50 && x < canvas.width + 50) {
            drawButterfly(ctx, gameState, x, butterfly.y, butterfly.color1, butterfly.color2);
        }
    });
}

// 나비 그리기
function drawButterfly(ctx, gameState, x, y, color1, color2) {
    const wingOffset = Math.sin(gameState.distance * 0.1) * 2;
    
    // 몸통
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 1, y - 8, 2, 16);
    
    // 날개들
    ctx.fillStyle = color1;
    ctx.beginPath();
    ctx.ellipse(x - 5, y - 3 + wingOffset, 6, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 5, y - 3 + wingOffset, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.ellipse(x - 5, y + 5 - wingOffset, 4, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 5, y + 5 - wingOffset, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 더듬이
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 2, y - 8);
    ctx.lineTo(x - 4, y - 12);
    ctx.moveTo(x + 2, y - 8);
    ctx.lineTo(x + 4, y - 12);
    ctx.stroke();
}

// 날아다니는 요소들
function drawFlyingElements(ctx, canvas, gameState) {
    // 새들 (개선된 버전)
    const birdOffset = (gameState.backgroundOffset * 0.6) % (canvas.width + 500);
    const birds = [
        {x: 150, y: 80, type: 'seagull'},
        {x: 400, y: 120, type: 'sparrow'},
        {x: 650, y: 60, type: 'eagle'},
        {x: 900, y: 100, type: 'sparrow'}
    ];
    
    birds.forEach(bird => {
        drawDetailedBird(ctx, canvas, gameState, bird.x - birdOffset, bird.y, bird.type); // 방향 변경
    });
    
    // 민들레 씨앗들
    drawDandelionSeeds(ctx, canvas, gameState);
}

// 상세한 새 그리기
function drawDetailedBird(ctx, canvas, gameState, x, y, type) {
    if (x < -50 || x > canvas.width + 50) return;
    
    const wingFlap = Math.sin(gameState.distance * 0.2) * 5;
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    switch(type) {
        case 'seagull':
            // 갈매기 - 큰 날개
            ctx.beginPath();
            ctx.moveTo(x - 15, y + wingFlap);
            ctx.lineTo(x, y - 8);
            ctx.lineTo(x + 15, y + wingFlap);
            ctx.stroke();
            break;
        case 'sparrow':
            // 참새 - 작은 날개
            ctx.beginPath();
            ctx.moveTo(x - 8, y + wingFlap);
            ctx.lineTo(x, y - 4);
            ctx.lineTo(x + 8, y + wingFlap);
            ctx.stroke();
            break;
        case 'eagle':
            // 독수리 - 큰 날개, 더 긴 날개폭
            ctx.beginPath();
            ctx.moveTo(x - 20, y + wingFlap);
            ctx.lineTo(x, y - 10);
            ctx.lineTo(x + 20, y + wingFlap);
            ctx.stroke();
            break;
    }
}

// 민들레 씨앗들
function drawDandelionSeeds(ctx, canvas, gameState) {
    for (let i = 0; i < 15; i++) {
        const x = (i * 150 + gameState.distance * 0.3) % (canvas.width + 100);
        const y = 50 + Math.sin(gameState.distance * 0.05 + i) * 30;
        
        if (x > -20 && x < canvas.width + 20) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // 씨앗 털
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            for (let j = 0; j < 6; j++) {
                const angle = (j * Math.PI * 2) / 6;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle) * 6, y + Math.sin(angle) * 6);
                ctx.stroke();
            }
        }
    }
}

// 마법같은 파티클들
function drawMagicalParticles(ctx, canvas, gameState) {
    for (let i = 0; i < 25; i++) {
        const x = (i * 200 + gameState.distance * 0.4) % (canvas.width + 150);
        const y = GROUND_Y - 100 + Math.sin(gameState.distance * 0.03 + i) * 50;
        
        if (x > -30 && x < canvas.width + 30) {
            const alpha = (Math.sin(gameState.distance * 0.05 + i) + 1) * 0.3;
            const colors = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD'];
            const color = colors[i % colors.length];
            
            ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(x, y, 3 + Math.sin(gameState.distance * 0.08 + i) * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // 반짝이는 효과
            if (Math.random() < 0.1) {
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}