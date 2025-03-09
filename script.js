// 密码生成器 JavaScript 功能实现

// DOM 元素
const passwordDisplay = document.getElementById('password-display');
const lengthSlider = document.getElementById('password-length');
const lengthValue = document.getElementById('length-value');
const strengthMeter = document.getElementById('strength-meter');
const strengthText = document.getElementById('strength-text');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const refreshBtn = document.getElementById('refresh-btn');
const includeUppercase = document.getElementById('include-uppercase');
const includeLowercase = document.getElementById('include-lowercase');
const includeNumbers = document.getElementById('include-numbers');
const includeSymbols = document.getElementById('include-symbols');
const excludeSimilar = document.getElementById('exclude-similar');
const excludeDuplicates = document.getElementById('exclude-duplicates');
const advancedToggle = document.getElementById('advanced-toggle');
const advancedOptions = document.getElementById('advanced-options');
const passwordMode = document.getElementById('password-mode');
const patternContainer = document.getElementById('pattern-container');
const passwordPattern = document.getElementById('password-pattern');
const historyContainer = document.getElementById('history-container');
const clearHistory = document.getElementById('clear-history');
const themeToggle = document.getElementById('theme-toggle');
const aboutBtn = document.getElementById('about-btn');
const aboutModal = document.getElementById('about-modal');
const closeAbout = document.getElementById('close-about');
const closeAboutBtn = document.getElementById('close-about-btn');

// 字符集
const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const numberChars = '0123456789';
const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const similarChars = 'iIlL1oO0';

// 可记忆密码单词库（简化版）
const memorableWords = {
    adjectives: ['大', '小', '快', '慢', '高', '低', '红', '蓝', '绿', '黄', '强', '弱', '硬', '软', '冷', '热'],
    nouns: ['山', '水', '树', '花', '鸟', '鱼', '车', '船', '飞机', '电脑', '手机', '书', '笔', '桌', '椅', '门'],
    verbs: ['跑', '跳', '飞', '游', '唱', '跳', '读', '写', '吃', '喝', '看', '听', '说', '想', '做', '去']
};

// 历史记录
let passwordHistory = [];
const MAX_HISTORY = 5;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 设置初始密码
    generatePassword();
    
    // 从本地存储加载历史记录
    loadHistory();
    
    // 从本地存储加载主题设置
    loadTheme();
    
    // 事件监听器
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // 生成密码按钮
    generateBtn.addEventListener('click', generatePassword);
    
    // 刷新密码按钮
    refreshBtn.addEventListener('click', generatePassword);
    
    // 复制密码按钮
    copyBtn.addEventListener('click', copyPassword);
    
    // 密码长度滑块
    lengthSlider.addEventListener('input', updateLengthValue);
    
    // 高级选项切换
    advancedToggle.addEventListener('click', toggleAdvancedOptions);
    
    // 密码模式选择
    passwordMode.addEventListener('change', handlePasswordModeChange);
    
    // 清除历史记录
    clearHistory.addEventListener('click', clearPasswordHistory);
    
    // 主题切换
    themeToggle.addEventListener('click', toggleTheme);
    
    // 关于对话框
    aboutBtn.addEventListener('click', () => aboutModal.classList.remove('hidden'));
    closeAbout.addEventListener('click', () => aboutModal.classList.add('hidden'));
    closeAboutBtn.addEventListener('click', () => aboutModal.classList.add('hidden'));
    
    // 点击对话框外部关闭
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.classList.add('hidden');
        }
    });
}

// 更新密码长度显示
function updateLengthValue() {
    lengthValue.textContent = lengthSlider.value;
}

// 切换高级选项
function toggleAdvancedOptions() {
    advancedOptions.classList.toggle('hidden');
    const icon = advancedToggle.querySelector('.fa-chevron-down');
    icon.classList.toggle('rotate-180');
}

// 处理密码模式变化
function handlePasswordModeChange() {
    if (passwordMode.value === 'pattern') {
        patternContainer.classList.remove('hidden');
        passwordPattern.value = 'AAAA-BBBB-CCCC-DDDD';
    } else {
        patternContainer.classList.add('hidden');
    }
    
    // 更新选项可用性
    const isRandom = passwordMode.value === 'random';
    excludeSimilar.disabled = !isRandom;
    excludeDuplicates.disabled = !isRandom;
    
    // 生成新密码
    generatePassword();
}

