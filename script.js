// グローバル変数
let currentQuestionIndex = 0;
let selectedQuestions = [];
let correctCount = 0;
let totalScore = 0;
let timerInterval = null;
let startTime = null;
let bgm = null;
let rankingData = [];

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    bgm = document.getElementById('bgm');
    loadRanking();
    console.log('アプリ初期化完了');
});

// BGM再生
function playBGM() {
    if (bgm) {
        bgm.play().then(() => {
            console.log('BGM再生開始');
        }).catch(e => {
            console.log('BGM再生エラー:', e);
            // ユーザー操作後に再試行
            document.body.addEventListener('click', function playOnClick() {
                bgm.play().then(() => {
                    console.log('BGM再生成功(クリック後)');
                    document.body.removeEventListener('click', playOnClick);
                });
            }, { once: true });
        });
    }
}

// 画面切り替え
function showScreen(screenId) {
    // 全ての画面を非表示
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 指定画面を表示
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('画面切り替え:', screenId);
    }
}

// クイズ開始
function startQuiz() {
    console.log('クイズ開始');
    
    // BGM再生
    playBGM();
    
    // ランダムに10問選択
    const shuffled = [...QUIZ_DATA].sort(() => Math.random() - 0.5);
    selectedQuestions = shuffled.slice(0, 10);
    
    // 初期化
    currentQuestionIndex = 0;
    correctCount = 0;
    totalScore = 0;
    
    // クイズ画面に切り替え
    showScreen('quiz-screen');
    
    // 最初の問題を表示
    showQuestion();
}

// 問題表示
function showQuestion() {
    const question = selectedQuestions[currentQuestionIndex];
    console.log('問題表示:', currentQuestionIndex + 1, question['質問']);
    
    // 問題番号更新
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    
    // 問題文表示
    document.getElementById('question-text').textContent = question['質問'];
    
    // 選択肢をランダムに並べ替え
    const choices = [
        { text: question['選択肢-1'], isCorrect: question['正解番号'] === 1 },
        { text: question['選択肢-2'], isCorrect: question['正解番号'] === 2 },
        { text: question['選択肢-3'], isCorrect: question['正解番号'] === 3 },
        { text: question['選択肢-4'], isCorrect: question['正解番号'] === 4 }
    ].sort(() => Math.random() - 0.5);
    
    // 選択肢をボタンに設定
    const choiceButtons = document.querySelectorAll('.choice-btn');
    choiceButtons.forEach((btn, index) => {
        btn.textContent = choices[index].text;
        btn.dataset.correct = choices[index].isCorrect;
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
    });
    
    // タイマー開始
    startTimer();
}

// タイマー開始
function startTimer() {
    let timeLeft = 10.00;
    startTime = Date.now();
    const timerElement = document.getElementById('timer');
    timerElement.classList.remove('warning');
    
    timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        timeLeft = Math.max(0, 10 - elapsed);
        
        timerElement.textContent = timeLeft.toFixed(2);
        
        // 3秒以下で警告表示
        if (timeLeft <= 3 && timeLeft > 0) {
            timerElement.classList.add('warning');
        }
        
        // 時間切れ
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 10);
}

// タイマー停止
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 回答選択
function selectAnswer(index) {
    stopTimer();
    
    const choiceButtons = document.querySelectorAll('.choice-btn');
    const selectedButton = choiceButtons[index];
    const isCorrect = selectedButton.dataset.correct === 'true';
    
    // 回答時間を計算
    const elapsed = (Date.now() - startTime) / 1000;
    const timeBonus = Math.max(0, 10 - elapsed);
    
    // ボタンを無効化
    choiceButtons.forEach(btn => {
        btn.disabled = true;
        
        // 正解を表示
        if (btn.dataset.correct === 'true') {
            btn.classList.add('correct');
        }
    });
    
    // 不正解の場合
    if (!isCorrect) {
        selectedButton.classList.add('wrong');
    }
    
    // 得点計算
    let questionScore = 0;
    if (isCorrect) {
        correctCount++;
        // 1問あたり10,000点 + 時間ボーナス
        questionScore = 10000 + Math.floor(timeBonus * 1000);
        totalScore += questionScore;
    }
    
    console.log('回答:', isCorrect ? '正解' : '不正解', '得点:', questionScore, '合計:', totalScore);
    
    // 解説表示
    setTimeout(() => {
        showExplanation(isCorrect, questionScore);
    }, 1000);
}

// 時間切れ処理
function handleTimeout() {
    console.log('時間切れ');
    
    const choiceButtons = document.querySelectorAll('.choice-btn');
    
    // ボタンを無効化して正解を表示
    choiceButtons.forEach(btn => {
        btn.disabled = true;
        
        if (btn.dataset.correct === 'true') {
            btn.classList.add('correct');
        }
    });
    
    // 解説表示
    setTimeout(() => {
        showExplanation(false, 0);
    }, 1000);
}

