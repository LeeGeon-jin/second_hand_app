// 短信服务
const axios = require('axios');

class SmsService {
  constructor() {
    // 验证码缓存，实际生产环境应该使用Redis
    this.verificationCodes = new Map();
  }

  async sendVerificationCode(phone) {
    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      // TODO: 集成实际的短信服务商API
      // 这里模拟发送成功
      console.log(`向 ${phone} 发送验证码: ${code}`);
      
      // 保存验证码，10分钟有效
      this.verificationCodes.set(phone, {
        code,
        expireAt: Date.now() + 10 * 60 * 1000
      });
      
      return { success: true };
    } catch (error) {
      console.error('发送验证码失败:', error);
      return { success: false, error: '发送失败' };
    }
  }

  verifyCode(phone, code) {
    const data = this.verificationCodes.get(phone);
    if (!data) {
      return false;
    }
    
    if (Date.now() > data.expireAt) {
      this.verificationCodes.delete(phone);
      return false;
    }
    
    if (data.code !== code) {
      return false;
    }
    
    // 验证成功后删除验证码
    this.verificationCodes.delete(phone);
    return true;
  }
}

module.exports = new SmsService();
