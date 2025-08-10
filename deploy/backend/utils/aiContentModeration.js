// 使用OpenAI API进行内容审核
const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-demo-key';

// 如果没有设置OpenAI API密钥，使用本地审核
const USE_LOCAL_MODERATION = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-demo-key';

async function moderateText(text) {
  // 首先检查是否包含烟草产品相关内容
  const tobaccoKeywords = [
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
  ];
  
  const textLower = text.toLowerCase();
  const foundTobaccoKeywords = tobaccoKeywords.filter(keyword => 
    textLower.includes(keyword.toLowerCase())
  );
  
  if (foundTobaccoKeywords.length > 0) {
    return { 
      ok: false, 
      reason: `禁止销售烟草产品：检测到相关关键词 [${foundTobaccoKeywords.join(', ')}]` 
    };
  }

  // 如果没有OpenAI API密钥，使用本地审核
  if (USE_LOCAL_MODERATION) {
    console.log('使用本地审核模式');
    // 简单的本地关键词审核
    const sensitiveKeywords = [
      '暴力', '色情', '赌博', '毒品', '违法', '犯罪',
      'violence', 'porn', 'gambling', 'drugs', 'illegal', 'crime'
    ];
    
    const textLower = text.toLowerCase();
    const foundSensitiveKeywords = sensitiveKeywords.filter(keyword => 
      textLower.includes(keyword.toLowerCase())
    );
    
    if (foundSensitiveKeywords.length > 0) {
      return { 
        ok: false, 
        reason: `检测到敏感内容：${foundSensitiveKeywords.join(', ')}` 
      };
    }
    
    return { ok: true };
  }

  // OpenAI Moderation API
  try {
    const res = await axios.post(
      'https://api.openai.com/v1/moderations',
      { input: text },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );
    const result = res.data.results[0];
    if (result.flagged) {
      // 找出被flag的类别
      const reasons = Object.entries(result.categories)
        .filter(([k, v]) => v)
        .map(([k]) => k)
        .join(', ');
      return { ok: false, reason: `文本被OpenAI审核为敏感：${reasons}` };
    }
    return { ok: true };
  } catch (e) {
    console.error('OpenAI审核接口异常:', e.message);
    return { ok: false, reason: 'OpenAI审核接口异常' };
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

如果发现烟草产品相关内容，请回答"违规：禁止销售烟草产品"
其他违规内容请回答"违规：[具体原因]"
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

module.exports = { moderateText, moderateImages };