// 生成密码
function generatePassword() {
    let password = '';
    
    switch (passwordMode.value) {
        case 'random':
            password = generateRandomPassword();
            break;
        case 'memorable':
            password = generateMemorablePassword();
            break;
        case 'pattern':
            password = generatePatternPassword();
            break;
    }
    
    // 显示密码
    passwordDisplay.value = password;
    
    // 评估密码强度
    evaluatePasswordStrength(password);
    
    // 添加到历史记录
    addToHistory(password);
}

// 生成随机密码
function generateRandomPassword() {
    const length = parseInt(lengthSlider.value);
    let chars = '';
    
    // 添加选中的字符集
    if (includeUppercase.checked) chars += uppercaseChars;
    if (includeLowercase.checked) chars += lowercaseChars;
    if (includeNumbers.checked) chars += numberChars;
    if (includeSymbols.checked) chars += symbolChars;
    
    // 如果没有选择任何字符集，默认使用小写字母
    if (chars.length === 0) {
        chars = lowercaseChars;
        includeLowercase.checked = true;
    }
    
    // 排除易混淆字符
    if (excludeSimilar.checked) {
        for (let i = 0; i < similarChars.length; i++) {
            chars = chars.replace(similarChars[i], '');
        }
    }
    
    // 生成密码
    let password = '';
    const charArray = chars.split('');
    
    if (excludeDuplicates.checked && length > chars.length) {
        // 如果排除重复字符但长度超过可用字符数，则使用所有可用字符
        password = shuffleArray([...charArray]).slice(0, length).join('');
    } else {
        // 正常生成随机密码
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }
    }
    
    // 确保包含所有选定的字符类型
    if (includeUppercase.checked && !/[A-Z]/.test(password)) {
        const randomIndex = Math.floor(Math.random() * length);
        const randomChar = uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
        password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
    }
    
    if (includeLowercase.checked && !/[a-z]/.test(password)) {
        const randomIndex = Math.floor(Math.random() * length);
        const randomChar = lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
        password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
    }
    
    if (includeNumbers.checked && !/[0-9]/.test(password)) {
        const randomIndex = Math.floor(Math.random() * length);
        const randomChar = numberChars[Math.floor(Math.random() * numberChars.length)];
        password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
    }
    
    if (includeSymbols.checked && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
        const randomIndex = Math.floor(Math.random() * length);
        const randomChar = symbolChars[Math.floor(Math.random() * symbolChars.length)];
        password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
    }
    
    return password;
}

// 生成可记忆密码
function generateMemorablePassword() {
    const getRandomWord = (wordArray) => {
        return wordArray[Math.floor(Math.random() * wordArray.length)];
    };
    
    const adjective1 = getRandomWord(memorableWords.adjectives);
    const noun1 = getRandomWord(memorableWords.nouns);
    const verb = getRandomWord(memorableWords.verbs);
    const adjective2 = getRandomWord(memorableWords.adjectives);
    const noun2 = getRandomWord(memorableWords.nouns);
    
    // 添加随机数字
    const randomNum = Math.floor(Math.random() * 100);
    
    // 添加随机特殊字符
    const randomSymbol = symbolChars[Math.floor(Math.random() * symbolChars.length)];
    
    return `${adjective1}${noun1}${randomSymbol}${verb}${adjective2}${noun2}${randomNum}`;
}

// 生成模式密码
function generatePatternPassword() {
    const pattern = passwordPattern.value || 'AAAA-BBBB-CCCC-DDDD';
    let result = '';
    
    for (let i = 0; i < pattern.length; i++) {
        const char = pattern[i];
        
        switch (char) {
            case 'A':
                result += getRandomChar(uppercaseChars);
                break;
            case 'a':
                result += getRandomChar(lowercaseChars);
                break;
            case '9':
                result += getRandomChar(numberChars);
                break;
            case '#':
                result += getRandomChar(symbolChars);
                break;
            default:
                result += char;
        }
    }
    
    return result;
}

