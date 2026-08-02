// ================================================================
// ===== 工具函数 =====
// ================================================================
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

function getPasteEl(type) {
    if (type === 'full') return document.getElementById('pasteFull');
    if (type === 'divisional') return document.getElementById('pasteDivisional');
    if (type === 'dasha') return document.getElementById('pasteDasha');
    if (type === 'transit') return document.getElementById('pasteTransit');
    return null;
}

function clearPaste(type) {
    const el = getPasteEl(type);
    if (el) {
        el.value = '';
        showToast('已清空');
    }
}

// ================================================================
// ===== 弹窗控制 =====
// ================================================================
function openTutorialModal() {
    document.getElementById('tutorialModal').classList.add('open');
}

function openFilterModal() {
    document.getElementById('filterModal').classList.add('open');
}

function openGlossaryModal() {
    document.getElementById('glossaryModal').classList.add('open');
}

document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
    });
});

// ================================================================
// ===== 筛选状态 =====
// ================================================================
function getFilterState() {
    return {
        outer: document.getElementById('fOuter').checked,
        bhava: document.getElementById('fBhava').checked,
        vighati: document.getElementById('fVighati').checked,
        varnada: document.getElementById('fVarnada').checked,
        sree: document.getElementById('fSree').checked,
        pranapada: document.getElementById('fPranapada').checked,
        indu: document.getElementById('fIndu').checked,
        bhrigu: document.getElementById('fBhrigu').checked,
        mandi: document.getElementById('fMandi').checked,
        gulika: document.getElementById('fGulika').checked,
        otherUpagraha: document.getElementById('fOtherUpagraha').checked,
        sphutaPrasna: document.getElementById('fSphutaPrasna').checked,
        sphutaYoga: document.getElementById('fSphutaYoga').checked,
        arudhaLagna: document.getElementById('fArudhaLagna').checked,
        bhavaArudha: document.getElementById('fBhavaArudha').checked,
        grahaArudha: document.getElementById('fGrahaArudha').checked,
        varnadas: document.getElementById('fVarnadas').checked,
        kunda: document.getElementById('fKunda').checked,
        ad: document.getElementById('fAD').checked,
        pratyantardasa: document.getElementById('fPratyantardasa').checked,
    };
}

function setGroup(val) {
    const ids = Array.from(arguments).slice(1);
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = val;
    });
}

function resetAllFilters(showToastMsg) {
    const allCheckboxes = document.querySelectorAll('#filterModal input[type="checkbox"]:not(:disabled)');
    allCheckboxes.forEach(cb => { cb.checked = false; });
    document.getElementById('fOuter').checked = false;
    document.getElementById('fAD').checked = false;
    document.getElementById('fPratyantardasa').checked = false;
    document.getElementById('presetMinimal').classList.remove('active-preset');
    document.getElementById('presetPro').classList.remove('active-preset');
    if (showToastMsg !== false) showToast('↺ 已重置');
}

function applyPreset(mode) {
    resetAllFilters(false);
    if (mode === 'minimal') {
        document.getElementById('fOuter').checked = false;
        setGroup(false, 'fBhava', 'fVighati', 'fVarnada', 'fSree', 'fPranapada', 'fIndu', 'fBhrigu');
        setGroup(false, 'fMandi', 'fGulika', 'fOtherUpagraha');
        setGroup(false, 'fSphutaPrasna', 'fSphutaYoga');
        setGroup(false, 'fArudhaLagna', 'fBhavaArudha', 'fGrahaArudha', 'fVarnadas', 'fKunda');
        document.getElementById('fAD').checked = false;
        document.getElementById('fPratyantardasa').checked = false;
        document.getElementById('presetMinimal').classList.add('active-preset');
        document.getElementById('presetPro').classList.remove('active-preset');
        document.getElementById('modeBadge').textContent = '极简模式已启用';
        showToast('✅ 极简模式');
    } else if (mode === 'pro') {
        document.getElementById('fOuter').checked = true;
        setGroup(false, 'fBhava', 'fVighati', 'fVarnada', 'fSree', 'fPranapada', 'fIndu', 'fBhrigu');
        document.getElementById('fMandi').checked = true;
        document.getElementById('fGulika').checked = true;
        document.getElementById('fOtherUpagraha').checked = false;
        setGroup(false, 'fSphutaPrasna', 'fSphutaYoga');
        document.getElementById('fArudhaLagna').checked = true;
        setGroup(false, 'fBhavaArudha', 'fGrahaArudha', 'fVarnadas', 'fKunda');
        document.getElementById('fAD').checked = false;
        document.getElementById('fPratyantardasa').checked = false;
        document.getElementById('presetPro').classList.add('active-preset');
        document.getElementById('presetMinimal').classList.remove('active-preset');
        document.getElementById('modeBadge').textContent = '专业模式已启用';
        showToast('✅ 专业模式');
    }
}

