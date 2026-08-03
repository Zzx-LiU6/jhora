// ================================================================
// ===== 核心解析引擎 JhoraParser =====
// ================================================================
window.JhoraParser = {
    extractBirthInfo: function(text, keepFull) {
        console.log('🔍 extractBirthInfo 收到 keepFull:', keepFull);
        const lines = text.split('\n');
        let birthLines = [];
        let i = 0;

        // 核心白名单
        const keepPrefixes = [
            'Natal Chart',
            'Gender:',
            'Date:',
            'Time:',
            'Time Zone:',
            'Nakshatra:',
            'Ayanamsa:'
        ];

        // 如果 keepFull 为 true，额外保留这些
        const fullPrefixes = [
            'Lunar Yr-Mo:',
            'Tithi:',
            'Vedic Weekday:',
            'Yoga:',
            'Karana:',
            'Hora Lord:',
            'Sunrise:',
            'Sunset:',
            'Sidereal Time:'
        ];

        while (i < lines.length) {
            const trimmed = lines[i].trim();
            if (!trimmed) { i++; continue; }

            if (/^[A-Z]:\\/.test(trimmed)) { i++; continue; }
            if (/^E:\\/.test(trimmed)) { i++; continue; }
            if (/^C:\\/.test(trimmed)) { i++; continue; }

            if (/^Body\s+Longitude/.test(trimmed)) break;
            if (/Chara karaka|Ashtakavarga/i.test(trimmed)) break;
            if (/^\+-+/.test(trimmed)) break;

            // Place: 行特殊处理
            if (trimmed.startsWith('Place:')) {
                const coords = trimmed.replace(/^Place:\s*/, '').trim();
                let city = '';
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    if (nextLine && !/^[A-Za-z]+:/.test(nextLine)) {
                        city = nextLine;
                        i++;
                    }
                }
                const merged = city ? `Place: ${coords} (${city})` : `Place: ${coords}`;
                birthLines.push(merged);
                i++;
                continue;
            }

            // 检查核心白名单
            const shouldKeep = keepPrefixes.some(p => trimmed.startsWith(p));
            if (shouldKeep) {
                birthLines.push(trimmed);
                i++;
                continue;
            }

            // 如果勾选了“保留完整出生信息”，检查扩展白名单
            if (keepFull) {
                const shouldKeepFull = fullPrefixes.some(p => trimmed.startsWith(p));
                if (shouldKeepFull) {
                    birthLines.push(trimmed);
                }
            }

            i++;
        }

        return birthLines.join('\n').trim();
    },

