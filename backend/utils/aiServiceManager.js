const axios = require('axios');

// AI服务配置
const AI_SERVICES = {
  OPENROUTER: {
    name: 'OpenRouter',
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'openai/gpt-3.5-turbo',
    isAvailable: () => !!process.env.OPENROUTER_API_KEY,
    call: async (text, task = 'valuation') => {
      if (task === 'moderation') {
        // 内容审核任务
        try {
          const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'openai/gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: '你是一个专业的内容审核专家。请分析以下商品描述是否适合在二手交易平台上销售。如果不适合，请说明原因。'
                },
                {
                  role: 'user',
                  content: `请审核这个商品描述是否适合销售：${text}`
                }
              ],
              max_tokens: 300,
              temperature: 0.3
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://secondhand-app.com',
                'X-Title': 'Second Hand App'
              },
              timeout: 15000
            }
          );
          return {
            success: true,
            data: response.data,
            service: 'OpenRouter'
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            service: 'OpenRouter'
          };
        }
      } else {
        // 价格评估任务
        // 首先搜索eBay获取真实市场价格
        let marketPriceInfo = '';
        try {
          const ebayResponse = await axios.get(
            'https://api.ebay.com/buy/browse/v1/item_summary/search',
            {
              params: {
                q: text.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim(),
                limit: 10
              },
              headers: {
                'Authorization': 'Bearer v^1.1#i^1#r^0#I^3#f^0#p^1#t^H4sIAAAAAAAA/+VYbWwURRju9UtqLfzQaIMYyhYjFG9vdrd71116B9fWltN+0SulYCvO7s7Btvvlzh7tGcWzRiT8EAOJCSRiCSIJKFoDYoIfwUj8RQqoUcBEIZEUIwSMioEozl5LaSuhSM/YxPuzt++8887zPPO+M7MDkrl5JWsXrb1U4LkjszcJkpkeD5MP8nJz5k3NypyekwFGOHh6k7OT2T1ZA+UY6polNiFsmQZGRd26ZmAxZQxScdsQTYhVLBpQR1h0ZDEarqsVWRqIlm06pmxqVFGkKkgJAQHxMYEHfpaVZEEmVuNazGYzSCFGEhAMyAFO8JdyikDaMY6jiIEdaDhBigUs7wVlXpZpZjmR84sMoIGfX04VtSAbq6ZBXGhAhVJwxVRfewTWm0OFGCPbIUGoUCRcHW0IR6oeqW8u942IFRrSIepAJ45Hv1WaCipqgVoc3XwYnPIWo3FZRhhTvtDgCKODiuFrYG4DfkpqXuIENgCBLMmAL+NjaZGy2rR16Nwch2tRFW8s5Soiw1GdxHiKEjWkDiQ7Q2/1JESkqsh9LI5DTY2pyA5Sj1SEl4UbG6nQYhUa8ipkeMMRtJoIDr2NTVVeP2RkrhRJAvkHFBlI7NBAg9GGZB4zUqVpKKorGi6qN50KRFCjsdqwI7QhTg1Ggx2OOS6iYT+2GTDXNOQDy91JHZzFuLPKcOcV6USIotTr+DMw3NtxbFWKO2g4wtiGlERBClqWqlBjG1O5OJQ+3ThIrXIcS/T5urq66C6ONu2VPhYAxtdaVxslauqQIr5urQ/6q+N38KopKjIiPbEqOgmLYOkmuUoAGCupEM8FSgVmSPfRsEJjrX8zjODsG10R6aoQFkFWYpDAKmwAIYlJR4WEhpLU5+JAEkx4dWh3IsfSoIy8MsmzuI5sVRE5PsZyZTHkVfxCzFsqxGJeiVf8XiaGECBoyOpY9n8qlFtN9SiSbeSkJdfTluePVjQ149KGpTozz6lp6WxQElx1Q211XQdoxdFuQQm02uaS7sjqTj0cvNVquCH5Sk0lyjST8dMhgFvr6RNhkYkdpEyIXlQ2LdRoaqqcmFwTzNlKI7SdRBRpGjFMiGTYsiLpWavTRu8fLhO3xzt9e9R/tD/dkBV2U3ZysXL7YxIAWirt7kC0bOo+t9ZNSI4frnlFCvWEeKvk5DqpWBOSg2xVZfDISafo0ni1TNsIm3GbnLbpBvcE1mx2IoPsZ45tahqyWyaWAW4963rcgZKGJlthpyHBVTjJNlsmwPNljMAFwIR4yamtdMVkW5LSsRRn93hmjcu/CUFNn1zcLdtU4rJ7xvwXPhl8oy8wQhmpH9Pj+RT0eD7O9HhAOXiQKQazcrOWZGfdNR2rDqJVGKOxutIg3+U2ojtRwoKqnXl3Rv/UWuX5RbW/JqX4/qW/LCjLKBhxf9LbDgqHb1Dyspj8EdcpYMb1lhxm2n0FLA/KWIblOD8DloPi663ZzL3Z93w4veRq645aKWfKmXD52Y6208nCelAw7OTx5GSQyc6YfbRCPy4XP3uJ3zr7+OHNfVPa5jw5Vzx0vvfUEw+d9fa/cqHysUTNRyd2OtPeeqNpDt7xQutzR/KE/s0bIk3+q6+3P/3Vw+V9R7jz1qa2gft3x9YfO6fPP9a3fWP2loU/fN/+1NcDfd/1Lux8xndgzdaLn2S9+oFQvGb7m13BnSXvJDwHzzXtmb/h9/xlpzeGtRpOPXPuwrbLM1cc3dXimVt36IuTU9trM68efjHfXrZh24/7d4a3bXoJ/jQ/sP7bdRnvh/2NZy7NvHBw0/HPIj/v/m1BYTbsX9exb2DWxXdzzb73+k4+vu9E/h6q5NTn568s/ObOB3bVzUh++Wdb4R8HttBvD+y90r63b+5rl2uOvjw4l38BmbHpdtkSAAA=',
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
          );
          
          if (ebayResponse.data && ebayResponse.data.itemSummaries) {
            const prices = ebayResponse.data.itemSummaries
              .filter(item => item.price && item.price.value)
              .map(item => parseFloat(item.price.value))
              .filter(price => price > 0);
            
            if (prices.length > 0) {
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
              
              // 转换为澳元（大约1 USD = 1.5 AUD）
              const minAUD = Math.round(minPrice * 1.5);
              const maxAUD = Math.round(maxPrice * 1.5);
              const avgAUD = Math.round(avgPrice * 1.5);
              
              marketPriceInfo = `根据eBay实时搜索，${text}的市场价格范围：$${minAUD}-$${maxAUD} AUD（平均$${avgAUD} AUD）。`;
              console.log(`📊 eBay市场价格: $${minAUD}-$${maxAUD} AUD (平均$${avgAUD} AUD)`);
            }
          }
        } catch (ebayError) {
          console.log('⚠️ eBay搜索失败:', ebayError.message);
          marketPriceInfo = '无法获取实时市场价格，使用默认参考价格。';
        }
        try {
          const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'openai/gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: '你是一个专业的二手商品价格评估专家。请分析以下商品信息并返回JSON格式的价格评估结果。重要：所有价格必须以澳元(AUD)为单位，不要使用美元或其他货币。'
                },
                {
                  role: 'user',
                  content: `${marketPriceInfo}请基于以上实时市场价格信息，分析这个商品的价格（请使用澳元AUD）：${text}`
                }
              ],
              max_tokens: 500,
              temperature: 0.3
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://secondhand-app.com',
                'X-Title': 'Second Hand App'
              },
              timeout: 15000
            }
          );
          return {
            success: true,
            data: response.data,
            service: 'OpenRouter'
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            service: 'OpenRouter'
          };
        }
      }
    }
  },
  
  COHERE: {
    name: 'Cohere',
    apiKey: process.env.COHERE_API_KEY,
    baseURL: 'https://api.cohere.ai/v1',
    model: 'command',
    isAvailable: () => !!process.env.COHERE_API_KEY,
    call: async (text, task = 'valuation') => {
      try {
        let prompt;
        if (task === 'moderation') {
          prompt = `请审核这个商品描述是否适合在二手交易平台上销售：${text}`;
        } else {
          prompt = `分析这个二手商品的价格（请使用澳元AUD，不要使用美元）：${text}`;
        }
        
        const response = await axios.post(
          'https://api.cohere.ai/v1/generate',
          {
            model: 'command',
            prompt: prompt,
            max_tokens: 300,
            temperature: 0.3,
            k: 0,
            stop_sequences: [],
            return_likelihoods: 'NONE'
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );
        return {
          success: true,
          data: response.data,
          service: 'Cohere'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          service: 'Cohere'
        };
      }
    }
  },
  
  OPENAI: {
    name: 'OpenAI',
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    isAvailable: () => !!process.env.OPENAI_API_KEY,
    call: async (text, task = 'valuation') => {
      try {
        let systemContent, userContent;
        if (task === 'moderation') {
          systemContent = '你是一个专业的内容审核专家。请分析以下商品描述是否适合在二手交易平台上销售。如果不适合，请说明原因。';
          userContent = `请审核这个商品描述是否适合销售：${text}`;
        } else {
          systemContent = '你是一个专业的二手商品价格评估专家。请分析以下商品信息并返回JSON格式的价格评估结果。重要：所有价格必须以澳元(AUD)为单位，不要使用美元或其他货币。';
          userContent = `请分析这个商品的价格（请使用澳元AUD）：${text}`;
        }
        
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: systemContent
              },
              {
                role: 'user',
                content: userContent
              }
            ],
            max_tokens: 500,
            temperature: 0.3
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );
        return {
          success: true,
          data: response.data,
          service: 'OpenAI'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          service: 'OpenAI'
        };
      }
    }
  }
};

