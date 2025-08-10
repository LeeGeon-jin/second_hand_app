// 使用OpenAI API进行地址验证
const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function validateAddress(suburb, state) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `你是一个澳洲新西兰地理专家。请验证给定的suburb和州/领地组合是否在澳洲或新西兰真实存在。

请严格按照以下格式回复：
- 如果地址存在：返回 "VALID: [完整地址]"
- 如果地址不存在：返回 "INVALID: [原因]"
- 如果找到多个匹配：返回 "MULTIPLE: [建议列表，用逗号分隔]"

只回复验证结果，不要添加其他解释。`
          },
          {
            role: 'user',
            content: `请验证以下地址是否在澳洲或新西兰存在：
Suburb: ${suburb}
State/Territory: ${state}

请检查这个suburb是否在指定的州/领地中真实存在。`
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );

    const reply = response.data.choices[0].message.content.trim();
    
    if (reply.startsWith('VALID:')) {
      const address = reply.replace('VALID:', '').trim();
      return {
        isValid: true,
        message: `地址验证成功: ${address}`,
        suggestions: []
      };
    } else if (reply.startsWith('MULTIPLE:')) {
      const suggestions = reply.replace('MULTIPLE:', '').trim().split(',').map(s => s.trim());
      return {
        isValid: false,
        message: '找到多个匹配的地址，请选择其中一个：',
        suggestions
      };
    } else if (reply.startsWith('INVALID:')) {
      const reason = reply.replace('INVALID:', '').trim();
      return {
        isValid: false,
        message: `地址验证失败: ${reason}`,
        suggestions: []
      };
    } else {
      return {
        isValid: false,
        message: '地址验证失败，请检查输入',
        suggestions: []
      };
    }
  } catch (error) {
    console.error('AI地址验证错误:', error);
    return {
      isValid: false,
      message: 'AI验证服务暂时不可用，请稍后重试',
      suggestions: []
    };
  }
}

module.exports = { validateAddress };

