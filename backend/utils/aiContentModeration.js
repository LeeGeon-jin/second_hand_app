// 使用OpenAI API进行内容审核
const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function moderateText(text) {
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
    return { ok: false, reason: 'OpenAI审核接口异常' };
  }
}

async function moderateImages(images) {
  // 用OpenAI vision/gpt-4o等API审核图片（这里只做简单实现，实际可上传图片base64并用gpt-4o分析）
  // 这里只审核第一张图片
  if (!images || images.length === 0) return { ok: true };
  try {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '你是一个内容安全审核员，请判断用户上传的图片是否包含违法、暴力、色情、血腥、敏感或不适宜公开传播的内容。只需回答“通过”或“违规”，并简要说明原因。'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: '请审核这张图片内容是否合规。' },
              { type: 'image_url', image_url: { url: images[0] } }
            ]
          }
        ],
        max_tokens: 50
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
