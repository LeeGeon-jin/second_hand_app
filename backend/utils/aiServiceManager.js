const axios = require('axios');

// AI服务配置
const AI_SERVICES = {
  HUGGING_FACE: {
    name: 'Hugging Face',
    apiKey: process.env.HUGGING_FACE_TOKEN,
    baseURL: 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
    model: 'facebook/bart-large-mnli',
    isAvailable: () => !!process.env.HUGGING_FACE_TOKEN,
         call: async (text, task = 'valuation') => {
       try {
         // 根据任务类型选择不同的标签
         let candidateLabels;
         if (task === 'moderation') {
           candidateLabels = ['appropriate content', 'inappropriate content', 'sensitive content'];
         } else {
           candidateLabels = ['high value product', 'mid value product', 'low value product'];
         }
         
         const response = await axios.post(
           'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
           {
             inputs: text,
             parameters: {
               candidate_labels: candidateLabels
             }
           },
           {
             headers: {
               'Authorization': `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
               'Content-Type': 'application/json'
             },
             timeout: 10000
           }
         );
         return {
           success: true,
           data: response.data,
           service: 'Hugging Face'
         };
       } catch (error) {
         return {
           success: false,
           error: error.message,
           service: 'Hugging Face'
         };
       }
     }
  },
  
  OPENROUTER: {
    name: 'OpenRouter',
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'openai/gpt-3.5-turbo',
    isAvailable: () => !!process.env.OPENROUTER_API_KEY,
    call: async (text) => {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openai/gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: '你是一个专业的二手商品价格评估专家。请分析以下商品信息并返回JSON格式的价格评估结果。'
              },
              {
                role: 'user',
                content: `请分析这个商品的价格：${text}`
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
  },
  
  COHERE: {
    name: 'Cohere',
    apiKey: process.env.COHERE_API_KEY,
    baseURL: 'https://api.cohere.ai/v1',
    model: 'command',
    isAvailable: () => !!process.env.COHERE_API_KEY,
    call: async (text) => {
      try {
        const response = await axios.post(
          'https://api.cohere.ai/v1/generate',
          {
            model: 'command',
            prompt: `分析这个二手商品的价格：${text}`,
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
    call: async (text) => {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: '你是一个专业的二手商品价格评估专家。请分析以下商品信息并返回JSON格式的价格评估结果。'
              },
              {
                role: 'user',
                content: `请分析这个商品的价格：${text}`
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
const SERVICE_ORDER = ['HUGGING_FACE', 'OPENROUTER', 'COHERE', 'OPENAI'];

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
  const { getLocalEstimate } = require('./huggingFaceAI');
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
             case 'Hugging Face':
         if (aiResult.data && aiResult.data.labels && aiResult.data.scores) {
           console.log(`🔍 Hugging Face 响应:`, aiResult.data);
           const topScore = Math.max(...aiResult.data.scores);
           const topLabel = aiResult.data.labels[aiResult.data.scores.indexOf(topScore)];
           
           console.log(`🔍 最高分数: ${topScore}, 标签: ${topLabel}`);
           
           if (topScore > 0.3) { // 降低阈值到0.3，提高AI使用率
             aiAnalysis = {
               service: 'Hugging Face',
               confidence: topScore,
               suggestion: `AI分析：${topLabel} (置信度: ${(topScore * 100).toFixed(1)}%)`,
               adjustment: topLabel.includes('high value') ? 0.2 : 
                          topLabel.includes('low value') ? -0.2 : 0
             };
             console.log(`✅ Hugging Face 分析成功: ${topLabel}, 调整${(aiAnalysis.adjustment * 100).toFixed(1)}%`);
           } else {
             console.log(`⚠️ Hugging Face 置信度太低: ${topScore}`);
           }
         } else {
           console.log(`⚠️ Hugging Face 响应格式异常:`, aiResult.data);
         }
         break;
        
             case 'OpenRouter':
       case 'OpenAI':
         if (aiResult.data && aiResult.data.choices && aiResult.data.choices[0]) {
           const content = aiResult.data.choices[0].message.content;
           console.log(`🔍 AI响应内容: ${content}`);
           try {
             const jsonMatch = content.match(/\{.*\}/);
             if (jsonMatch) {
               const parsed = JSON.parse(jsonMatch[0]);
               console.log(`🔍 解析的JSON:`, parsed);
               const aiPrice = parsed.price || parsed.estimatedPrice || 0;
               if (aiPrice > 0) {
                 const priceRatio = aiPrice / localPrice;
                 const adjustment = Math.max(-0.5, Math.min(1.0, priceRatio - 1));
                 
                 aiAnalysis = {
                   service: aiResult.service,
                   confidence: parsed.confidence || 0.7,
                   suggestion: `AI建议价格: $${aiPrice} AUD`,
                   adjustment: adjustment
                 };
                 console.log(`✅ AI分析成功: 价格$${aiPrice}, 调整${(adjustment * 100).toFixed(1)}%`);
               } else {
                 console.log(`⚠️ AI价格无效: ${aiPrice}`);
               }
             } else {
               console.log(`⚠️ 未找到JSON格式响应`);
             }
           } catch (e) {
             console.log('解析AI响应JSON失败:', e.message);
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
    '暴力', '色情', '赌博', '毒品', '违法', '犯罪',
    'violence', 'porn', 'gambling', 'drugs', 'illegal', 'crime'
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
    case 'Hugging Face':
      if (aiResult.data && aiResult.data.labels && aiResult.data.scores) {
        console.log(`🔍 Hugging Face 审核响应:`, aiResult.data);
        const topScore = Math.max(...aiResult.data.scores);
        const topLabel = aiResult.data.labels[aiResult.data.scores.indexOf(topScore)];
        
        console.log(`🔍 最高分数: ${topScore}, 标签: ${topLabel}`);
        
        // 调整置信度阈值：从0.4降低到0.3，提高AI使用率
        if (topScore > 0.3) {
          // 对于内容审核，我们使用不同的标签
          const inappropriateLabels = ['inappropriate content', 'violation', 'sensitive content'];
          const isInappropriate = inappropriateLabels.some(label => 
            topLabel.toLowerCase().includes(label.toLowerCase())
          );
          
          if (isInappropriate) {
            isAppropriate = false;
            reason = `AI深度分析: ${topLabel} (置信度: ${(topScore * 100).toFixed(1)}%)`;
          }
          aiService = 'Hugging Face';
          console.log(`✅ Hugging Face 审核成功: ${topLabel}, 结果: ${isAppropriate ? '通过' : '拒绝'}`);
        } else {
          console.log(`⚠️ Hugging Face 置信度太低: ${topScore}，使用本地算法`);
        }
      }
      break;
      
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
