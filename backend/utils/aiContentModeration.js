// 使用多级AI服务进行内容审核
const axios = require('axios');
const { moderateContentWithAIServices } = require('./aiServiceManager');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-demo-key';

// 如果没有设置OpenAI API密钥，使用本地审核
const USE_LOCAL_MODERATION = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-demo-key';

// 增强的违规关键词库
const VIOLATION_KEYWORDS = {
  // 1. 烟草产品类
  tobacco: [
    '香烟', '烟', 'cigarette', 'cigarettes', 'tobacco', 'smoking',
    '雪茄', 'cigar', 'cigars', '烟斗', 'pipe', 'pipes',
    '电子烟', 'vape', 'vaping', 'e-cigarette', 'e-cigarettes',
    '烟丝', 'tobacco leaf', '烟叶', '尼古丁', 'nicotine',
    '打火机', 'lighter', '火柴', 'matches', '烟灰缸', 'ashtray',
    '烟盒', 'cigarette pack', '烟包', 'tobacco products',
    '卷烟', 'roll-up', '手卷烟', 'rolling tobacco',
    '水烟', 'hookah', 'shisha', '水烟壶', '水烟袋',
    '鼻烟', 'snuff', '嚼烟', 'chewing tobacco',
    '烟具', 'smoking accessories', '烟配件'
  ],
  
  // 2. 违禁药物类
  drugs: [
    '毒品', 'drugs', 'drug', '大麻', 'marijuana', 'cannabis',
    '可卡因', 'cocaine', '海洛因', 'heroin', '冰毒', 'meth',
    '摇头丸', 'ecstasy', 'mdma', 'k粉', 'ketamine',
    '处方药', 'prescription', '抗生素', 'antibiotics',
    '止痛药', 'painkillers', '安眠药', 'sleeping pills',
    '兴奋剂', 'stimulants', '减肥药', 'weight loss pills',
    '麻黄碱', 'ephedrine', '咖啡因', 'caffeine',
    '违禁药物', 'illegal drugs', '管制药物', 'controlled substances'
  ],
  
  // 3. 武器类
  weapons: [
    '枪支', 'guns', 'gun', '手枪', 'pistol', '步枪', 'rifle',
    '猎枪', 'shotgun', '子弹', 'bullets', 'ammunition',
    '弹药', 'ammo', '管制刀具', 'knives', 'knife',
    '弹簧刀', 'switchblade', '蝴蝶刀', 'butterfly knife',
    '军刀', 'military knife', '爆炸物', 'explosives',
    '炸药', 'dynamite', '雷管', 'detonator', '鞭炮', 'fireworks',
    '武器', 'weapons', 'weapon', 'firearms', 'firearm'
  ],
  
  // 4. 赌博设备类
  gambling: [
    '赌博', 'gambling', '赌具', 'gambling equipment',
    '老虎机', 'slot machine', '扑克牌', 'poker cards',
    '筹码', 'chips', '骰子', 'dice', '轮盘', 'roulette',
    '百家乐', 'baccarat', '彩票', 'lottery', '刮刮乐',
    '数字彩票', 'number lottery', '赌博设备', 'gaming equipment',
    '赌场', 'casino', '博彩', 'betting'
  ],
  
  // 5. 色情内容类
  adult: [
    '色情', 'porn', 'pornography', '成人用品', 'adult toys',
    '情趣用品', 'sex toys', '润滑剂', 'lube', 'lubricant',
    '成人电影', 'adult movies', '成人内容', 'adult content',
    '成人服务', 'adult services', '按摩服务', 'massage services',
    '特殊服务', 'special services', '上门服务', 'escort services',
    '性用品', 'sexual products', '情趣', 'sexy'
  ],
  
  // 6. 假冒伪劣类
  counterfeit: [
    '假冒', 'fake', 'counterfeit', '高仿', 'replica',
    '精仿', '1:1', 'a货', 'a-grade', '假货', 'fake goods',
    '假身份证', 'fake id', '假驾照', 'fake license',
    '假护照', 'fake passport', '假证件', 'fake documents',
    '盗版', 'pirated', '破解版', 'cracked', '破解软件',
    '盗版软件', 'pirated software', '盗版游戏', 'pirated games',
    '盗版电影', 'pirated movies', '盗版音乐', 'pirated music'
  ],
  
  // 7. 野生动物类
  wildlife: [
    '濒危动物', 'endangered animals', '熊猫', 'panda',
    '老虎', 'tiger', '犀牛', 'rhinoceros', '大象', 'elephant',
    '象牙', 'ivory', '犀牛角', 'rhino horn', '虎骨', 'tiger bone',
    '皮毛', 'fur', '骨骼', 'bones', '活体动物', 'live animals',
    '猴子', 'monkey', '蛇', 'snake', '蜥蜴', 'lizard',
    '野生动物', 'wildlife', '保护动物', 'protected animals'
  ],
  
  // 8. 非法服务类
  illegalServices: [
    '黑客服务', 'hacking services', '网络攻击', 'cyber attack',
    '网站入侵', 'website hacking', '数据窃取', 'data theft',
    '洗钱服务', 'money laundering', '资金转移', 'money transfer',
    '地下钱庄', 'underground bank', '虚拟货币', 'virtual currency',
    '代考服务', 'exam proxy', '论文代写', 'essay writing',
    '学术作弊', 'academic cheating', '非法服务', 'illegal services'
  ],
  
  // 9. 基础敏感词
  sensitive: [
    '暴力', 'violence', '违法', 'illegal', '犯罪', 'crime',
    '恐怖', 'terrorism', '极端', 'extremist', '仇恨', 'hate'
  ]
};