// 获取随机字符
function getRandomChar(charSet) {
    return charSet[Math.floor(Math.random() * charSet.length)];
}

// 评估密码强度
function evaluatePasswordStrength(password) {
    // 简单的密码强度评估算法
    let score = 0;
    
    // 长度得分
    score += Math.min(password.length * 4, 40);
    
    // 字符类型得分
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    
    const typesCount = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;
    
    score += typesCount * 10;
    
    // 重复字符扣分
    const repeatedChars = password.length - new Set(password.split('')).size;
    score -= repeatedChars * 2;
    
    // 设置强度等级
    let strengthClass = '';
    let strengthLabel = '';
    
    if (score < 40) {
        strengthClass = 'strength-weak';
        strengthLabel = '弱';
    } else if (score < 60) {
        strengthClass = 'strength-medium';
        strengthLabel = '中';
    } else if (score < 80) {
        strengthClass = 'strength-strong';
        strengthLabel = '强';
    } else {
        strengthClass = 'strength-very-strong';
        strengthLabel = '非常强';
    }
    
    // 更新UI
    strengthMeter.className = strengthClass + ' h-2.5 rounded-full';
    strengthMeter.style.width = `${Math.min(score, 100)}%`;
    strengthText.textContent = strengthLabel;
}

// 复制密码到剪贴板
function copyPassword() {
    if (!passwordDisplay.value) return;
    
    passwordDisplay.select();
    document.execCommand('copy');
    
    // 显示复制成功提示
    showCopyTooltip();
    
    // 60秒后清除剪贴板（模拟）
    setTimeout(() => {
        // 在实际应用中，这里可能需要使用更复杂的方法来清除剪贴板
        console.log('剪贴板已清除（模拟）');
    }, 60000);
}

// 显示复制成功提示
function showCopyTooltip() {
    // 检查是否已存在提示
    let tooltip = document.querySelector('.copy-tooltip');
    
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = '密码已复制到剪贴板';
        document.body.appendChild(tooltip);
    }
    
    // 显示提示
    tooltip.classList.add('show');
    
    // 3秒后隐藏
    setTimeout(() => {
        tooltip.classList.remove('show');
    }, 3000);
}

// 添加密码到历史记录
function addToHistory(password) {
    // 避免添加重复密码
    if (passwordHistory.includes(password)) return;
    
    // 添加到历史记录
    passwordHistory.unshift(password);
    
    // 限制历史记录数量
    if (passwordHistory.length > MAX_HISTORY) {
        passwordHistory.pop();
    }
    
    // 更新UI
    updateHistoryUI();
    
    // 保存到本地存储
    saveHistory();
}

// 更新历史记录UI
function updateHistoryUI() {
    historyContainer.innerHTML = '';
    
    if (passwordHistory.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'text-sm text-gray-500 dark:text-gray-400 text-center italic';
        emptyMessage.textContent = '暂无历史记录';
        historyContainer.appendChild(emptyMessage);
        return;
    }
    
    passwordHistory.forEach(password => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item fade-in';
        
        const passwordSpan = document.createElement('span');
        passwordSpan.className = 'history-password';
        passwordSpan.textContent = password;
        
        const copyButton = document.createElement('button');
        copyButton.className = 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.title = '复制密码';
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(password).then(() => {
                showCopyTooltip();
            });
        });
        
        historyItem.appendChild(passwordSpan);
        historyItem.appendChild(copyButton);
        historyContainer.appendChild(historyItem);
    });
}

// 清除密码历史记录
function clearPasswordHistory() {
    passwordHistory = [];
    updateHistoryUI();
    saveHistory();
}

// 保存历史记录到本地存储
function saveHistory() {
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
}

// 从本地存储加载历史记录
function loadHistory() {
    const savedHistory = localStorage.getItem('passwordHistory');
    if (savedHistory) {
        passwordHistory = JSON.parse(savedHistory);
        updateHistoryUI();
    }
}

// 切换深色/浅色主题
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    
    // 保存主题设置
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
}

// 加载主题设置
function loadTheme() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.documentElement.classList.add('dark');
    }
}

// 辅助函数：打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
} 