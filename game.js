// 화면 전환 함수들
function showMainMenu() {
    const mainScreen = document.getElementById('mainScreen');
    const countryMenu = document.getElementById('countryMenu');
    const capitalMenu = document.getElementById('capitalMenu');
    const gameScreen = document.getElementById('gameScreen');
    const hallOfFameScreen = document.getElementById('hallOfFameScreen');
    
    if (mainScreen) mainScreen.classList.remove('hidden');
    if (countryMenu) countryMenu.classList.add('hidden');
    if (capitalMenu) capitalMenu.classList.add('hidden');
    if (gameScreen) gameScreen.classList.add('hidden');
    if (hallOfFameScreen) hallOfFameScreen.classList.add('hidden');
}

function showCountryMenu() {
    const mainScreen = document.getElementById('mainScreen');
    const countryMenu = document.getElementById('countryMenu');
    const capitalMenu = document.getElementById('capitalMenu');
    const gameScreen = document.getElementById('gameScreen');
    const hallOfFameScreen = document.getElementById('hallOfFameScreen');
    
    if (mainScreen) mainScreen.classList.add('hidden');
    if (countryMenu) countryMenu.classList.remove('hidden');
    if (capitalMenu) capitalMenu.classList.add('hidden');
    if (gameScreen) gameScreen.classList.add('hidden');
    if (hallOfFameScreen) hallOfFameScreen.classList.add('hidden');
}

function showCapitalMenu() {
    const mainScreen = document.getElementById('mainScreen');
    const countryMenu = document.getElementById('countryMenu');
    const capitalMenu = document.getElementById('capitalMenu');
    const gameScreen = document.getElementById('gameScreen');
    const hallOfFameScreen = document.getElementById('hallOfFameScreen');
    
    if (mainScreen) mainScreen.classList.add('hidden');
    if (countryMenu) countryMenu.classList.add('hidden');
    if (capitalMenu) capitalMenu.classList.remove('hidden');
    if (gameScreen) gameScreen.classList.add('hidden');
    if (hallOfFameScreen) hallOfFameScreen.classList.add('hidden');
}

function showGameScreen() {
    const mainScreen = document.getElementById('mainScreen');
    const countryMenu = document.getElementById('countryMenu');
    const capitalMenu = document.getElementById('capitalMenu');
    const gameScreen = document.getElementById('gameScreen');
    const hallOfFameScreen = document.getElementById('hallOfFameScreen');
    
    if (mainScreen) mainScreen.classList.add('hidden');
    if (countryMenu) countryMenu.classList.add('hidden');
    if (capitalMenu) capitalMenu.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');
    if (hallOfFameScreen) hallOfFameScreen.classList.add('hidden');
}

async function showHallOfFame() {
    const mainScreen = document.getElementById('mainScreen');
    const countryMenu = document.getElementById('countryMenu');
    const capitalMenu = document.getElementById('capitalMenu');
    const gameScreen = document.getElementById('gameScreen');
    const hallOfFameScreen = document.getElementById('hallOfFameScreen');
    
    if (mainScreen) mainScreen.classList.add('hidden');
    if (countryMenu) countryMenu.classList.add('hidden');
    if (capitalMenu) capitalMenu.classList.add('hidden');
    if (gameScreen) gameScreen.classList.add('hidden');
    if (hallOfFameScreen) hallOfFameScreen.classList.remove('hidden');
    
    // 명예의 전당 데이터 로드 및 표시
    if (window.hallOfFame) {
        await window.hallOfFame.displayAllScores();
    }
}

function startGame(mode) {
    showGameScreen();
    if (window.flagQuizGame) {
        window.flagQuizGame.startNewGame(mode);
    }
}

// 명예의 전당 관리 클래스
class HallOfFame {
    constructor() {
        this.SHEET_URL = 'https://script.google.com/macros/s/AKfycbx-z0P7TY0DHmyQG-ixMJV7RyE-94jBxvQDL-C1dcOZNe9qKKOTv0q7Fwo_32fAWGTG/exec';
        this.maxEntries = 10;
    }

