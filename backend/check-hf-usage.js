require('dotenv').config();
const axios = require('axios');

console.log('🔍 检查Hugging Face API使用情况...');
console.log('==============================');

const hfToken = process.env.HUGGING_FACE_TOKEN;

if (!hfToken) {
  console.log('❌ HUGGING_FACE_TOKEN未配置');
  process.exit(1);
}

console.log('✅ HUGGING_FACE_TOKEN已配置');

// 检查API使用情况
async function checkUsage() {
  try {
    console.log('\n📊 检查API使用情况...');
    
    // 尝试获取用户信息（这可能会显示使用限制）
    const response = await axios.get(
      'https://huggingface.co/api/whoami',
      {
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ API连接正常');
    console.log('📝 用户信息:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ 获取用户信息失败:');
    console.log(`   状态码: ${error.response?.status || '无响应'}`);
    console.log(`   错误信息: ${error.message}`);
    
    if (error.response?.status === 401) {
      console.log('💡 建议: Token可能无效或已过期');
    } else if (error.response?.status === 429) {
      console.log('💡 建议: 已达到API调用限制');
    }
  }
}

// 测试API调用限制
async function testLimits() {
  console.log('\n🧪 测试API调用限制...');
  
  const testPromises = [];
  const maxTests = 10; // 测试10次调用
  
  for (let i = 0; i < maxTests; i++) {
    testPromises.push(
      axios.post(
        'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
        {
          inputs: `Test message ${i + 1}`,
          parameters: {
            candidate_labels: ["positive", "negative"]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${hfToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      ).then(() => ({ success: true, index: i + 1 }))
      .catch(error => ({ success: false, index: i + 1, error: error.response?.status }))
    );
    
    // 添加小延迟避免过快调用
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const results = await Promise.all(testPromises);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`📊 测试结果: ${successful}/${maxTests} 成功, ${failed}/${maxTests} 失败`);
  
  if (failed > 0) {
    console.log('❌ 部分调用失败，可能达到限制');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   调用 ${r.index}: 状态码 ${r.error}`);
    });
  } else {
    console.log('✅ 所有调用都成功');
  }
}

// 显示Hugging Face免费额度信息
function showFreeTierInfo() {
  console.log('\n📋 Hugging Face 免费额度信息:');
  console.log('==============================');
  console.log('🔍 根据官方文档，Hugging Face Inference API的免费额度:');
  console.log('   - 免费用户: 每月30,000次API调用');
  console.log('   - 无信用卡要求');
  console.log('   - 支持所有开源模型');
  console.log('   - 有速率限制（每分钟请求数）');
  console.log('');
  console.log('💡 常见限制原因:');
  console.log('   1. 达到月度调用限制（30,000次）');
  console.log('   2. 达到速率限制（每分钟请求数）');
  console.log('   3. Token无效或已过期');
  console.log('   4. 模型不存在或不可用');
  console.log('   5. 网络连接问题');
  console.log('');
  console.log('🔗 更多信息: https://huggingface.co/pricing');
}

// 运行检查
async function runChecks() {
  await checkUsage();
  await testLimits();
  showFreeTierInfo();
}

runChecks().catch(console.error);
