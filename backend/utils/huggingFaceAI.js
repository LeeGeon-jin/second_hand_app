const axios = require('axios');

// Hugging Face Inference API配置
const HF_API_URL = 'https://api-inference.huggingface.co/models';
const HF_MODEL = 'distilgpt2'; // 使用更轻量级的模型

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
  // 价格范围计算（±30%）
  const min = Math.max(5, Math.round(estimatedPrice * 0.7));
  const max = Math.round(estimatedPrice * 1.3);

  // 类别特定范围限制（澳元价格）
  const categoryRanges = {
    '家具': { min: 20, max: 500 },
    '电器': { min: 30, max: 800 },
    '电子产品': { min: 50, max: 3000 },
    '文具': { min: 5, max: 100 },
    '服饰': { min: 10, max: 500 },
    '服装鞋帽': { min: 10, max: 500 },
    '运动': { min: 15, max: 300 },
    '母婴': { min: 10, max: 200 },
    '美妆': { min: 5, max: 100 },
    '乐器': { min: 30, max: 1000 },
    '图书': { min: 5, max: 50 },
    '宠物': { min: 10, max: 200 },
    '家居用品': { min: 20, max: 1000 },
    '其他': { min: 5, max: 500 }
  };

  const range = categoryRanges[category] || { min: 5, max: 300 };
  return {
    min: Math.max(range.min, min),
    max: Math.min(range.max, max)
  };
}

// AI估价函数（优先使用Hugging Face，备用本地算法）
async function estimatePriceWithHF(title, category, description, images) {
  try {
    // 检查必要参数
    if (!title || !category) {
      return {
        success: false,
        message: '请提供商品标题和类别'
      };
    }

    // 检查描述长度
    if (!description || description.length < 20) {
      return {
        success: false,
        message: '描述不能少于20个字'
      };
    }

    // 检查图片
    if (!images || images.length === 0) {
      return {
        success: false,
        message: '请上传至少一张商品图片'
      };
    }

    // 构建AI提示词
    const prompt = `作为澳洲二手商品估价专家，请分析以下商品：

商品标题：${title}
商品类别：${category}
商品描述：${description}

请基于澳洲二手市场价格，提供估价建议。所有价格必须以澳元(AUD)为单位。

请返回JSON格式：
{
  "estimatedPrice": 数字,
  "priceRange": {"min": 数字, "max": 数字},
  "suggestions": ["建议1", "建议2", "建议3"],
  "reasoning": "估价理由"
}

注意：价格单位为澳元(AUD)，估价要符合澳洲市场实际情况。`;

    // 尝试使用Hugging Face API
    const hfToken = process.env.HUGGING_FACE_TOKEN;
    
    if (hfToken) {
      try {
        console.log('🤖 尝试使用Hugging Face AI...');
        const response = await axios.post(
          `${HF_API_URL}/${HF_MODEL}`,
          { inputs: prompt },
          {
            headers: {
              'Authorization': `Bearer ${hfToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );

        // 解析AI响应
        const aiResponse = response.data[0]?.generated_text || '';
        console.log('AI响应:', aiResponse);
        
        // 尝试提取JSON
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const result = JSON.parse(jsonMatch[0]);
            if (result.estimatedPrice) {
              return {
                success: true,
                estimatedPrice: result.estimatedPrice,
                priceRange: result.priceRange || { min: result.estimatedPrice * 0.8, max: result.estimatedPrice * 1.2 },
                suggestions: result.suggestions || ['基于AI分析的个性化建议'],
                reasoning: result.reasoning || '基于AI深度分析的估价建议',
                source: 'Hugging Face AI'
              };
            }
          } catch (parseError) {
            console.log('AI响应解析失败，使用本地估价');
          }
        }
      } catch (hfError) {
        console.log('Hugging Face API调用失败，使用本地估价:', hfError.message);
      }
    }

    // 使用本地智能估价算法作为备用方案
    console.log('🔄 使用本地智能算法...');
    const estimatedPrice = getLocalEstimate(title, category);
    const priceRange = getLocalPriceRange(category, estimatedPrice);
    
    // 智能分析商品特征
    let reasoning = `基于${category}类别的市场行情`;
    let suggestions = [
      '建议在类似商品中比较价格',
      '考虑商品成色对价格的影响',
      '关注市场供需情况'
    ];

    // 品牌识别
    const brandKeywords = ['iPhone', 'Samsung', 'MacBook', 'iPad', 'Nike', 'Adidas'];
    for (const brand of brandKeywords) {
      if (title.toLowerCase().includes(brand.toLowerCase())) {
        reasoning += `，识别到品牌${brand}`;
        suggestions.push(`品牌${brand}通常有较高的保值率`);
        break;
      }
    }

    // 成色识别
    const conditionKeywords = ['全新', '九成新', '八成新', '七成新'];
    for (const condition of conditionKeywords) {
      if (title.includes(condition)) {
        reasoning += `，商品成色${condition}`;
        suggestions.push(`成色${condition}的商品价格相对稳定`);
        break;
      }
    }

    // 特殊商品分析
    if (category === '其他') {
      if (title.includes('画') || title.includes('艺术品')) {
        reasoning += '，艺术品具有收藏价值';
        suggestions.push('艺术品价格波动较大，建议参考专业评估');
      } else if (title.includes('收藏') || title.includes('限量')) {
        reasoning += '，限量版商品具有稀缺性';
        suggestions.push('限量版商品可能高于市场预期');
      }
    }

    // 根据描述长度调整建议
    if (description.length > 50) {
      suggestions.push('详细描述有助于买家了解商品，建议保持');
    }

    return {
      success: true,
      estimatedPrice,
      priceRange,
      suggestions,
      reasoning,
      source: '本地智能算法'
    };

  } catch (error) {
    console.error('AI估价错误:', error);
    return {
      success: false,
      message: '估价服务暂时不可用，请稍后重试'
    };
  }
}

module.exports = {
  estimatePriceWithHF
};