    // XSS 방지를 위한 HTML 이스케이프
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 점수 저장 (Google Sheets에)
    async saveScore(name, score, totalQuestions, mode, timeTaken) {
        const sanitizedName = name.trim().slice(0, 10);
        if (sanitizedName.length === 0) return false;

        const maxQuestions = mode.includes('yuli') ? 34 : 195;
        const percentage = Math.round((score / maxQuestions) * 100);
        
        const newEntry = {
            name: sanitizedName,
            score: score,
            total: totalQuestions,
            percentage: percentage,
            mode: mode,
            timeTaken: timeTaken,
            date: new Date().toISOString()
        };

        try {
            // Google Sheets에 저장
            await fetch(this.SHEET_URL, {
                method: 'POST',
                body: JSON.stringify(newEntry),
                headers: {
                    'Content-Type': 'text/plain'
                }
            });
            
            return true;
        } catch (error) {
            console.error('점수 저장 실패:', error);
            // 오프라인 대비 localStorage에도 저장
            this.saveToLocalStorage(newEntry);
            return true;
        }
    }

    // 점수 불러오기 (Google Sheets에서)
    async getScores() {
        try {
            const response = await fetch(this.SHEET_URL);
            const allScores = await response.json();
            
            // 모드별로 그룹화
            const groupedScores = {};
            allScores.forEach(score => {
                if (!groupedScores[score.mode]) {
                    groupedScores[score.mode] = [];
                }
                groupedScores[score.mode].push(score);
            });
            
            // 각 모드별로 정렬하고 상위 10개만
            for (const mode in groupedScores) {
                groupedScores[mode].sort((a, b) => {
                    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
                    if (b.score !== a.score) return b.score - a.score;
                    if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
                    return new Date(b.date) - new Date(a.date);
                });
                groupedScores[mode] = groupedScores[mode].slice(0, this.maxEntries);
            }
            
            return groupedScores;
        } catch (error) {
            console.error('점수 불러오기 실패:', error);
            // 오프라인 시 localStorage 사용
            return JSON.parse(localStorage.getItem('flagMasterHallOfFame') || '{}');
        }
    }

    // 로컬 저장소에 백업
    saveToLocalStorage(entry) {
        const scores = JSON.parse(localStorage.getItem('flagMasterHallOfFame') || '{}');
        if (!scores[entry.mode]) scores[entry.mode] = [];
        scores[entry.mode].push(entry);
        localStorage.setItem('flagMasterHallOfFame', JSON.stringify(scores));
    }

    // 특정 모드의 점수 불러오기
    async getScoresByMode(mode) {
        const scores = await this.getScores();
        return scores[mode] || [];
    }

    // 모든 점수 표시
    async displayAllScores() {
        const container = document.getElementById('hallOfFameContainer');
        if (!container) return;
        
        container.innerHTML = '<p style="text-align: center; color: white;">점수를 불러오는 중...</p>';
        
        const scores = await this.getScores();
        
        const modeNames = {
            'flag-to-country': '🏳️ 국기 → 나라명',
            'country-to-flag': '🌍 나라명 → 국기',
            'capital-easy': '🏙️ 국기+나라 → 수도',
            'capital-hard': '🏙️ 국기 → 수도',
            'capital-to-flag': '🏙️ 수도 → 국기',
            'capital-easy-yuli': '✨ 율이 모드: 국기+나라 → 수도',
            'capital-hard-yuli': '✨ 율이 모드: 국기 → 수도',
            'capital-to-flag-yuli': '✨ 율이 모드: 수도 → 국기'
        };

        let html = '';
        for (const mode in modeNames) {
            const modeScores = scores[mode] || [];
            html += `<div class="hall-mode-section">`;
            html += `<h3>${modeNames[mode]}</h3>`;
            
            if (modeScores.length === 0) {
                html += `<p class="no-scores">아직 기록이 없습니다</p>`;
            } else {
                html += `<table class="score-table">`;
                html += `<thead><tr><th>순위</th><th>이름</th><th>점수</th><th>정답률</th><th>시간</th><th>날짜</th></tr></thead>`;
                html += `<tbody>`;

                modeScores.forEach((entry, index) => {
                    const date = new Date(entry.date);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                    const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                    
                    // 시간 포맷팅 (분:초)
                    const minutes = Math.floor(entry.timeTaken / 60);
                    const seconds = entry.timeTaken % 60;
                    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    
                    html += `<tr class="rank-${index + 1}">`;
                    html += `<td>${medalEmoji} ${index + 1}</td>`;
                    html += `<td class="player-name">${this.escapeHtml(entry.name)}</td>`;
                    html += `<td>${entry.score}/${entry.total}</td>`;
                    html += `<td class="percentage">${entry.percentage}%</td>`;
                    html += `<td>${timeStr}</td>`;
                    html += `<td>${dateStr}</td>`;
                    html += `</tr>`;
                });
                
                html += `</tbody></table>`;
            }
            html += `</div>`;
        }
        
        container.innerHTML = html;
    }
}

