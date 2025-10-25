// 파티클 시스템 관련 코드

// 파티클 배열들
let particles = [];
let textParticles = [];

// 파티클 생성 함수
function createParticles(x, y, type) {
    const colors = {
        'hit': ['#FFD700', '#FFA500', '#FF6347'],
        'defeat': ['#32CD32', '#00FF00', '#7FFF00'],
        'hurt': ['#FF0000', '#DC143C', '#8B0000'],
        'hint': ['#FFFF00', '#FFD700', '#FFA500']
    };
    
    const particleColors = colors[type] || colors['hit'];
    const particleCount = type === 'hint' ? 5 : 10;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: Math.random() * -10 - 5,
            color: particleColors[Math.floor(Math.random() * particleColors.length)],
            life: type === 'hint' ? 20 : 30
        });
    }
}

// 파티클 업데이트
function updateParticles() {
    particles = particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.5;
        particle.life--;
        return particle.life > 0;
    });
}

// 텍스트 파티클 업데이트
function updateTextParticles(ctx) {
    textParticles = textParticles.filter(particle => {
        particle.y -= particle.speed;
        particle.life--;
        particle.alpha = particle.life / particle.maxLife;
        
        if (particle.life > 0) {
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.font = `${particle.size}px Jua`;
            ctx.textAlign = 'center';
            ctx.fillText(particle.text, particle.x, particle.y);
            ctx.restore();
            return true;
        }
        return false;
    });
}

// 텍스트 파티클 생성 함수
function createTextParticle(x, y, text, color = '#FFD700', size = 24) {
    textParticles.push({
        x: x,
        y: y,
        text: text,
        color: color,
        size: size,
        speed: 2,
        life: 60,
        maxLife: 60,
        alpha: 1
    });
}

// 파티클 렌더링 함수
function renderParticles(ctx) {
    // 일반 파티클 그리기
    particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 4, 4);
    });
    
    // 텍스트 파티클 그리기
    updateTextParticles(ctx);
}

// 파티클 초기화 함수
function clearParticles() {
    particles = [];
    textParticles = [];
}