// ================================================================
// ===== 清洗单段 =====
// ================================================================
function cleanSingle(type) {
    const el = getPasteEl(type);
    if (!el) return;
    const raw = el.value.trim();
    if (!raw) { showToast('⚠️ 粘贴框为空'); return; }
    const filters = getFilterState();
    const parser = window.JhoraParser;

    try {
        if (type === 'full') {
            const birth = parser.extractBirthInfo(raw);
            const blocks = parser.extractBodyLongitudeBlocks(raw);
            let parts = [];
            if (birth) parts.push('【出生基础信息】\n' + birth);
            for (const block of blocks) {
                const dType = parser.detectDivisionalType(block.header);
                const filtered = parser.filterBodyList(block.lines, filters);
                if (filtered.length > 0) {
                    parts.push(`=== ${dType} 分盘 ===`);
                    parts.push(filtered.join('\n'));
                }
            }
            const result = parts.join('\n\n') || '（未检测到有效数据）';
            el.value = result;
            showToast('✅ 清洗本段完成');
            return;
        }

        if (type === 'divisional') {
            const originalAllText = el.value;
            const newBlocks = parser.extractBodyLongitudeBlocks(raw);
            let newBlockMap = {};
            for (const block of newBlocks) {
                const dType = parser.detectDivisionalType(block.header);
                const filtered = parser.filterBodyList(block.lines, filters);
                if (filtered.length > 0) {
                    newBlockMap[dType] = filtered;
                }
            }
            const oldBlocks = parser.extractBodyLongitudeBlocks(originalAllText);
            let oldBlockMap = {};
            for (const block of oldBlocks) {
                const dType = parser.detectDivisionalType(block.header);
                const filtered = parser.filterBodyList(block.lines, filters);
                if (filtered.length > 0) {
                    oldBlockMap[dType] = filtered;
                }
            }
            const mergedMap = Object.assign({}, oldBlockMap, newBlockMap);
            const typeOrder = { 'D1': 0, 'D2': 1, 'D3': 2, 'D4': 3, 'D5': 4, 'D6': 5, 'D7': 6, 'D8': 7, 'D9': 8,
                'D10': 9, 'D11': 10, 'D12': 11, 'D16': 12, 'D20': 13, 'D24': 14, 'D27': 15, 'D30': 16, 'D40': 17,
                'D45': 18, 'D60': 19, 'D81': 20, 'D108': 21, 'D144': 22
            };
            const sortedTypes = Object.keys(mergedMap).sort((a, b) => (typeOrder[a] ?? 99) - (typeOrder[b] ?? 99));
            const outputChunks = [];
            for (const t of sortedTypes) {
                outputChunks.push(`=== ${t} 分盘 ===`);
                outputChunks.push(mergedMap[t].join('\n'));
            }
            const finalText = outputChunks.join('\n\n');
            el.value = finalText;
            showToast(`✅ 已追加分盘，当前共${sortedTypes.length}个分盘`);
            return;
        }

        if (type === 'dasha') {
            const tree = parser.parseDashaBlocks(raw);
            const merged = parser.mergeDashaTrees([tree]);
            const dashaStr = parser.serializeDashaTree(merged, filters);
            const result = '=== Vimsottari 大运 ===\n' + (dashaStr || '（未检测到大运数据）');
            el.value = result;
            showToast('✅ 清洗本段完成');
            return;
        }

        if (type === 'transit') {
            const transitData = parser.parseTransitData(raw);
            if (Object.keys(transitData).length === 0) {
                showToast('⚠️ 未识别到 Transit 数据，请检查格式');
                return;
            }
            let lines = ['=== 当前过运 (Gochara) ==='];
            for (const [planet, data] of Object.entries(transitData)) {
                const goodTag = data.good ? ' (吉)' : '';
                lines.push(`${planet}: 第${data.house}宫${goodTag}`);
            }
            el.value = lines.join('\n');
            showToast(`✅ 已解析 ${Object.keys(transitData).length} 颗行星的过运数据`);
            return;
        }

    } catch (e) {
        showToast('⚠️ 清洗出错: ' + e.message);
        console.error(e);
    }
}

