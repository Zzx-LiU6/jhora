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
        // 辅助 Lagna（9 个）
        bhava: document.getElementById('fBhava').checked,
        hora: document.getElementById('fHora').checked,
        ghati: document.getElementById('fGhati').checked,
        vighati: document.getElementById('fVighati').checked,
        varnada: document.getElementById('fVarnada').checked,
        sree: document.getElementById('fSree').checked,
        pranapada: document.getElementById('fPranapada').checked,
        indu: document.getElementById('fIndu').checked,
        bhrigu: document.getElementById('fBhrigu').checked,
        // 虚星
        mandi: document.getElementById('fMandi').checked,
        gulika: document.getElementById('fGulika').checked,
        // Sphuta
        sphutaPrasna: document.getElementById('fSphutaPrasna').checked,
        sphutaYoga: document.getElementById('fSphutaYoga').checked,
        // Arudha
        arudhaLagna: document.getElementById('fArudhaLagna').checked,
        bhavaArudha: document.getElementById('fBhavaArudha').checked,
        grahaArudha: document.getElementById('fGrahaArudha').checked,
        varnadas: document.getElementById('fVarnadas').checked,
        kunda: document.getElementById('fKunda').checked,
        // 力量与Jaimini
        charaKaraka: document.getElementById('fCharaKaraka').checked,
        ashtakavarga: document.getElementById('fAshtakavarga').checked,
        vimsopaka: document.getElementById('fVimsopaka').checked,
        shadbala: document.getElementById('fShadbala').checked,
        vaiseshikamsa: document.getElementById('fVaiseshikamsa').checked,
        // 大运
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

    // 基础星体
    document.getElementById('fOuter').checked = false;
    // 辅助 Lagna（9 个全部关闭）
    document.getElementById('fBhava').checked = false;
    document.getElementById('fHora').checked = false;
    document.getElementById('fGhati').checked = false;
    document.getElementById('fVighati').checked = false;
    document.getElementById('fVarnada').checked = false;
    document.getElementById('fSree').checked = false;
    document.getElementById('fPranapada').checked = false;
    document.getElementById('fIndu').checked = false;
    document.getElementById('fBhrigu').checked = false;
    // 虚星
    document.getElementById('fMandi').checked = false;
    document.getElementById('fGulika').checked = false;
    // Sphuta
    document.getElementById('fSphutaPrasna').checked = false;
    document.getElementById('fSphutaYoga').checked = false;
    // Arudha
    document.getElementById('fArudhaLagna').checked = false;
    document.getElementById('fBhavaArudha').checked = false;
    document.getElementById('fGrahaArudha').checked = false;
    document.getElementById('fVarnadas').checked = false;
    document.getElementById('fKunda').checked = false;
    // 力量与Jaimini（核心三个默认开启）
    document.getElementById('fCharaKaraka').checked = true;
    document.getElementById('fAshtakavarga').checked = true;
    document.getElementById('fVimsopaka').checked = true;
    document.getElementById('fShadbala').checked = false;
    document.getElementById('fVaiseshikamsa').checked = false;
    // 大运
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
        setGroup(false, 'fMandi', 'fGulika');
        setGroup(false, 'fSphutaPrasna', 'fSphutaYoga');
        setGroup(false, 'fArudhaLagna', 'fBhavaArudha', 'fGrahaArudha', 'fVarnadas', 'fKunda');
        document.getElementById('fShadbala').checked = false;
        document.getElementById('fVaiseshikamsa').checked = false;
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
        setGroup(false, 'fSphutaPrasna', 'fSphutaYoga');
        document.getElementById('fArudhaLagna').checked = true;
        setGroup(false, 'fBhavaArudha', 'fGrahaArudha', 'fVarnadas', 'fKunda');
        document.getElementById('fShadbala').checked = true;
        document.getElementById('fVaiseshikamsa').checked = true;
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
            const blocks = parser.extractBodyLongitudeBlocks(raw, filters);
            let parts = [];
            if (birth) parts.push('【出生基础信息】\n' + birth);
            for (const block of blocks) {
                if (block.header === '=== 补充数据 ===') {
                    parts.push('=== 补充数据 ===');
                    parts.push(block.lines.join('\n'));
                } else {
                    const dType = parser.detectDivisionalType(block.header);
                    const filtered = parser.filterBodyList(block.lines, filters);
                    if (filtered.length > 0) {
                        parts.push(`=== ${dType} 分盘 ===`);
                        parts.push(filtered.join('\n'));
                    }
                }
            }
            const result = parts.join('\n\n') || '（未检测到有效数据）';
            el.value = result;
            showToast('✅ 清洗本段完成');
            return;
        }

        if (type === 'divisional') {
            const originalAllText = el.value;
            const newBlocks = parser.extractBodyLongitudeBlocks(raw, filters);
            let newBlockMap = {};
            for (const block of newBlocks) {
                if (block.header === '=== 补充数据 ===') continue;
                const dType = parser.detectDivisionalType(block.header);
                const filtered = parser.filterBodyList(block.lines, filters);
                if (filtered.length > 0) {
                    newBlockMap[dType] = filtered;
                }
            }
            const oldBlocks = parser.extractBodyLongitudeBlocks(originalAllText, filters);
            let oldBlockMap = {};
            for (const block of oldBlocks) {
                if (block.header === '=== 补充数据 ===') continue;
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

    const genderEl = document.querySelector('input[name="gender"]:checked');
    const gender = genderEl ? genderEl.value : 'female';
    const genderLabel = gender === 'male' ? 'Male' : 'Female';

    const filters = getFilterState();
    const parser = window.JhoraParser;

    try {
        let result = parser.mergeAll(full, div, dasha, transit, filters);
        result = result.replace(/(Natal Chart\n)/, `$1Gender: ${genderLabel}\n`);
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
// ===== 跳转到提问助手（带数据复制） =====
// ================================================================
function goToPrompt() {
    const output = document.getElementById('outputText');
    const data = output.value.trim();

    if (!data) {
        showToast('⚠️ 输出区为空，请先生成星盘数据');
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(data)
            .then(() => {
                showToast('✅ 数据已复制，请到提问助手 Ctrl+V 粘贴');
                setTimeout(() => {
                    window.open('https://jhora-prompt.pages.dev', '_blank');
                }, 300);
            })
            .catch(() => {
                showToast('📋 请手动复制数据（Ctrl+C）');
                setTimeout(() => {
                    window.open('https://jhora-prompt.pages.dev', '_blank');
                }, 300);
            });
    } else {
        showToast('📋 请手动复制数据（Ctrl+C）');
        setTimeout(() => {
            window.open('https://jhora-prompt.pages.dev', '_blank');
        }, 300);
    }
}

// ================================================================
// ===== 页面初始化 =====
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
    applyPreset('minimal');
    updateHistoryBadge();
});