// 解説表示
function showExplanation(isCorrect, score) {
    const question = selectedQuestions[currentQuestionIndex];
    const modal = document.getElementById('explanation-modal');
    const resultEmoji = document.getElementById('result-emoji');
    const resultText = document.getElementById('result-text');
    const explanationText = document.getElementById('explanation-text');
    
    // 結果表示
    if (isCorrect) {
        resultEmoji.textContent = '⭕️';
        resultText.textContent = '正解! +' + score.toLocaleString() + '点';
        resultText.style.color = '#4CAF50';
    } else {
        resultEmoji.textContent = '❌';
        resultText.textContent = '不正解';
        resultText.style.color = '#F44336';
    }
    
    // 解説文
    explanationText.textContent = question['解説'];
    
    // モーダル表示
    modal.classList.add('active');
}

// 次の問題へ
function nextQuestion() {
    // モーダルを閉じる
    document.getElementById('explanation-modal').classList.remove('active');
    
    currentQuestionIndex++;
    
    // 全問終了チェック
    if (currentQuestionIndex >= selectedQuestions.length) {
        showResult();
    } else {
        showQuestion();
    }
}

// 結果表示
function showResult() {
    console.log('結果表示:', correctCount, '問正解,', totalScore, '点');
    
    // BGM停止
    if (bgm) {
        bgm.pause();
        bgm.currentTime = 0;
    }
    
    // ランキング順位を確認
    const ranking = getRankingPosition(totalScore);
    console.log('ランキング順位:', ranking);
    
    if (ranking <= 10) {
        // トップ10入り - ニックネーム入力画面へ
        document.getElementById('final-score-top10').textContent = totalScore.toLocaleString() + '点';
        showScreen('nickname-screen');
    } else {
        // トップ10圏外 - 結果画面へ
        document.getElementById('correct-count').textContent = correctCount + '/10';
        document.getElementById('final-score').textContent = totalScore.toLocaleString() + '点';
        
        const rankingPosition = document.getElementById('ranking-position');
        if (rankingData.length === 0) {
            rankingPosition.textContent = '初めての挑戦者です!';
        } else if (ranking <= 20) {
            rankingPosition.textContent = '順位: ' + ranking + '位';
        } else {
            rankingPosition.textContent = '';
        }
        
        showScreen('result-screen');
    }
}

// ランキング順位を取得
function getRankingPosition(score) {
    if (rankingData.length === 0) return 1;
    
    let position = 1;
    for (let i = 0; i < rankingData.length; i++) {
        if (score > rankingData[i].score) {
            break;
        }
        position++;
    }
    return position;
}

// ニックネーム登録
function submitNickname() {
    const nicknameInput = document.getElementById('nickname-input');
    const nickname = nicknameInput.value.trim();
    
    if (!nickname) {
        alert('ニックネームを入力してください');
        return;
    }
    
    console.log('ニックネーム登録:', nickname, totalScore);
    
    // ランキングに追加
    rankingData.push({
        nickname: nickname,
        score: totalScore,
        correctCount: correctCount,
        timestamp: Date.now()
    });
    
    // スコア順にソート
    rankingData.sort((a, b) => b.score - a.score);
    
    // トップ10のみ保持
    rankingData = rankingData.slice(0, 10);
    
    // localStorageに保存
    saveRanking();
    
    // ランキング画面へ
    showRanking();
}

// ランキング表示
function showRanking() {
    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = '';
    
    if (rankingData.length === 0) {
        rankingList.innerHTML = '<p style="text-align: center; padding: 30px; color: #666;">まだランキングデータがありません</p>';
    } else {
        rankingData.forEach((data, index) => {
            const item = document.createElement('div');
            item.className = 'ranking-item';
            
            const rank = document.createElement('div');
            rank.className = 'ranking-rank';
            
            if (index === 0) {
                rank.textContent = '🥇';
            } else if (index === 1) {
                rank.textContent = '🥈';
            } else if (index === 2) {
                rank.textContent = '🥉';
            } else {
                rank.textContent = (index + 1) + '位';
            }
            
            const nickname = document.createElement('div');
            nickname.className = 'ranking-nickname';
            nickname.textContent = data.nickname;
            
            const score = document.createElement('div');
            score.className = 'ranking-score';
            score.textContent = data.score.toLocaleString() + '点';
            
            item.appendChild(rank);
            item.appendChild(nickname);
            item.appendChild(score);
            rankingList.appendChild(item);
        });
    }
    
    showScreen('ranking-screen');
}

// ランキング読み込み
function loadRanking() {
    const saved = localStorage.getItem('kashiwanoha_ranking');
    if (saved) {
        try {
            rankingData = JSON.parse(saved);
            console.log('ランキング読み込み:', rankingData.length, '件');
        } catch (e) {
            rankingData = [];
            console.log('ランキング読み込みエラー');
        }
    }
}

// ランキング保存
function saveRanking() {
    localStorage.setItem('kashiwanoha_ranking', JSON.stringify(rankingData));
    console.log('ランキング保存:', rankingData.length, '件');
}

// もう一度挑戦
function restartQuiz() {
    showScreen('top-screen');
}