// ================================================================
// ===== 合并生成 =====
// ================================================================
function mergeAndGenerate() {
    const full = document.getElementById('pasteFull').value;
    const div = document.getElementById('pasteDivisional').value;
    const dasha = document.getElementById('pasteDasha').value;
    const transit = document.getElementById('pasteTransit').value;

    if (!full && !div && !dasha && !transit) {
        showToast('⚠️ 请至少粘贴一个输入框的内容');
        return;
    }

    const filters = getFilterState();
    const parser = window.JhoraParser;

    try {
        const result = parser.mergeAll(full, div, dasha, transit, filters);
        document.getElementById('outputText').value = result;
        saveHistory(result);
        updateHistoryBadge();
        showToast('✅ 合并生成完成（已自动保存历史）');
    } catch (e) {
        showToast('⚠️ 生成出错: ' + e.message);
        console.error(e);
    }
}

// ================================================================
// ===== 导出 TXT =====
// ================================================================
function exportTxt() {
    const output = document.getElementById('outputText');
    const content = output.value.trim();
    if (!content) {
        showToast('⚠️ 输出区为空，请先生成文本');
        return;
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jhora-星盘数据-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('⬇️ 已导出 TXT 文件');
}

// ================================================================
// ===== 历史记录 =====
// ================================================================
function getHistory() {
    try {
        const data = localStorage.getItem('jhoraHistory');
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}

function saveHistory(content) {
    if (!content || content.trim().length < 10) return;
    const history = getHistory();
    const entry = {
        id: Date.now(),
        time: new Date().toLocaleString('zh-CN', { hour12: false }),
        content: content,
        preview: content.replace(/\n/g, ' ').slice(0, 80) + (content.length > 80 ? '…' : '')
    };
    const exists = history.some(h => h.content === content);
    if (exists) return;
    history.unshift(entry);
    while (history.length > 20) history.pop();
    localStorage.setItem('jhoraHistory', JSON.stringify(history));
}

function updateHistoryBadge() {
    const history = getHistory();
    const badge = document.getElementById('historyBadge');
    badge.textContent = history.length > 0 ? `(${history.length})` : '';
}

function openHistoryModal() {
    const history = getHistory();
    const list = document.getElementById('historyList');
    const count = document.getElementById('historyCount');
    count.textContent = `共 ${history.length} 条`;

    if (history.length === 0) {
        list.innerHTML =
        `<div class="history-empty">暂无历史记录<br><span style="font-size:12px;color:#4a5363;">合并生成后会自动保存</span></div>`;
        document.getElementById('historyModal').classList.add('open');
        return;
    }

    let html = '';
    history.forEach((item, index) => {
        html += `
            <div class="history-item" onclick="loadHistory(${item.id})">
                <span class="del" onclick="event.stopPropagation();deleteHistory(${item.id})">✕</span>
                <div class="time">${item.time}</div>
                <div class="preview">${item.preview}</div>
            </div>
        `;
    });
    list.innerHTML = html;
    document.getElementById('historyModal').classList.add('open');
}

function loadHistory(id) {
    const history = getHistory();
    const entry = history.find(h => h.id === id);
    if (entry) {
        document.getElementById('outputText').value = entry.content;
        closeModal('historyModal');
        showToast('✅ 已恢复历史记录');
    }
}

function deleteHistory(id) {
    let history = getHistory();
    history = history.filter(h => h.id !== id);
    localStorage.setItem('jhoraHistory', JSON.stringify(history));
    updateHistoryBadge();
    openHistoryModal();
    showToast('🗑 已删除');
}

function clearAllHistory() {
    if (confirm('确定要清空所有历史记录吗？')) {
        localStorage.removeItem('jhoraHistory');
        updateHistoryBadge();
        openHistoryModal();
        showToast('🗑 已清空全部历史');
    }
}

// ================================================================
// ===== 复制 & AI 跳转 =====
// ================================================================
let copiedText = '';

function copyAndShowModal() {
    const output = document.getElementById('outputText');
    if (!output.value.trim()) {
        showToast('⚠️ 输出区为空，请先生成文本');
        return;
    }
    copiedText = output.value;
    navigator.clipboard.writeText(copiedText).then(() => {
        showToast('📋 已复制');
        document.getElementById('aiModal').classList.add('open');
    }).catch(() => {
        output.select();
        document.execCommand('copy');
        showToast('📋 已复制');
        document.getElementById('aiModal').classList.add('open');
    });
}

function openAI(platform) {
    const urls = {
        chatgpt: 'https://chat.openai.com/',
        deepseek: 'https://chat.deepseek.com/',
        gemini: 'https://gemini.google.com/',
        claude: 'https://claude.ai/'
    };
    if (urls[platform]) {
        window.open(urls[platform], '_blank');
        showToast('🔗 已打开 ' + platform.charAt(0).toUpperCase() + platform.slice(1));
    }
}

// ================================================================
// ===== 专业话术生成器 =====
// ================================================================
function generatePrompt() {
    const checks = {
        all: document.getElementById('promptAll').checked,
        career: document.getElementById('promptCareer').checked,
        marriage: document.getElementById('promptMarriage').checked,
        dasha: document.getElementById('promptDasha').checked,
    };
    if (!checks.all && !checks.career && !checks.marriage && !checks.dasha) {
        checks.all = true;
    }
    let sections = [];
    if (checks.all) {
        sections.push(
            `**全盘概览**：分析 Lagna（上升点）、AK（Atmakaraka，灵魂指标星）、整体财运、健康、人际关系潜力。指出命盘中突出的 Raja Yoga（尊贵组合）或困难 Yoga，并给出综合评价。`
            );
    }
    if (checks.career) {
        sections.push(
            `**事业与财运**：分析 D1（本命盘）和 D10（Dasamsa，事业分盘）中的职业征象。重点关注：10 宫主星状态、10 宫 lord 的 placement、Karma Bhava（业力宫）相关 yoga、当前 Dasha 对事业的影响、适合的行业方向与最佳职业时机。`
            );
    }
    if (checks.marriage) {
        sections.push(
            `**婚姻与感情**：分析 D1（本命盘）和 D9（Navamsa，婚姻分盘）中的婚姻征象。重点关注：7 宫主星状态、7 宫 lord 的 placement、DK（Darakaraka，婚姻指标星）的 condition、Venus（女）/ Jupiter（男）的状态、婚姻相关的 Yoga 和 Dasha 指示。`
            );
    }
    if (checks.dasha) {
        sections.push(
            `**大运流年**：重点分析当前 Vimsottari Dasha 的运行情况。结合 MD（主运）、AD（次运）、Pratyantardasa（小小运）的叠加效应，预测未来 3-5 年的关键时间节点、重大事件窗口（如职业转折、婚姻机会、财务波动），并给出每个阶段的行动建议。`
            );
    }

    let prompt = `【角色设定】\n你是一位精通印度占星（Jyotish）的资深占星师，擅长 Parashara 和 Jaimini 体系。\n\n`;
    prompt += `【任务】\n请基于以下标准化印占星盘数据，进行深度专业解读。\n\n`;
    prompt += `【解读重点】\n`;
    sections.forEach((s, i) => { prompt += `${i+1}. ${s}\n`; });
    prompt += `\n【分析要求】\n`;
    prompt += `- 请结合行星的 Shadbala（六力量）、Ashtakavarga（八宫分）、Vimsopaka（二十宫分）等综合参数。\n`;
    prompt += `- 给出有层次、有依据的结论，避免泛泛而谈。\n`;
    prompt += `- 对于不理想的行星位置，请给出实际的缓解建议（如 Gemstone、Mantra、Daan）。\n`;
    prompt += `- 对于关键的时间节点，请明确说明潜在的机遇和风险。\n\n`;
    prompt += `【星盘数据】\n（请在此处粘贴您从工具输出的标准化星盘文本）`;

    navigator.clipboard.writeText(prompt).then(() => {
        showToast('📝 专业话术已复制，请粘贴到AI并替换【星盘数据】部分');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = prompt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showToast('📝 专业话术已复制，请粘贴到AI并替换【星盘数据】部分');
    });
}

function copyDefaultPrompt() {
    const prompt = `【角色设定】\n你是一位精通印度占星（Jyotish）的资深占星师，擅长 Parashara 和 Jaimini 体系。\n\n` +
        `【任务】\n请基于以下标准化印占星盘数据，进行深度专业解读。\n\n` +
        `【解读重点】\n` +
        `1. **全盘概览**：分析 Lagna、AK、整体财运、健康、人际关系潜力，指出突出的 Yoga。\n` +
        `2. **事业与财运**：分析 D1 和 D10 的职业征象，重点关注 10 宫主、Karma Bhava、当前 Dasha 的影响。\n` +
        `3. **婚姻与感情**：分析 D1 和 D9 的婚姻征象，重点关注 7 宫主、DK、Venus/Jupiter 的状态。\n` +
        `4. **大运流年**：分析当前 Vimsottari Dasha 的 MD/AD/Pratyantardasa 叠加效应，预测未来 3-5 年关键节点。\n\n` +
        `【分析要求】\n` +
        `- 结合 Shadbala、Ashtakavarga、Vimsopaka 等综合参数。\n` +
        `- 给出有层次、有依据的结论，避免泛泛而谈。\n` +
        `- 对于不理想的位置给出缓解建议（Gemstone、Mantra、Daan）。\n` +
        `- 对于关键时间节点明确说明机遇和风险。\n\n` +
        `【星盘数据】\n（请在此处粘贴您从工具输出的标准化星盘文本）`;

    navigator.clipboard.writeText(prompt).then(() => {
        showToast('📝 默认话术已复制，请粘贴到AI并替换【星盘数据】部分');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = prompt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showToast('📝 默认话术已复制，请粘贴到AI并替换【星盘数据】部分');
    });
}

// ================================================================
// ===== 快捷键 =====
// ================================================================
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        mergeAndGenerate();
    }
});