// 服务调用顺序
const SERVICE_ORDER = ['OPENROUTER', 'COHERE', 'OPENAI'];

/**
 * 多级AI服务调用器
 * @param {string} text - 要分析的文本
 * @param {string} task - 任务类型 ('valuation' | 'moderation')
 * @returns {Promise<Object>} AI分析结果
 */
async function callAIService(text, task = 'valuation') {
  console.log(`🤖 开始多级AI服务调用 (任务: ${task})...`);
  
  // 尝试每个AI服务
  for (const serviceKey of SERVICE_ORDER) {
    const service = AI_SERVICES[serviceKey];
    
    if (!service.isAvailable()) {
      console.log(`⚠️  ${service.name} 不可用，跳过`);
      continue;
    }
    
    console.log(`🔄 尝试使用 ${service.name}...`);
    
    try {
      const result = await service.call(text, task);
      
      if (result.success) {
        console.log(`✅ ${service.name} 调用成功`);
        return {
          ...result,
          fallbackUsed: false
        };
      } else {
        console.log(`❌ ${service.name} 调用失败: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${service.name} 调用异常: ${error.message}`);
    }
  }
  
  // 所有AI服务都失败，返回本地算法标识
  console.log(`🔄 所有AI服务失败，将使用本地算法基础价格`);
  return {
    success: true,
    data: null,
    service: 'Local Only',
    fallbackUsed: true
  };
}

/**
 * 价格评估专用调用器（智能融合架构）
 * @param {string} title - 商品标题
 * @param {string} description - 商品描述
 * @param {string} category - 商品类别
 * @returns {Promise<Object>} 价格评估结果
 */
async function estimatePriceWithAIServices(title, description, category) {
  // 第一步：本地算法提供基础价格计算和规则引擎
  const { getLocalEstimate } = require('./priceEstimation');
  const localPrice = getLocalEstimate(title, category);
  
  console.log(`💰 本地算法基础价格: $${localPrice} AUD`);
  
  // 第二步：在线AI服务提供智能分析和价格建议
  const text = `${title} ${description} ${category}`;
  const aiResult = await callAIService(text, 'valuation');
  
  let aiAnalysis = {
    service: 'Local Only',
    confidence: 0.5,
    suggestion: '使用本地算法基础价格',
    adjustment: 0
  };
  
  if (!aiResult.fallbackUsed) {
    // AI服务成功，解析智能分析结果
    switch (aiResult.service) {
      case 'OpenRouter':
      case 'OpenAI':
        if (aiResult.data && aiResult.data.choices && aiResult.data.choices[0]) {
          const content = aiResult.data.choices[0].message.content;
          console.log(`🔍 AI响应内容: ${content}`);
          try {
            // 尝试多种方式解析价格
            let aiPrice = 0;
            
            // 方法1：尝试解析JSON
            const jsonMatch = content.match(/\{.*\}/);
            if (jsonMatch) {
              try {
                const parsed = JSON.parse(jsonMatch[0]);
                console.log(`🔍 解析的JSON:`, parsed);
                aiPrice = parsed.price || parsed.estimatedPrice || parsed.预估价格 || 0;
              } catch (jsonError) {
                console.log('JSON解析失败，尝试其他方法');
              }
            }
            
                         // 方法2：从中文响应中提取价格
             if (!aiPrice) {
               const priceMatch = content.match(/预估价格[：:]\s*\$?(\d+)/);
               if (priceMatch) {
                 aiPrice = parseInt(priceMatch[1]);
               }
             }
             
             // 方法2.5：从中文响应中提取澳元价格
             if (!aiPrice) {
               const audMatch = content.match(/(\d+)\s*澳元/);
               if (audMatch) {
                 aiPrice = parseInt(audMatch[1]);
               }
             }
            
            // 方法3：提取任何美元价格
            if (!aiPrice) {
              const dollarMatch = content.match(/\$(\d+)/);
              if (dollarMatch) {
                aiPrice = parseInt(dollarMatch[1]);
              }
            }
            
            // 方法4：提取数字价格
            if (!aiPrice) {
              const numberMatch = content.match(/(\d+)\s*-\s*(\d+)/);
              if (numberMatch) {
                // 取平均值
                aiPrice = Math.round((parseInt(numberMatch[1]) + parseInt(numberMatch[2])) / 2);
              }
            }
            
            if (aiPrice > 0) {
              const priceRatio = aiPrice / localPrice;
              const adjustment = Math.max(-0.5, Math.min(1.0, priceRatio - 1));
              
              aiAnalysis = {
                service: aiResult.service,
                confidence: 0.7,
                suggestion: `AI建议价格: $${aiPrice} AUD`,
                adjustment: adjustment
              };
              console.log(`✅ AI分析成功: 价格$${aiPrice}, 调整${(adjustment * 100).toFixed(1)}%`);
            } else {
              console.log(`⚠️ 无法从AI响应中提取有效价格`);
            }
          } catch (e) {
            console.log('解析AI响应失败:', e.message);
          }
        } else {
          console.log(`⚠️ AI响应格式异常:`, aiResult.data);
        }
        break;
        
      case 'Cohere':
        if (aiResult.data && aiResult.data.generations && aiResult.data.generations[0]) {
          const text = aiResult.data.generations[0].text;
          const priceMatch = text.match(/\$?(\d+)/);
          if (priceMatch) {
            const aiPrice = parseInt(priceMatch[1]);
            if (aiPrice > 0) {
              const priceRatio = aiPrice / localPrice;
              const adjustment = Math.max(-0.5, Math.min(1.0, priceRatio - 1));
              
              aiAnalysis = {
                service: 'Cohere',
                confidence: 0.6,
                suggestion: `AI建议价格: $${aiPrice} AUD`,
                adjustment: adjustment
              };
            }
          }
        }
        break;
    }
  }
  
  // 第三步：智能融合策略
  const fusionMultiplier = 1 + aiAnalysis.adjustment;
  const finalPrice = Math.round(localPrice * fusionMultiplier);
  
  console.log(`🤖 AI服务: ${aiAnalysis.service}`);
  console.log(`📊 AI建议: ${aiAnalysis.suggestion}`);
  console.log(`📈 调整幅度: ${(aiAnalysis.adjustment * 100).toFixed(1)}%`);
  console.log(`💰 最终价格: $${finalPrice} AUD`);
  
  return {
    estimatedPrice: finalPrice,
    source: `本地算法 + ${aiAnalysis.service}`,
    confidence: aiAnalysis.confidence,
    aiService: aiAnalysis.service,
    localPrice: localPrice,
    aiMultiplier: fusionMultiplier,
    aiAnalysis: aiAnalysis
  };
}

/**
 * 内容审核专用调用器（AI + 本地算法融合）
 * @param {string} text - 要审核的文本
 * @returns {Promise<Object>} 审核结果
 */
async function moderateContentWithAIServices(text) {
  // 首先进行本地关键词审核（直接调用本地函数，避免递归）
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
      isAppropriate: false,
      reason: `禁止销售烟草产品：检测到相关关键词 [${foundTobaccoKeywords.join(', ')}]`,
      source: '本地算法',
      localCheck: true
    };
  }

     // 本地敏感词检查
   const sensitiveKeywords = [
     // 暴力相关
     '暴力', '刀具', '锋利', '防身', '武器', '枪', '刀', '剑',
     'violence', 'knife', 'knives', 'weapon', 'gun', 'sword',
     
     // 色情相关
     '色情', '成人用品', '私密', '情趣', '性', 'porn', 'adult', 'sex',
     
     // 赌博相关
     '赌博', '老虎机', '赌场', '博彩', 'gambling', 'casino', 'slot machine',
     
     // 毒品相关
     '毒品', '违禁药品', '特殊渠道', 'drugs', 'illegal medicine',
     
     // 其他违法内容
     '违法', '犯罪', 'illegal', 'crime'
   ];
  
  const foundSensitiveKeywords = sensitiveKeywords.filter(keyword => 
    textLower.includes(keyword.toLowerCase())
  );
  
  if (foundSensitiveKeywords.length > 0) {
    return {
      isAppropriate: false,
      reason: `检测到敏感内容：${foundSensitiveKeywords.join(', ')}`,
      source: '本地算法',
      localCheck: true
    };
  }
  
  console.log(`🔍 本地审核结果: 通过`);
  
  // 本地审核通过，尝试AI服务进行深度分析
  const aiResult = await callAIService(text, 'moderation');
  
  if (aiResult.fallbackUsed) {
    // AI服务失败，使用本地审核结果
    return {
      isAppropriate: true,
      reason: '内容审核通过',
      source: '本地算法',
      localCheck: true
    };
  }
  
  // AI服务成功，解析结果并与本地结果融合
  let isAppropriate = true;
  let reason = '内容审核通过';
  let aiService = 'Local Only';
  
  switch (aiResult.service) {
    case 'OpenRouter':
    case 'OpenAI':
      if (aiResult.data && aiResult.data.choices && aiResult.data.choices[0]) {
        const content = aiResult.data.choices[0].message.content;
        const aiSaysInappropriate = content.toLowerCase().includes('inappropriate') || 
                                   content.toLowerCase().includes('violation') ||
                                   content.toLowerCase().includes('拒绝') ||
                                   content.toLowerCase().includes('违规');
        
        if (aiSaysInappropriate) {
          isAppropriate = false;
          reason = `AI深度分析: ${content}`;
        }
        aiService = aiResult.service;
      }
      break;
      
    case 'Cohere':
      if (aiResult.data && aiResult.data.generations && aiResult.data.generations[0]) {
        const text = aiResult.data.generations[0].text;
        const aiSaysInappropriate = text.toLowerCase().includes('inappropriate') || 
                                   text.toLowerCase().includes('violation') ||
                                   text.toLowerCase().includes('拒绝') ||
                                   text.toLowerCase().includes('违规');
        
        if (aiSaysInappropriate) {
          isAppropriate = false;
          reason = `AI深度分析: ${text}`;
        }
        aiService = 'Cohere';
      }
      break;
  }
  
  console.log(`🤖 AI服务: ${aiService}`);
  console.log(`✅ 最终审核结果: ${isAppropriate ? '通过' : '拒绝'}`);
  
  return {
    isAppropriate,
    reason,
    source: `本地算法 + ${aiService}`,
    localCheck: true,
    aiService: aiService
  };
}

module.exports = {
  callAIService,
  estimatePriceWithAIServices,
  moderateContentWithAIServices,
  AI_SERVICES
};
