const axios = require('axios');

// AI估价功能
async function estimatePrice(title, category, description, images) {
  try {
    // 检查描述长度
    if (!description || description.length < 20) {
      return {
        success: false,
        message: '描述不能少于20个字，请详细描述商品后重试',
        estimatedPrice: null,
        priceRange: null,
        suggestions: []
      };
    }

    // 构建提示词
    const prompt = `请根据以下商品信息进行估价分析：

商品标题：${title}
商品类别：${category}
商品描述：${description || '无描述'}
商品图片：${images && images.length > 0 ? '有图片' : '无图片'}

请以二手商品市场专家的身份，基于以下因素进行估价：
1. 商品类别和品牌
2. 商品成色（根据描述判断）
3. 市场供需情况
4. 类似商品的市场价格

请返回以下格式的JSON响应：
{
  "estimatedPrice": 数字,
  "priceRange": {"min": 数字, "max": 数字},
  "suggestions": ["建议1", "建议2", "建议3"],
  "reasoning": "估价理由"
}

注意：
- 价格单位为澳元
- 估价要合理，考虑二手商品的实际价值
- 建议要实用，帮助卖家定价`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的二手商品估价专家，熟悉澳洲和新西兰的二手市场。请提供准确、合理的估价建议。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    
    // 尝试解析JSON响应
    try {
      const result = JSON.parse(content);
      return {
        success: true,
        message: '估价完成',
        estimatedPrice: result.estimatedPrice,
        priceRange: result.priceRange,
        suggestions: result.suggestions || [],
        reasoning: result.reasoning || ''
      };
    } catch (parseError) {
      // 如果JSON解析失败，返回默认格式
      return {
        success: true,
        message: '估价完成',
        estimatedPrice: null,
        priceRange: null,
        suggestions: ['请根据市场行情合理定价', '建议查看同类商品价格', '考虑商品成色和品牌价值'],
        reasoning: content
      };
    }

  } catch (error) {
    console.error('AI估价错误:', error);
    
    // 如果没有OpenAI API key，使用本地估价逻辑
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-demo-key') {
      const estimatedPrice = getLocalEstimate(title, category);
      const priceRange = getLocalPriceRange(category, estimatedPrice);
      
      // 生成详细的估价理由
      let reasoning = `基于商品类别"${category}"的本地估价`;
      
      // 添加品牌识别说明
      const brandKeywords = ['iPhone', 'Samsung', 'MacBook', 'iPad', 'Nike', 'Adidas', 'Sony', 'Canon', 'Nikon'];
      for (const brand of brandKeywords) {
        if (title.toLowerCase().includes(brand.toLowerCase())) {
          reasoning += `，识别到品牌"${brand}"`;
          break;
        }
      }
      
      // 添加成色说明
      const conditionKeywords = ['全新', '九成新', '八成新', '七成新', '六成新', '五成新', '四成新', '三成新'];
      for (const condition of conditionKeywords) {
        if (title.includes(condition)) {
          reasoning += `，成色"${condition}"`;
          break;
        }
      }
      
      return {
        success: true,
        message: '使用本地估价模式',
        estimatedPrice: estimatedPrice,
        priceRange: priceRange,
        suggestions: [
          '建议查看同类商品的市场价格',
          '考虑商品的成色和品牌价值',
          '可以参考新品价格的30-70%作为参考',
          '艺术品和收藏品价格波动较大，建议参考专业市场'
        ],
        reasoning: reasoning
      };
    }
    
    return {
      success: false,
      message: '估价服务暂时不可用，请稍后重试',
      estimatedPrice: null,
      priceRange: null,
      suggestions: []
    };
  }
}

// 本地估价逻辑（备用方案）
function getLocalEstimate(title, category) {
  // 基础价格表（基于澳洲二手市场价格调研）
  const basePrices = {
    '家具': 50,
    '电器': 80,
    '电子': 120,
    '文具': 15,
    '服饰': 25,
    '运动': 40,
    '母婴': 35,
    '美妆': 20,
    '乐器': 100,
    '图书': 10,
    '宠物': 30,
    '其他': 30
  };
  
  // 根据标题关键词调整价格
  let price = basePrices[category] || 30;
  
  // 品牌识别和价格调整
  const brandKeywords = {
    'iPhone': { multiplier: 2.5, category: '电子' },
    'Samsung': { multiplier: 1.8, category: '电子' },
    'MacBook': { multiplier: 3.0, category: '电子' },
    'iPad': { multiplier: 2.0, category: '电子' },
    'Nike': { multiplier: 1.5, category: '运动' },
    'Adidas': { multiplier: 1.4, category: '运动' },
    'IKEA': { multiplier: 0.8, category: '家具' },
    'Sony': { multiplier: 1.6, category: '电子' },
    'Canon': { multiplier: 1.7, category: '电子' },
    'Nikon': { multiplier: 1.7, category: '电子' }
  };
  
  // 检查标题中的品牌关键词
  for (const [brand, config] of Object.entries(brandKeywords)) {
    if (title.toLowerCase().includes(brand.toLowerCase()) && category === config.category) {
      price = Math.round(price * config.multiplier);
      break;
    }
  }
  
  // 成色关键词调整
  const conditionKeywords = {
    '全新': 1.2,
    '九成新': 1.0,
    '八成新': 0.8,
    '七成新': 0.6,
    '六成新': 0.5,
    '五成新': 0.4,
    '四成新': 0.3,
    '三成新': 0.2
  };
  
  for (const [condition, multiplier] of Object.entries(conditionKeywords)) {
    if (title.includes(condition)) {
      price = Math.round(price * multiplier);
      break;
    }
  }
  
  // 特殊商品类型调整
  if (category === '其他') {
    if (title.includes('画') || title.includes('艺术品')) {
      price = 50; // 艺术品基础价格
    } else if (title.includes('收藏') || title.includes('限量')) {
      price = 80; // 收藏品基础价格
    }
  }
  
  return Math.max(5, price); // 最低5澳元
}

function getLocalPriceRange(category, estimatedPrice) {
  // 基于估计价格计算合理范围
  const baseRanges = {
    '家具': { min: 20, max: 200 },
    '电器': { min: 30, max: 300 },
    '电子': { min: 50, max: 500 },
    '文具': { min: 5, max: 50 },
    '服饰': { min: 10, max: 100 },
    '运动': { min: 15, max: 150 },
    '母婴': { min: 10, max: 120 },
    '美妆': { min: 5, max: 80 },
    '乐器': { min: 30, max: 300 },
    '图书': { min: 3, max: 30 },
    '宠物': { min: 10, max: 100 },
    '其他': { min: 10, max: 100 }
  };
  
  const range = baseRanges[category] || { min: 10, max: 100 };
  
  // 如果估计价格在范围内，以估计价格为中心计算范围
  if (estimatedPrice >= range.min && estimatedPrice <= range.max) {
    const margin = Math.round(estimatedPrice * 0.3); // 30%的浮动范围
    return {
      min: Math.max(range.min, estimatedPrice - margin),
      max: Math.min(range.max, estimatedPrice + margin)
    };
  }
  
  return range;
}

module.exports = { estimatePrice };