// ================================================================
// ===== 核心解析引擎 JhoraParser =====
// ================================================================
window.JhoraParser = {
    extractBirthInfo: function(text) {
        const lines = text.split('\n');
        let birthLines = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (/^Body\s+Longitude/.test(trimmed)) break;
            if (/Chara karaka|Ashtakavarga/i.test(trimmed)) break;
            if (trimmed) birthLines.push(line.trim());
        }
        return birthLines.join('\n').trim();
    },

    extractBodyLongitudeBlocks: function(text) {
        const lines = text.split('\n');
        const blocks = [];
        let currentBlock = [];
        let header = '';
        let inBodyList = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            const isHeader1 = /Body\s+Longitude\s*\(in\s+D-/i.test(trimmed);
            const isHeader2 = /Body\s+Longitude\s+Nakshatra\s+Pada\s+Rasi\s+Navamsa/i.test(trimmed);
            if (isHeader1 || isHeader2) {
                if (currentBlock.length > 0) {
                    blocks.push({ header: header, lines: currentBlock });
                    currentBlock = [];
                }
                header = trimmed;
                inBodyList = true;
                continue;
            }
            if (inBodyList && /^[A-Za-z]/.test(trimmed) && /[\d°']/.test(trimmed)) {
                currentBlock.push(trimmed);
                continue;
            }
            if (inBodyList && /Chara karaka|Ashtakavarga|Shadbala|Vaiseshikamsa|Vimsopaka/i.test(trimmed)) {
                if (currentBlock.length > 0) {
                    blocks.push({ header: header, lines: currentBlock });
                    currentBlock = [];
                }
                inBodyList = false;
                header = '';
            }
        }
        if (currentBlock.length > 0) {
            blocks.push({ header: header || 'D1', lines: currentBlock });
        }
        if (blocks.length === 0) {
            const allLines = lines.filter(l => l.trim() && /^[A-Za-z]/.test(l.trim()) && /[\d°']/.test(l.trim()));
            if (allLines.length > 0) {
                blocks.push({ header: 'D1', lines: allLines });
            }
        }
        return blocks;
    },

    detectDivisionalType: function(headerText) {
        const match = headerText.match(/\(in\s+D-(\d+)/i);
        if (match) return 'D' + match[1];
        if (/Nakshatra\s+Pada\s+Rasi\s+Navamsa/i.test(headerText)) return 'D1';
        if (/Navamsa/i.test(headerText)) return 'D9';
        if (/Dasamsa/i.test(headerText)) return 'D10';
        if (/Hora/i.test(headerText)) return 'D2';
        if (/Drekkana/i.test(headerText)) return 'D3';
        if (/Saptamsa/i.test(headerText)) return 'D7';
        return 'D1';
    },

    filterBodyList: function(lines, filters) {
        const excludeKeywords = [
            'Sphuta', 'Tithi', 'Yoga', 'Avayoga',
            'Bhava', 'Hora', 'Ghati', 'Vighati', 'Varnada',
            'Sree', 'Pranapada', 'Indu', 'Bhrigu',
            'Dhooma', 'Vyatipata', 'Parivesha', 'Indra Chapa',
            'Upaketu', 'Kaala', 'Mrityu', 'Artha Prahara',
            'Yama Ghantaka', 'AL', 'A2', 'A3', 'A4', 'A5',
            'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'UL',
            'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8',
            'V9', 'V10', 'V11', 'V12', 'Kunda'
        ];
        const keep = [];
        const forced = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Lagna'];
        const outer = ['Uranus', 'Neptune', 'Pluto'];
        const lagnaGroups = {
            bhava: ['Bhava', 'Hora', 'Ghati'],
            vighati: ['Vighati'],
            varnada: ['Varnada'],
            sree: ['Sree'],
            pranapada: ['Pranapada'],
            indu: ['Indu'],
            bhrigu: ['Bhrigu']
        };
        const upagrahaList = ['Mandi', 'Gulika', 'Dhooma', 'Vyatipata', 'Parivesha', 'Indra Chapa', 'Upaketu', 'Kaala',
            'Mrityu', 'Artha Prahara', 'Yama Ghantaka'
        ];
        const sphutaList = ['Prasna Marga Sphuta', 'Prana Sphuta', 'Deha Sphuta', 'Mrityu Sphuta',
            'Sookshma TriSphuta', 'Tithi Sphuta', 'Rahu Tithi Sphuta', 'Kshetra Sphuta', 'Beeja Sphuta',
            'TriSphuta', 'ChatusSphuta', 'PanchaSphuta', 'Yoga Sphuta', 'Avayoga Sphuta'
        ];

        for (const line of lines) {
            const trimmed = line.trim();
            const firstWord = trimmed.match(/^([^\s\-]+)/)?.[1] || '';
            const hasExcludeKeyword = excludeKeywords.some(kw => trimmed.includes(kw));

            if (forced.includes(firstWord) && !hasExcludeKeyword) {
                keep.push(line);
                continue;
            }
            if (filters.outer && outer.includes(firstWord) && !hasExcludeKeyword) {
                keep.push(line);
                continue;
            }
            let matchedLagna = false;
            for (const [key, words] of Object.entries(lagnaGroups)) {
                if (filters[key] && words.includes(firstWord)) {
                    matchedLagna = true;
                    break;
                }
            }
            if (matchedLagna) {
                keep.push(line);
                continue;
            }
            if (filters.mandi && firstWord === 'Mandi') { keep.push(line); continue; }
            if (filters.gulika && firstWord === 'Gulika') { keep.push(line); continue; }
            if (filters.otherUpagraha && upagrahaList.includes(firstWord)) {
                keep.push(line);
                continue;
            }
            const isSphuta = sphutaList.some(s => trimmed.includes(s));
            if (filters.sphutaPrasna && isSphuta) { keep.push(line); continue; }
            if (filters.sphutaYoga && (trimmed.includes('Yoga Sphuta') || trimmed.includes('Avayoga Sphuta'))) {
                keep.push(line);
                continue;
            }
            if (filters.arudhaLagna && (trimmed.includes('AL') || trimmed.includes('Arudha Lagna'))) {
                keep.push(line);
                continue;
            }
            if (filters.bhavaArudha && trimmed.includes('Bhava Arudha')) { keep.push(line); continue; }
            if (filters.grahaArudha && trimmed.includes('Graha Arudha')) { keep.push(line); continue; }
            if (filters.varnadas && /^V[2-9]\b|^V1[0-2]?/.test(firstWord)) { keep.push(line); continue; }
            if (filters.kunda && firstWord === 'Kunda') { keep.push(line); continue; }
        }
        return keep;
    },

    parseDashaBlocks: function(text) {
        const blocks = text.split(/(?=Vimsottari Dasa:)/i).filter(s => s.trim().length > 0);
        const result = { mdMap: {} };
        for (const block of blocks) {
            const lines = block.split('\n');
            let currentMD = null;
            let currentAD = null;
            let inMaha = false;
            let inAntar = false;
            let inPraty = false;

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                if (/Maha Dasas:/i.test(trimmed)) {
                    inMaha = true;
                    inAntar = false;
                    inPraty = false;
                    continue;
                }
                if (/Antardasas in this MD:/i.test(trimmed)) {
                    inAntar = true;
                    inMaha = false;
                    inPraty = false;
                    continue;
                }
                if (/Pratyantardasas in this AD:/i.test(trimmed)) {
                    inPraty = true;
                    inAntar = false;
                    inMaha = false;
                    continue;
                }

                if (!inMaha && !inAntar && !inPraty) {
                    let mdMatch = trimmed.match(/^([A-Za-z]+)\s+MD:\s+([\d-]+)\s+\(.*?\)\s*-\s*([\d-]+)\s+\(.*?\)/);
                    if (mdMatch) {
                        const name = mdMatch[1];
                        const start = mdMatch[2];
                        const end = mdMatch[3];
                        if (!result.mdMap[name]) {
                            result.mdMap[name] = { start, end, adMap: {} };
                        }
                        currentMD = name;
                        currentAD = null;
                        inMaha = false;
                        inAntar = false;
                        inPraty = false;
                        continue;
                    }
                    let adMatch = trimmed.match(/^([A-Za-z]+)\s+AD:\s+([\d-]+)\s+\(.*?\)\s*-\s*([\d-]+)\s+\(.*?\)/);
                    if (adMatch && currentMD) {
                        const name = adMatch[1];
                        const start = adMatch[2];
                        const end = adMatch[3];
                        if (!result.mdMap[currentMD].adMap[name]) {
                            result.mdMap[currentMD].adMap[name] = { start, end, pdList: [] };
                        }
                        currentAD = name;
                        inAntar = false;
                        continue;
                    }
                }

                if (inMaha) {
                    const match = trimmed.match(/^([A-Za-z]+):\s+([\d-]+)\s+\(.*?\)\s*-\s*([\d-]+)\s+\(.*?\)/);
                    if (match) {
                        const name = match[1];
                        const start = match[2];
                        const end = match[3];
                        if (!result.mdMap[name]) {
                            result.mdMap[name] = { start, end, adMap: {} };
                        }
                        continue;
                    }
                }

                if (inAntar) {
                    const match = trimmed.match(/^([A-Za-z]+):\s+([\d-]+)\s+\(.*?\)\s*-\s*([\d-]+)\s+\(.*?\)/);
                    if (match && currentMD) {
                        const name = match[1];
                        const start = match[2];
                        const end = match[3];
                        if (!result.mdMap[currentMD].adMap[name]) {
                            result.mdMap[currentMD].adMap[name] = { start, end, pdList: [] };
                        }
                        currentAD = name;
                        continue;
                    }
                }

                if (inPraty) {
                    const match = trimmed.match(/^([A-Za-z]+):\s+([\d-]+)\s+\(.*?\)\s*-\s*([\d-]+)\s+\(.*?\)/);
                    if (match && currentAD && currentMD) {
                        const name = match[1];
                        const start = match[2];
                        const end = match[3];
                        result.mdMap[currentMD].adMap[currentAD].pdList.push({ name, start, end });
                        continue;
                    }
                }
            }
        }
        return result;
    },

    mergeDashaTrees: function(trees) {
        const merged = { mdMap: {} };
        for (const tree of trees) {
            for (const [mdName, mdData] of Object.entries(tree.mdMap)) {
                if (!merged.mdMap[mdName]) {
                    merged.mdMap[mdName] = { start: mdData.start, end: mdData.end, adMap: {} };
                }
                for (const [adName, adData] of Object.entries(mdData.adMap)) {
                    if (!merged.mdMap[mdName].adMap[adName]) {
                        merged.mdMap[mdName].adMap[adName] = { start: adData.start, end: adData.end, pdList: [] };
                    }
                    for (const pd of adData.pdList) {
                        const exists = merged.mdMap[mdName].adMap[adName].pdList.some(
                            p => p.name === pd.name && p.start === pd.start && p.end === pd.end
                        );
                        if (!exists) {
                            merged.mdMap[mdName].adMap[adName].pdList.push(pd);
                        }
                    }
                }
            }
        }
        return merged;
    },

    serializeDashaTree: function(tree, filters) {
        const lines = [];
        const showAD = filters.ad;
        const showPD = filters.pratyantardasa;
        const mdNames = Object.keys(tree.mdMap).sort();
        for (const mdName of mdNames) {
            const md = tree.mdMap[mdName];
            lines.push(`${mdName} MD: ${md.start} ~ ${md.end}`);
            if (showAD) {
                const adNames = Object.keys(md.adMap).sort();
                for (const adName of adNames) {
                    const ad = md.adMap[adName];
                    lines.push(`  ${adName} AD: ${ad.start} ~ ${ad.end}`);
                    if (showPD && ad.pdList.length > 0) {
                        for (const pd of ad.pdList) {
                            lines.push(`    ${pd.name}: ${pd.start} ~ ${pd.end}`);
                        }
                    }
                }
            }
        }
        return lines.join('\n');
    },

    extractDashaFromFull: function(text) {
        const lines = text.split('\n');
        let dashaLines = [];
        let inDasha = false;
        for (const line of lines) {
            if (/Vimsottari Dasa:/i.test(line)) {
                inDasha = true;
            }
            if (inDasha) {
                if (/Moola Dasa|Ashtottari Dasa|Kalachakra Dasa|Narayana Dasa|Sudasa/i.test(line)) break;
                dashaLines.push(line);
            }
        }
        return dashaLines.join('\n');
    },

    // ================================================================
    // 解析 Transit/Gochara 数据
    // ================================================================
    parseTransitData: function(text) {
        const lines = text.split('\n');
        const result = {};

        const planetMap = {
            'Sun': '太阳',
            'Moon': '月亮',
            'Mars': '火星',
            'Mercury': '水星',
            'Jupiter': '木星',
            'Venus': '金星',
            'Saturn': '土星',
            'Rahu': 'Rahu',
            'Ketu': 'Ketu'
        };

        const houseMap = {
            '1st': '1', '2nd': '2', '3rd': '3', '4th': '4', '5th': '5',
            '6th': '6', '7th': '7', '8th': '8', '9th': '9',
            '10th': '10', '11th': '11', '12th': '12'
        };

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (/Planet\s+Tara/i.test(trimmed)) continue;
            if (/^-+/.test(trimmed)) continue;

            let match = trimmed.match(/^(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)\s+/i);
            if (!match) continue;

            const engName = match[1];
            const cnName = planetMap[engName] || engName;

            let houseMatch = trimmed.match(/\b(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th)\b/);
            if (!houseMatch) {
                houseMatch = trimmed.match(/\b(\d+)(?:st|nd|rd|th)\s*(?:\(Good\))?/);
            }
            if (!houseMatch) continue;

            let houseNum = houseMap[houseMatch[1]] || houseMatch[1];
            const isGood = /\(Good\)/i.test(trimmed);

            result[cnName] = {
                house: houseNum,
                good: isGood
            };
        }

        return result;
    },

    // ================================================================
    // 合并所有数据（含 Gochara）
    // ================================================================
    mergeAll: function(fullText, divText, dashaText, transitText, filters) {
        const outputSections = [];

        // 出生基础信息
        let birthInfo = '';
        if (fullText) {
            birthInfo = this.extractBirthInfo(fullText);
        }
        if (birthInfo) {
            outputSections.push('【出生基础信息】');
            outputSections.push(birthInfo);
        } else {
            outputSections.push('【出生基础信息】');
            outputSections.push('⚠️ 未检测到出生信息。请粘贴“完整全盘计算文本”（框1）以补充。');
        }

        // 分盘数据
        const blockMap = {};
        if (fullText) {
            const rawBlocks = this.extractBodyLongitudeBlocks(fullText);
            for (const block of rawBlocks) {
                const type = this.detectDivisionalType(block.header);
                const filtered = this.filterBodyList(block.lines, filters);
                if (filtered.length > 0) {
                    blockMap[type] = { lines: filtered, source: 'full' };
                }
            }
        }
        if (divText) {
            const rawBlocks = this.extractBodyLongitudeBlocks(divText);
            for (const block of rawBlocks) {
                const type = this.detectDivisionalType(block.header);
                const filtered = this.filterBodyList(block.lines, filters);
                if (filtered.length > 0) {
                    blockMap[type] = { lines: filtered, source: 'div' };
                }
            }
        }

        const typeOrder = { 'D1': 0, 'D2': 1, 'D3': 2, 'D4': 3, 'D5': 4, 'D6': 5, 'D7': 6, 'D8': 7, 'D9': 8,
            'D10': 9, 'D11': 10, 'D12': 11, 'D16': 12, 'D20': 13, 'D24': 14, 'D27': 15, 'D30': 16, 'D40': 17,
            'D45': 18, 'D60': 19, 'D81': 20, 'D108': 21, 'D144': 22
        };

        const divisionalBlocks = Object.entries(blockMap)
            .map(([type, data]) => ({ type, lines: data.lines }))
            .sort((a, b) => (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99));

        for (const block of divisionalBlocks) {
            outputSections.push(`=== ${block.type} 分盘 ===`);
            outputSections.push(block.lines.join('\n'));
        }

        // Dasha 数据
        let dashaSource = dashaText;
        if (!dashaSource && fullText) {
            dashaSource = this.extractDashaFromFull(fullText);
        }
        if (dashaSource) {
            const tree = this.parseDashaBlocks(dashaSource);
            const merged = this.mergeDashaTrees([tree]);
            const dashaStr = this.serializeDashaTree(merged, filters);
            if (dashaStr) {
                outputSections.push('=== Vimsottari 大运 ⭐ ===');
                outputSections.push(dashaStr);
            }
        }

        // Gochara 数据
        if (transitText) {
            const transitData = this.parseTransitData(transitText);
            if (Object.keys(transitData).length > 0) {
                outputSections.push('=== 当前过运 (Gochara) ===');
                for (const [planet, data] of Object.entries(transitData)) {
                    const goodTag = data.good ? ' (吉)' : '';
                    outputSections.push(`${planet}: 第${data.house}宫${goodTag}`);
                }
            }
        }

        return outputSections.join('\n\n');
    }
};

// ================================================================
// ===== 跳转到提问助手，携带清洗后的数据 =====
// ================================================================
function goToPrompt() {
    const output = document.getElementById('outputText');
    const data = output.value.trim();

    if (!data) {
        showToast('⚠️ 输出区为空，请先生成星盘数据');
        return;
    }

    // 用 localStorage 传递（长文本安全）
    try {
        localStorage.setItem('jhoraCleanData', data);
        window.open('https://jhora-prompt.pages.dev', '_blank');
    } catch (e) {
        showToast('⚠️ 数据过大，请手动复制');
        console.error(e);
    }
}

// ================================================================
// ===== 页面初始化 =====
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
    applyPreset('minimal');
    updateHistoryBadge();
});
