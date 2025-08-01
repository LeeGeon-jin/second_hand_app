// 图形验证码服务
const svgCaptcha = require('svg-captcha');

class CaptchaService {
  constructor() {
    // 验证码缓存，实际生产环境应该使用Redis
    this.captchas = new Map();
  }

  generate() {
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 2,
      color: true,
      background: '#f0f0f0'
    });
    
    const captchaId = Math.random().toString(36).substr(2, 9);
    
    // 保存验证码，5分钟有效
    this.captchas.set(captchaId, {
      text: captcha.text.toLowerCase(),
      expireAt: Date.now() + 5 * 60 * 1000
    });
    
    return {
      id: captchaId,
      svg: captcha.data
    };
  }

  verify(captchaId, userInput) {
    const data = this.captchas.get(captchaId);
    if (!data) {
      return false;
    }
    
    if (Date.now() > data.expireAt) {
      this.captchas.delete(captchaId);
      return false;
    }
    
    if (data.text !== userInput.toLowerCase()) {
      return false;
    }
    
    // 验证成功后删除验证码
    this.captchas.delete(captchaId);
    return true;
  }
}

module.exports = new CaptchaService();