// 中文隐晦表达检测
const HIDDEN_EXPRESSIONS = {
  // 同音字替换
  homophones: {
    '香咽': '香烟',
    '堵博': '赌博',
    '爆力': '暴力',
    '色情': '色情',
    '毒平': '毒品',
    '违发': '违法',
    '犯嘴': '犯罪',
    '烟具': '烟具',
    '烟丝': '烟丝',
    '烟斗': '烟斗',
    '烟盒': '烟盒',
    '烟灰缸': '烟灰缸',
    '打火机': '打火机',
    '火柴': '火柴',
    '尼古丁': '尼古丁',
    '电子烟': '电子烟',
    'vape': '电子烟',
    '雪茄': '雪茄',
    'cigar': '雪茄',
    'tobacco': '烟草',
    'cigarette': '香烟'
  },
  
  // 拼音替换
  pinyin: {
    'yan': '烟',
    'du': '赌',
    'bao': '暴',
    'se': '色',
    'du': '毒',
    'wei': '违',
    'fan': '犯',
    'cigarette': '香烟',
    'tobacco': '烟草',
    'vape': '电子烟',
    'cigar': '雪茄',
    'nicotine': '尼古丁',
    'gambling': '赌博',
    'violence': '暴力',
    'porn': '色情',
    'drugs': '毒品',
    'illegal': '违法',
    'crime': '犯罪'
  },
  
  // 符号插入
  symbols: ['@', '#', '$', '%', '&', '*', '+', '=', '|', '\\', '/', '~', '^', '`'],
  
  // 数字替换字母
  leetspeak: {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '9': 'g'
  }
};

// 检测隐晦表达
function detectHiddenExpressions(text) {
  const textLower = text.toLowerCase();
  const detected = [];
  
  // 检测同音字替换
  for (const [hidden, original] of Object.entries(HIDDEN_EXPRESSIONS.homophones)) {
    if (textLower.includes(hidden.toLowerCase())) {
      detected.push(`${hidden} -> ${original}`);
    }
  }
  
  // 检测拼音替换
  for (const [pinyin, chinese] of Object.entries(HIDDEN_EXPRESSIONS.pinyin)) {
    if (textLower.includes(pinyin.toLowerCase())) {
      detected.push(`${pinyin} -> ${chinese}`);
    }
  }
  
  // 检测符号插入
  for (const symbol of HIDDEN_EXPRESSIONS.symbols) {
    // 转义特殊字符
    const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`[${escapedSymbol}][\\w\\u4e00-\\u9fa5]+|[\\w\\u4e00-\\u9fa5]+[${escapedSymbol}]`, 'gi');
    const matches = text.match(pattern);
    if (matches) {
      detected.push(`符号插入: ${matches.join(', ')}`);
    }
  }
  
  // 检测数字替换字母
  for (const [number, letter] of Object.entries(HIDDEN_EXPRESSIONS.leetspeak)) {
    const pattern = new RegExp(`[\\w]*${number}[\\w]*`, 'gi');
    const matches = text.match(pattern);
    if (matches) {
      detected.push(`数字替换: ${matches.join(', ')}`);
    }
  }
  
  return detected;
}

// 增强的本地审核函数
function enhancedLocalModeration(text) {
  const textLower = text.toLowerCase();
  const violations = [];
  
  // 检测各类违规内容
  for (const [category, keywords] of Object.entries(VIOLATION_KEYWORDS)) {
    const foundKeywords = keywords.filter(keyword => 
      textLower.includes(keyword.toLowerCase())
    );
    
    if (foundKeywords.length > 0) {
      violations.push({
        category: category,
        keywords: foundKeywords,
        count: foundKeywords.length
      });
    }
  }
  
  // 检测隐晦表达
  const hiddenExpressions = detectHiddenExpressions(text);
  
  return {
    violations,
    hiddenExpressions,
    hasViolations: violations.length > 0 || hiddenExpressions.length > 0
  };
}