// 게임 상태 관리 클래스
class FlagQuizGame {
    constructor() {
		this.currentMode = 'flag-to-country';
		this.currentQuestion = 0;
		this.totalQuestions = 195;
		this.score = 0;
		this.questions = [];
		this.currentQuestionData = null;
		this.answered = false;
		this.startTime = null;
		this.elapsedTime = 0;
		this.wrongCount = 0;  // 틀린 문제 수
		this.maxWrongCount = 10;  // 최대 틀릴 수 있는 문제 수
		this.gameOver = false;  // 게임 오버 상태
        
        // 명예의 전당 인스턴스
        this.hallOfFame = new HallOfFame();
        
        // 율이 모드용 국가 리스트
        this.yuliCountries = [
            '한국', '일본', '싱가포르', '중국', '태국', '네팔', '인도', '미얀마',
            '베트남', '필리핀', '프랑스', '독일', '이탈리아', '스위스', '영국',
            '스페인', '그리스', '체코', '네덜란드', '러시아', '캐나다', '쿠바',
            '미국', '브라질', '칠레', '우루과이', '인도네시아', '캄보디아',
            '말레이시아', '몽골', '사우디아라비아', '이라크', '이란', '알제리'
        ];
        
        // 율이 모드 활성화를 위한 변수
        this.clickCount = 0;
        this.clickTimer = null;
        this.firstClickTime = null;
        
        this.setupEventListeners();
        this.setupYuliModeActivation();
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 다음 문제 버튼
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextQuestion();
            });
        }

        // 다시 시작 버튼
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.restartGame();
            });
        }

        // 명예의 전당 저장 버튼
        const saveScoreBtn = document.getElementById('saveScoreBtn');
        if (saveScoreBtn) {
            saveScoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveToHallOfFame();
            });
        }
        
        // 이름 입력 필드 제한 (한글, 영문, 숫자, 10글자)
        const nameInput = document.getElementById('playerNameInput');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                // 10글자로 제한
                e.target.value = e.target.value.slice(0, 10);
            });
            
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveToHallOfFame();
                }
            });
        }
    }
    
    // 율이 모드 활성화 설정
    setupYuliModeActivation() {
        const capitalMenu = document.getElementById('capitalMenu');
        if (!capitalMenu) return;
        
        let clickCount = 0;
        
        capitalMenu.addEventListener('click', (e) => {
            // 빈 공간 클릭 시
            if (e.target === capitalMenu || e.target.classList.contains('sub-menu-header') || e.target.tagName === 'H2' || e.target.tagName === 'P') {
                clickCount++;
                
                if (clickCount >= 3) {  // 3번으로 줄임
                    this.showYuliMode();
                    clickCount = 0;
                }
            }
        });
    }
    
    // 율이 모드 표시
    showYuliMode() {
        const yuliModeCard = document.getElementById('yuliModeCard');
        if (yuliModeCard) {
            yuliModeCard.classList.remove('hidden');
            yuliModeCard.style.animation = 'bounceIn 0.8s ease-out';
            
            // 율이 모드 발견 메시지
            const message = document.createElement('div');
            message.textContent = '🎉 율이 모드를 발견하셨습니다! 🎉';
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 20px 40px;
                border-radius: 20px;
                font-size: 1.5rem;
                font-weight: bold;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 1000;
                animation: bounceIn 0.5s ease-out;
            `;
            document.body.appendChild(message);
            
            setTimeout(() => {
                message.remove();
            }, 3000);
        }
    }

    // 새 게임 시작
	startNewGame(mode) {
		this.currentMode = mode;
		this.currentQuestion = 0;
		this.score = 0;
		this.answered = false;
		this.wrongCount = 0;  // 틀린 문제 수 초기화
		this.gameOver = false;  // 게임 오버 상태 초기화
		this.startTime = Date.now(); // 시간 측정 시작
        
        // UI 초기화
        document.getElementById('finalScore').classList.add('hidden');
        document.getElementById('nameInputSection').classList.add('hidden');
        document.querySelector('.quiz-container').classList.remove('hidden');
        
        // 율이 모드 시작 메시지
        if (mode.includes('yuli')) {
            const message = document.createElement('div');
            message.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 10px;">✨ 율이 모드 ✨</div>
                <div style="font-size: 1.2rem;">율이가 좋아하는 34개국만 도전!</div>
            `;
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #f093fb, #f5576c);
                color: white;
                padding: 30px 50px;
                border-radius: 20px;
                font-weight: bold;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 1000;
                text-align: center;
                animation: bounceIn 0.5s ease-out;
            `;
            document.body.appendChild(message);
            
            setTimeout(() => {
                message.style.animation = 'fadeOut 0.5s ease-out';
                setTimeout(() => message.remove(), 500);
            }, 2000);
        }
        
        // 문제 생성 및 시작
        this.generateQuestions();
        this.displayQuestion();
    }

    // 문제 생성 - 195개국 모두 중복 없이 출제 (율이 모드는 34개국)
    generateQuestions() {
        this.questions = [];
        let countriesToUse = [];
        
        // 율이 모드인 경우 특정 국가들만 사용
        if (this.currentMode.includes('yuli')) {
            const allCountries = CountryUtils.getAllCountries();
            countriesToUse = allCountries.filter(country => 
                this.yuliCountries.includes(country.name)
            );
        } else {
            countriesToUse = CountryUtils.getAllCountries();
        }
        
        // 국가들을 랜덤하게 섞기
        const shuffledCountries = this.shuffleArray([...countriesToUse]);
        
        // 모든 국가에 대해 문제 생성
        shuffledCountries.forEach(country => {
            const question = this.createQuestion(country);
            this.questions.push(question);
        });
        
        // 전체 문제 수를 실제 국가 수로 업데이트
        this.totalQuestions = this.questions.length;
    }

    // 모드별 문제 생성
    createQuestion(correctAnswer) {
        const question = {
            country: correctAnswer,
            mode: this.currentMode,
            options: []
        };

        // 율이 모드는 일반 모드명에서 -yuli를 제거하고 처리
        const baseMode = this.currentMode.replace('-yuli', '');

        switch (baseMode) {
            case 'flag-to-country':
                question.questionText = '이 국기는 어느 나라의 국기일까요?';
                question.correctAnswer = correctAnswer.name;
                question.options = this.generateCountryOptions(correctAnswer);
                question.showFlag = true;
                question.showCountryName = false;
                question.showCapitalName = false;
                break;
                
            case 'country-to-flag':
                question.questionText = `${correctAnswer.name}의 국기는 어느 것일까요?`;
                question.correctAnswer = correctAnswer.code;
                question.options = this.generateFlagOptions(correctAnswer);
                question.showFlag = false;
                question.showCountryName = true;
                question.showCapitalName = false;
                break;
                
            case 'capital-easy':
                question.questionText = `${correctAnswer.name}의 수도는 어디일까요?`;
                question.correctAnswer = correctAnswer.capital;
                question.options = this.generateCapitalOptions(correctAnswer);
                question.showFlag = true;
                question.showCountryName = true;
                question.showCapitalName = false;
                break;
                
            case 'capital-hard':
                question.questionText = '이 국기의 수도는 어디일까요?';
                question.correctAnswer = correctAnswer.capital;
                question.options = this.generateCapitalOptions(correctAnswer);
                question.showFlag = true;
                question.showCountryName = false;
                question.showCapitalName = false;
                break;

            case 'capital-to-flag':
                question.questionText = `${correctAnswer.capital}은(는) 어느 나라의 수도일까요?`;
                question.correctAnswer = correctAnswer.code;
                question.options = this.generateFlagOptions(correctAnswer);
                question.showFlag = false;
                question.showCountryName = false;
                question.showCapitalName = true;
                break;
        }

        return question;
    }

    // 국가명 선택지 생성
    generateCountryOptions(correctCountry) {
        const options = [correctCountry.name];
        
        // 율이 모드인 경우 율이 국가들 중에서만 선택
        let availableCountries = [];
        if (this.currentMode.includes('yuli')) {
            const allCountries = CountryUtils.getAllCountries();
            availableCountries = allCountries.filter(country => 
                this.yuliCountries.includes(country.name) && 
                country.code !== correctCountry.code
            );
        } else {
            availableCountries = CountryUtils.getRandomCountries(3, correctCountry);
        }
        
        // 랜덤으로 3개 선택 (또는 가능한 만큼)
        const shuffled = this.shuffleArray(availableCountries);
        const wrongCountries = shuffled.slice(0, 3);
        
        wrongCountries.forEach(country => {
            options.push(country.name);
        });

        return this.shuffleArray(options);
    }

    // 국기 선택지 생성
    generateFlagOptions(correctCountry) {
        const options = [{
            code: correctCountry.code,
            name: correctCountry.name,
            flag: correctCountry.flag
        }];
        
        // 율이 모드인 경우 율이 국가들 중에서만 선택
        let availableCountries = [];
        if (this.currentMode.includes('yuli')) {
            const allCountries = CountryUtils.getAllCountries();
            availableCountries = allCountries.filter(country => 
                this.yuliCountries.includes(country.name) && 
                country.code !== correctCountry.code
            );
        } else {
            availableCountries = CountryUtils.getRandomCountries(3, correctCountry);
        }
        
        // 랜덤으로 3개 선택 (또는 가능한 만큼)
        const shuffled = this.shuffleArray(availableCountries);
        const wrongCountries = shuffled.slice(0, 3);
        
        wrongCountries.forEach(country => {
            options.push({
                code: country.code,
                name: country.name,
                flag: country.flag
            });
        });

        return this.shuffleArray(options);
    }

    // 수도 선택지 생성
    generateCapitalOptions(correctCountry) {
        const options = [correctCountry.capital];
        
        // 율이 모드인 경우 율이 국가들 중에서만 선택
        let availableCountries = [];
        if (this.currentMode.includes('yuli')) {
            const allCountries = CountryUtils.getAllCountries();
            availableCountries = allCountries.filter(country => 
                this.yuliCountries.includes(country.name) && 
                country.code !== correctCountry.code
            );
        } else {
            availableCountries = CountryUtils.getRandomCountries(3, correctCountry);
        }
        
        // 랜덤으로 3개 선택 (또는 가능한 만큼)
        const shuffled = this.shuffleArray(availableCountries);
        const wrongCountries = shuffled.slice(0, 3);
        
        wrongCountries.forEach(country => {
            options.push(country.capital);
        });

        return this.shuffleArray(options);
    }

    // 배열 섞기
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 문제 표시
    displayQuestion() {
		if (this.gameOver || this.currentQuestion >= this.totalQuestions) {
			this.showFinalScore();
			return;
		}

        this.currentQuestionData = this.questions[this.currentQuestion];
        this.answered = false;

        // UI 업데이트
        this.updateQuestionInfo();
        this.displayContent();
        this.displayQuestionText();
        this.displayOptions();
        this.hideResult();
    }

    // 문제 정보 업데이트
	updateQuestionInfo() {
		// 1000점 만점으로 현재 점수 계산
		const maxQuestions = this.currentMode.includes('yuli') ? 34 : 195;
		const currentScore = Math.round((this.score / maxQuestions) * 1000);
		const remainingWrong = this.maxWrongCount - this.wrongCount;
		
		document.getElementById('score').textContent = `점수: ${currentScore}/1000 (${this.score}/${this.currentQuestion}개 정답)`;
		
		// 틀린 문제 수 표시
		const wrongDisplay = document.getElementById('wrongCount');
		if (wrongDisplay) {
			wrongDisplay.textContent = `남은 기회: ${remainingWrong}/10`;
			if (remainingWrong <= 3) {
				wrongDisplay.style.color = '#ff6b6b';
				wrongDisplay.style.fontWeight = 'bold';
			}
		}
	}

    // 컨텐츠 표시 (국기, 국가명, 수도명)
    displayContent() {
        const flagDisplay = document.getElementById('flagDisplay');
        const countryNameDiv = document.getElementById('countryName');
        const capitalNameDiv = document.getElementById('capitalName');
        const country = this.currentQuestionData.country;

        // 국기 표시/숨김
        if (this.currentQuestionData.showFlag) {
            flagDisplay.innerHTML = `
                <img src="${CountryUtils.getFlagImageUrl(country.code)}" 
                     alt="국기 이미지" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="flag-emoji" style="display:none;">${country.flag}</div>
            `;
            flagDisplay.classList.remove('hidden');
        } else {
            flagDisplay.classList.add('hidden');
        }

        // 국가명 표시/숨김
        if (this.currentQuestionData.showCountryName) {
            countryNameDiv.textContent = country.name;
            countryNameDiv.classList.remove('hidden');
        } else {
            countryNameDiv.classList.add('hidden');
        }

        // 수도명 표시/숨김  
        if (this.currentQuestionData.showCapitalName) {
            capitalNameDiv.textContent = country.capital;
            capitalNameDiv.classList.remove('hidden');
        } else {
            capitalNameDiv.classList.add('hidden');
        }
    }

    // 문제 텍스트 표시
    displayQuestionText() {
        document.getElementById('questionText').textContent = 
            this.currentQuestionData.questionText;
    }

    // 선택지 표시
    displayOptions() {
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';

        // 율이 모드를 위해 baseMode 추출
        const baseMode = this.currentMode.replace('-yuli', '');

        this.currentQuestionData.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.setAttribute('data-option-index', index);
            
            // 모드에 따라 다른 형태로 표시
            if (baseMode === 'country-to-flag' || baseMode === 'capital-to-flag') {
                // 국기 선택지
                if (baseMode === 'capital-to-flag') {
                    // 수도→국기 모드: 국기만 표시
                    button.innerHTML = `
                        <img src="${CountryUtils.getFlagImageUrl(option.code)}" 
                             alt="국기 이미지" 
                             style="width: 80px; height: 53px; object-fit: cover; border-radius: 8px; pointer-events: none;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div style="display:none; font-size: 40px; pointer-events: none;">${option.flag}</div>
                    `;
                } else {
                    // 나라명→국기 모드: 국기만 표시 (국가명 표시하지 않음)
                    button.innerHTML = `
                        <img src="${CountryUtils.getFlagImageUrl(option.code)}" 
                             alt="국기 이미지" 
                             style="width: 80px; height: 53px; object-fit: cover; border-radius: 8px; pointer-events: none;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div style="display:none; font-size: 40px; pointer-events: none;">${option.flag}</div>
                    `;
                }
                button.setAttribute('data-option-value', option.code);
            } else {
                // 텍스트 선택지
                button.textContent = option;
                button.setAttribute('data-option-value', option);
            }
            
            button.addEventListener('click', () => this.selectOption(button.getAttribute('data-option-value'), button));
            optionsContainer.appendChild(button);
        });
    }

    // 선택지 선택
    selectOption(selectedOption, buttonElement) {
        if (this.answered) return;

        this.answered = true;
        const isCorrect = selectedOption === this.currentQuestionData.correctAnswer;

        // 모든 버튼 비활성화
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.add('disabled');
        });

        // 율이 모드를 위해 baseMode 추출
        const baseMode = this.currentMode.replace('-yuli', '');

        // 정답/오답 표시
        if (baseMode === 'country-to-flag' || baseMode === 'capital-to-flag') {
            // 국기 선택지의 경우
            document.querySelectorAll('.option-btn').forEach(btn => {
                const optionValue = btn.getAttribute('data-option-value');
                if (optionValue === this.currentQuestionData.correctAnswer) {
                    btn.classList.add('correct');
                } else if (btn === buttonElement && !isCorrect) {
                    btn.classList.add('incorrect');
                }
            });
        } else {
            // 텍스트 선택지의 경우
            document.querySelectorAll('.option-btn').forEach(btn => {
                if (btn.textContent === this.currentQuestionData.correctAnswer) {
                    btn.classList.add('correct');
                } else if (btn === buttonElement && !isCorrect) {
                    btn.classList.add('incorrect');
                }
            });
        }

        // 결과 표시
        this.showResult(isCorrect);

        // 점수 업데이트
		if (isCorrect) {
			this.score++;
		} else {
			this.wrongCount++;
			// 10문제 틀리면 게임 오버
			if (this.wrongCount >= this.maxWrongCount) {
				this.gameOver = true;
				setTimeout(() => {
					this.showFinalScore();
				}, 2000); // 2초 후 게임 오버 화면 표시
				return;
			}
		}

		// 점수 정보 업데이트
		this.updateQuestionInfo();

		// 다음 문제 버튼 표시
		document.getElementById('nextBtn').classList.remove('hidden');

        // 다음 문제 버튼 표시
        document.getElementById('nextBtn').classList.remove('hidden');
    }

    // 결과 표시
    showResult(isCorrect) {
        const resultDiv = document.getElementById('result');
        const country = this.currentQuestionData.country;
        
        let correctAnswerText = '';
        let additionalInfo = '';

        // 율이 모드를 위해 baseMode 추출
        const baseMode = this.currentMode.replace('-yuli', '');

        // 모드에 따른 정답 표시
        switch (baseMode) {
            case 'flag-to-country':
                correctAnswerText = country.name;
                additionalInfo = `수도: ${country.capital}`;
                break;
            case 'country-to-flag':
                correctAnswerText = `${country.name}의 국기`;
                additionalInfo = `수도: ${country.capital}`;
                break;
            case 'capital-easy':
            case 'capital-hard':
                correctAnswerText = country.capital;
                additionalInfo = `국가: ${country.name}`;
                break;
            case 'capital-to-flag':
                correctAnswerText = country.name;
                additionalInfo = `${country.capital}은(는) ${country.name}의 수도입니다`;
                break;
        }
        
        if (isCorrect) {
            resultDiv.className = 'result correct';
            resultDiv.innerHTML = `
                <strong>정답입니다! 🎉</strong>
                <br>${additionalInfo}
            `;
        } else {
            resultDiv.className = 'result incorrect';
            resultDiv.innerHTML = `
                <strong>틀렸습니다. 😞</strong>
                <br>정답: <strong>${correctAnswerText}</strong>
                <br>${additionalInfo}
            `;
        }
        
        resultDiv.classList.remove('hidden');
    }

    // 결과 숨기기
    hideResult() {
        document.getElementById('result').classList.add('hidden');
        document.getElementById('nextBtn').classList.add('hidden');
    }

    // 다음 문제
    nextQuestion() {
        this.currentQuestion++;
        this.displayQuestion();
    }

    // 최종 점수 표시
	showFinalScore() {
		// 경과 시간 계산
		this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
		
		document.querySelector('.quiz-container').classList.add('hidden');
		document.getElementById('finalScore').classList.remove('hidden');
		
		const totalAttempted = this.currentQuestion;
		const maxQuestions = this.currentMode.includes('yuli') ? 34 : 195;
		
		// 1000점 만점 점수 계산
		const finalScore = Math.round((this.score / maxQuestions) * 1000);
		const attemptedPercentage = totalAttempted > 0 ? Math.round((this.score / totalAttempted) * 100) : 0;
		
		let scoreText = '';
		let headerText = '';
		
		if (this.gameOver) {
			// 게임 오버 상태
			headerText = '💥 게임 오버!';
			scoreText = `${this.wrongCount}문제 틀려서 게임 종료<br>${totalAttempted}문제 도전 중 ${this.score}문제 정답<br><strong style="font-size: 1.5em; color: #ffeaa7;">${finalScore}/1000점</strong>`;
		} else if (totalAttempted < this.totalQuestions) {
			headerText = '🎯 중간 종료!';
			scoreText = `${totalAttempted}문제 도전 중 ${this.score}문제 정답<br><strong style="font-size: 1.5em; color: #ffeaa7;">${finalScore}/1000점</strong> (${attemptedPercentage}%)`;
		} else {
			headerText = '🎉 게임 완료!';
			scoreText = `전체 ${this.totalQuestions}문제 중 ${this.score}문제 정답<br><strong style="font-size: 1.5em; color: #ffeaa7;">${finalScore}/1000점</strong> (${attemptedPercentage}%)`;
		}
		
		// 헤더 텍스트 업데이트
		document.querySelector('.final-score h2').textContent = headerText;
		document.getElementById('finalScoreText').innerHTML = scoreText;

		// 점수에 따른 메시지
		const messageDiv = document.getElementById('scoreMessage');
		let message = '';
		let emoji = '';

		// 점수 구간별 메시지 (1000점 만점 기준)
		if (this.gameOver) {
			if (finalScore >= 800) {
				message = '아깝네요! 거의 다 맞추고 게임 오버가 되었어요! 😢';
				emoji = '😢';
			} else if (finalScore >= 600) {
				message = '좋은 실력이에요! 다시 도전해보세요! 💪';
				emoji = '💪';
			} else if (finalScore >= 400) {
				message = '나쁘지 않아요! 조금 더 연습하면 좋을 것 같아요! 📚';
				emoji = '📚';
			} else {
				message = '다시 도전해보세요! 연습하면 실력이 늘 거예요! 🌱';
				emoji = '🌱';
			}
		} else {
			// 율이 모드인 경우 특별한 메시지
			if (this.currentMode.includes('yuli')) {
				if (finalScore === 1000) {
					message = '완벽해요! 율이가 좋아하는 모든 나라를 마스터하셨네요! ✨🏆';
					emoji = '🏆';
				} else if (finalScore >= 900) {
					message = '대단해요! 율이 모드 거의 정복! ✨';
					emoji = '🌟';
				} else if (finalScore >= 700) {
					message = '잘하셨어요! 율이가 기뻐할 거예요! ✨';
					emoji = '😊';
				} else if (finalScore >= 500) {
					message = '좋은 시도예요! 율이와 함께 더 연습해보아요! ✨';
					emoji = '💪';
				} else {
					message = '화이팅! 율이와 함께라면 할 수 있어요! ✨';
					emoji = '🌱';
				}
			} else {
				if (totalAttempted === this.totalQuestions && finalScore === 1000) {
					message = '완벽해요! 세계 모든 국가를 마스터하셨네요! 🌍🏆';
					emoji = '🏆';
				} else if (finalScore >= 900) {
					message = '놀라워요! 거의 모든 문제를 맞추셨네요! 🎖️';
					emoji = '🎖️';
				} else if (finalScore >= 700) {
					message = '대단해요! 뛰어난 실력이에요! 🌟';
					emoji = '🌟';
				} else if (finalScore >= 500) {
					message = '잘하셨어요! 절반 이상을 맞추셨네요! 📚';
					emoji = '📚';
				} else if (finalScore >= 300) {
					message = '좋은 시작이에요! 조금만 더 연습하면 훨씬 나아질 거예요! 💪';
					emoji = '💪';
				} else {
					message = '더 열심히 공부해보세요! 다시 도전하면 분명 늘 거예요! 🌱';
					emoji = '🌱';
				}
			}
		}

		const totalCountriesText = this.currentMode.includes('yuli') ? '율이가 좋아하는 34개국' : `전 세계 ${CountryUtils.getTotalCount()}개국`;
		
		messageDiv.innerHTML = `
			<div style="font-size: 4rem; margin: 20px 0; animation: bounceIn 1s ease-out;">${emoji}</div>
			<div style="font-size: 1.3rem; color: #667eea; font-weight: bold;">${message}</div>
			<div style="margin-top: 15px; padding: 15px; background: rgba(102,126,234,0.1); border-radius: 15px; font-size: 1rem; color: #333;">
				${totalAttempted}문제 도전<br>
				최종 점수: <strong>${finalScore}/1000점</strong> | 정답률: ${attemptedPercentage}% | 틀린 문제: ${this.wrongCount}개
			</div>
		`;

		// 명예의 전당 입력란 표시
		document.getElementById('nameInputSection').classList.remove('hidden');
		document.getElementById('playerNameInput').value = '';
		document.getElementById('playerNameInput').focus();
	}

    // 명예의 전당에 저장
	async saveToHallOfFame() {
		const nameInput = document.getElementById('playerNameInput');
		const name = nameInput.value.trim();
		
		if (name.length === 0) {
			alert('이름을 입력해주세요!');
			return;
		}
		
		if (name.length > 10) {
			alert('이름은 10글자 이내로 입력해주세요!');
			return;
		}
		
		// 저장 중 표시
		const saveBtn = document.getElementById('saveScoreBtn');
		saveBtn.textContent = '저장 중...';
		saveBtn.disabled = true;
		
		const totalAttempted = this.currentQuestion;
		const saved = await this.hallOfFame.saveScore(name, this.score, totalAttempted, this.currentMode, this.elapsedTime);
		
		if (saved) {
			document.getElementById('nameInputSection').classList.add('hidden');
			alert('명예의 전당에 기록되었습니다! 🎉');
			
			const hallBtn = document.getElementById('viewHallOfFameBtn');
			if (hallBtn) {
				hallBtn.classList.remove('hidden');
			}
		}
		
		saveBtn.textContent = '저장';
		saveBtn.disabled = false;
	}

    // 게임 재시작
    restartGame() {
        this.startNewGame(this.currentMode);
    }
    
    // 게임 중간에 끝내기
    finishGameEarly() {
        const totalCountriesText = this.currentMode.includes('yuli') ? '34' : '195';
        const confirmEnd = confirm(`현재 ${this.currentQuestion}/${totalCountriesText}개국을 진행했습니다.\n정말로 게임을 끝내고 점수를 확인하시겠습니까?`);
        if (confirmEnd) {
            this.showFinalScore();
        }
    }
}

// 전역 함수들을 window 객체에 할당
window.showMainMenu = showMainMenu;
window.showCountryMenu = showCountryMenu;
window.showCapitalMenu = showCapitalMenu;
window.showGameScreen = showGameScreen;
window.showHallOfFame = showHallOfFame;
window.startGame = startGame;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 국가 데이터가 로드되었는지 확인
    if (typeof countries !== 'undefined' && countries.length > 0) {
        window.flagQuizGame = new FlagQuizGame();
        window.hallOfFame = new HallOfFame();
        console.log(`${CountryUtils.getTotalCount()}개국 데이터 로드 완료! 전체 정복 모드 준비 완료!`);
        
        // 통계 표시
        const stats = CountryUtils.getContinentStats();
        console.log('대륙별 국가 수:', stats);
        
        // 초기 화면 표시
        showMainMenu();
    } else {
        console.error('국가 데이터를 로드할 수 없습니다.');
        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            subtitle.textContent = '데이터 로딩 오류가 발생했습니다.';
        }
    }
});