extractBodyLongitudeBlocks: function(text, filters) {
    const lines = text.split('\n');
    const blocks = [];
    let currentBlock = [];
    let header = '';
    let inBodyList = false;
    let inSupplementary = false;
    let supplementaryLines = [];
    let seenD1 = false;
    let currentSupplementType = '';
    let prevSupplementType = '';

    const f = filters || { 
        charaKaraka: true, 
        ashtakavarga: true, 
        vimsopaka: true,
        shadbala: false, 
        vaiseshikamsa: false 
    };

    function getSupplementType(line) {
        if (/^Chara karaka/i.test(line)) return 'charaKaraka';
        if (/Ashtakavarga/i.test(line)) return 'ashtakavarga';
        if (/Vimsopaka/i.test(line)) return 'vimsopaka';
        if (/Shadbala/i.test(line)) return 'shadbala';
        if (/Vaiseshikamsa/i.test(line)) return 'vaiseshikamsa';
        if (/Sodhya Pinda|Rasi Pinda|Graha Pinda|Planet\s+Age|Planet\s+Activity/i.test(line)) return 'removed';
        return 'other';
    }

    function shouldKeepSupplement(type) {
        if (type === 'charaKaraka') return f.charaKaraka !== false;
        if (type === 'ashtakavarga') return f.ashtakavarga !== false;
        if (type === 'vimsopaka') return f.vimsopaka !== false;
        if (type === 'shadbala') return f.shadbala === true;
        if (type === 'vaiseshikamsa') return f.vaiseshikamsa === true;
        if (type === 'removed') return false;
        return false;
    }

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (/^[A-Z]:\\/.test(trimmed)) continue;
        if (/^E:\\/.test(trimmed)) continue;
        if (/^C:\\/.test(trimmed)) continue;

        if (/^\+-+/.test(trimmed)) {
            if (inSupplementary && supplementaryLines.length > 0) {
                blocks.push({ header: '=== 补充数据 ===', lines: supplementaryLines });
                supplementaryLines = [];
                inSupplementary = false;
                currentSupplementType = '';
                prevSupplementType = '';
            }
            continue;
        }

        if (/Vimsottari Dasa:|Moola Dasa:|Ashtottari Dasa:|Kalachakra Dasa:|Narayana Dasa:|Sudasa:/i.test(trimmed)) {
            if (supplementaryLines.length > 0) {
                blocks.push({ header: '=== 补充数据 ===', lines: supplementaryLines });
                supplementaryLines = [];
            }
            inSupplementary = false;
            inBodyList = false;
            currentSupplementType = '';
            prevSupplementType = '';
            continue;
        }

        const isHeader1 = /Body\s+Longitude\s*\(in\s+D-/i.test(trimmed);
        const isHeader2 = /Body\s+Longitude\s+Nakshatra\s+Pada\s+Rasi\s+Navamsa/i.test(trimmed);
        const isSupplementary = /Ashtakavarga|Shadbala|Vaiseshikamsa|Vimsopaka|Chara karaka|Shodasa Varga|Sapta Varga|Shad Varga|Planet\s+Activity|Planet\s+Age|Sodhya Pinda|Rasi Pinda|Graha Pinda/i.test(trimmed);

        if (isHeader1 || isHeader2) {
            if (currentBlock.length > 0) {
                blocks.push({ header: header, lines: currentBlock });
                currentBlock = [];
            }
            if (/\(in\s+D-1/i.test(trimmed) || /Nakshatra\s+Pada\s+Rasi\s+Navamsa/i.test(trimmed)) {
                if (seenD1) {
                    header = trimmed;
                    inBodyList = true;
                    inSupplementary = false;
                    continue;
                }
                seenD1 = true;
            }
            header = trimmed;
            inBodyList = true;
            inSupplementary = false;
            currentSupplementType = '';
            prevSupplementType = '';
            continue;
        }

        if (isSupplementary && inBodyList) {
            if (currentBlock.length > 0) {
                blocks.push({ header: header, lines: currentBlock });
                currentBlock = [];
            }
            inBodyList = false;
            inSupplementary = true;
            const type = getSupplementType(trimmed);
            if (type === 'removed' || !shouldKeepSupplement(type)) {
                currentSupplementType = 'skipped';
                continue;
            }
            currentSupplementType = type;
            prevSupplementType = type;
            supplementaryLines.push(trimmed);
            continue;
        }

        if (inSupplementary) {
            if (trimmed === '') {
                if (supplementaryLines.length > 0) {
                    blocks.push({ header: '=== 补充数据 ===', lines: supplementaryLines });
                    supplementaryLines = [];
                }
                inSupplementary = false;
                currentSupplementType = '';
                prevSupplementType = '';
                continue;
            }

            if (/^Body\s+Longitude/i.test(trimmed)) {
                if (supplementaryLines.length > 0) {
                    blocks.push({ header: '=== 补充数据 ===', lines: supplementaryLines });
                    supplementaryLines = [];
                }
                inSupplementary = false;
                currentSupplementType = '';
                prevSupplementType = '';
                if (currentBlock.length > 0) {
                    blocks.push({ header: header, lines: currentBlock });
                    currentBlock = [];
                }
                header = trimmed;
                inBodyList = true;
                continue;
            }

            if (/^\+-+/.test(trimmed)) {
                if (supplementaryLines.length > 0) {
                    blocks.push({ header: '=== 补充数据 ===', lines: supplementaryLines });
                    supplementaryLines = [];
                }
                inSupplementary = false;
                currentSupplementType = '';
                prevSupplementType = '';
                continue;
            }

            // 检测新的数据块标题
            const newType = getSupplementType(trimmed);
            if (newType !== 'other' && newType !== 'skipped' && newType !== currentSupplementType) {
                if (supplementaryLines.length > 0) {
                    blocks.push({ header: '=== 补充数据 ===', lines: supplementaryLines });
                    supplementaryLines = [];
                }
                currentSupplementType = newType;
                prevSupplementType = newType;
                if (newType === 'removed' || !shouldKeepSupplement(newType)) {
                    currentSupplementType = 'skipped';
                    continue;
                }
                supplementaryLines.push(trimmed);
                continue;
            }

            // 如果当前块是被丢弃的类型，跳过所有行
            if (currentSupplementType === 'skipped') {
                continue;
            }

            supplementaryLines.push(trimmed);
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
    if (supplementaryLines.length > 0) {
        blocks.push({ header: '=== 补充数据 ===', lines: supplementaryLines });
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
            bhava: ['Bhava'],
            hora: ['Hora'],
            ghati: ['Ghati'],
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

    mergeAll: function(fullText, divText, dashaText, transitText, filters, keepFullBirth) {
        const outputSections = [];

        let birthInfo = '';
        if (fullText) {
            birthInfo = this.extractBirthInfo(fullText, keepFullBirth);  // 传参
        }
        if (birthInfo) {
            outputSections.push('【出生基础信息】');
            outputSections.push(birthInfo);
        } else {
            outputSections.push('【出生基础信息】');
            outputSections.push('⚠️ 未检测到出生信息。请粘贴“完整全盘计算文本”（框1）以补充。');
        }

        // 分盘数据 + 补充数据
        const blocks = this.extractBodyLongitudeBlocks(fullText, filters);
        const blockMap = {};

        for (const block of blocks) {
            if (block.header === '=== 补充数据 ===') {
                if (!blockMap['__supplementary']) {
                    blockMap['__supplementary'] = [];
                }
                blockMap['__supplementary'].push(block.lines.join('\n'));
                continue;
            }
            const type = this.detectDivisionalType(block.header);
            const filtered = this.filterBodyList(block.lines, filters);
            if (filtered.length > 0) {
                blockMap[type] = { lines: filtered, source: 'full' };
            }
        }

        if (divText) {
            const divBlocks = this.extractBodyLongitudeBlocks(divText);
            for (const block of divBlocks) {
                if (block.header === '=== 补充数据 ===') {
                    if (!blockMap['__supplementary']) {
                        blockMap['__supplementary'] = [];
                    }
                    blockMap['__supplementary'].push(block.lines.join('\n'));
                    continue;
                }
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
            .filter(([type]) => type !== '__supplementary')
            .map(([type, data]) => ({ type, lines: data.lines }))
            .sort((a, b) => (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99));

        for (const block of divisionalBlocks) {
            outputSections.push(`=== ${block.type} 分盘 ===`);
            outputSections.push(block.lines.join('\n'));
        }

        if (blockMap['__supplementary'] && blockMap['__supplementary'].length > 0) {
            outputSections.push('=== 补充数据 ===');
            outputSections.push(blockMap['__supplementary'].join('\n\n'));
        }

        // 如果框3没有独立粘贴大运，但从框1提取到了大运，也输出
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