async function moderateText(text) {
  // 第一步：增强的本地审核
  const localResult = enhancedLocalModeration(text);
  
  if (localResult.hasViolations) {
    let reason = '';
    
    if (localResult.violations.length > 0) {
      const violation = localResult.violations[0]; // 取第一个违规类型
      const categoryNames = {
        tobacco: '烟草产品',
        drugs: '违禁药物',
        weapons: '武器',
        gambling: '赌博设备',
        adult: '色情内容',
        counterfeit: '假冒伪劣',
        wildlife: '野生动物',
        illegalServices: '非法服务',
        sensitive: '敏感内容'
      };
      
      reason = `检测到${categoryNames[violation.category] || violation.category}：${violation.keywords.join(', ')}`;
    }
    
    if (localResult.hiddenExpressions.length > 0) {
      if (reason) reason += '；';
      reason += `检测到隐晦表达：${localResult.hiddenExpressions.join(', ')}`;
    }
    
    return { 
      ok: false, 
      reason: reason,
      source: '增强本地算法',
      violations: localResult.violations,
      hiddenExpressions: localResult.hiddenExpressions
    };
  }

  console.log('🤖 开始多级AI服务内容审核...');
  
  // 第二步：使用多级AI服务进行内容审核
  try {
    const result = await moderateContentWithAIServices(text);
    
    if (result.source === 'Local Algorithm') {
      // 使用增强的本地审核作为备用方案
      console.log('🔄 使用增强本地审核模式');
      const localResult = enhancedLocalModeration(text);
      
      if (localResult.hasViolations) {
        let reason = '';
        if (localResult.violations.length > 0) {
          const violation = localResult.violations[0];
          reason = `检测到违规内容：${violation.keywords.join(', ')}`;
        }
        if (localResult.hiddenExpressions.length > 0) {
          if (reason) reason += '；';
          reason += `检测到隐晦表达：${localResult.hiddenExpressions.join(', ')}`;
        }
        return { 
          ok: false, 
          reason: reason,
          source: '增强本地算法'
        };
      }
      
      return { ok: true, source: '增强本地算法' };
    }
    
    // 使用AI服务结果
    return {
      ok: result.isAppropriate,
      reason: result.reason,
      source: result.source
    };
    
  } catch (error) {
    console.error('多级AI服务审核异常:', error.message);
    // 降级到增强本地审核
    const localResult = enhancedLocalModeration(text);
    
    if (localResult.hasViolations) {
      let reason = '';
      if (localResult.violations.length > 0) {
        const violation = localResult.violations[0];
        reason = `检测到违规内容：${violation.keywords.join(', ')}`;
      }
      if (localResult.hiddenExpressions.length > 0) {
        if (reason) reason += '；';
        reason += `检测到隐晦表达：${localResult.hiddenExpressions.join(', ')}`;
      }
      return { 
        ok: false, 
        reason: reason,
        source: '增强本地算法'
      };
    }
    
    return { ok: true, source: '增强本地算法' };
  }
}

async function moderateImages(images) {
  // 用OpenAI vision/gpt-4o等API审核图片（这里只做简单实现，实际可上传图片base64并用gpt-4o分析）
  // 这里只审核第一张图片
  if (!images || images.length === 0) return { ok: true };
  
  // 如果没有OpenAI API密钥，跳过图片审核
  if (USE_LOCAL_MODERATION) {
    console.log('使用本地审核模式，跳过图片审核');
    return { ok: true };
  }
  
  try {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `你是一个内容安全审核员，请判断用户上传的图片是否包含以下违规内容：
1. 违法、暴力、色情、血腥、敏感或不适宜公开传播的内容
2. 烟草产品（包括但不限于：香烟、雪茄、烟斗、电子烟、烟具、打火机、烟盒等）
3. 任何与吸烟相关的物品或配件
4. 违禁药物、武器、赌博设备、假冒伪劣商品、野生动物制品等

如果发现违规内容，请回答"违规：[具体原因]"
合规内容请回答"通过"

只需回答审核结果，不要添加其他解释。`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: '请审核这张图片内容是否合规。' },
              { type: 'image_url', image_url: { url: images[0] } }
            ]
          }
        ],
        max_tokens: 100
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );
    const reply = res.data.choices[0].message.content;
    if (reply.includes('违规')) {
      return { ok: false, reason: reply };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: 'OpenAI图片审核接口异常' };
  }
}

module.exports = { 
  moderateText, 
  moderateImages, 
  enhancedLocalModeration,
  VIOLATION_KEYWORDS,
  HIDDEN_EXPRESSIONS
};
