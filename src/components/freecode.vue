<template>
  <div class="redemption-container">
    <div class="card">
      <!-- 品牌头部 -->
      
      <div class="header">
        <span class="badge">LIMITED EDITION</span>
        <h1>Crispy Thin™ 金票兑奖中心</h1>
        <p class="subtitle">限量版角色钥匙扣专属兑换卡验证</p>
      </div>

      <!-- 第一步：卡号输入与验证区域 -->
      <div v-if="!isVerified" class="step-verify">
        <div class="input-group">
          <input 
            v-model="inputCode" 
            type="text" 
            placeholder="请输入包装内卡片上的 12 位金票码"
            maxlength="20"
            @keyup.enter="verifyCode"
          />
          <button @click="verifyCode" class="btn-primary">立即验证中奖卡</button>
        </div>
        <p v-if="errorMessage" class="error-msg">⚠️ {{ errorMessage }}</p>
      </div>

      <!-- 第二步：验证通过 -> 极致丝滑的直接领奖单 -->
      <div v-else class="step-success">
        <div class="success-banner">
          <h3>🎉 验证成功！恭喜您锁定神秘礼品！</h3>
          <p>您获得了一张合法的 Crispy Thin™ 限量版角色钥匙扣兑换卡！</p>
        </div>

        <div class="product-preview">
          <div class="product-icon">🎁</div>
          <div class="product-info">
            <h4>Crispy Thin™ 限量版公仔钥匙扣</h4>
            <p>官方指导售价: <span class="old-price">$15.00</span> <span class="free-tag">免费兑换</span></p>
          </div>
        </div>

        <!-- 核心优化：直接跳转到已填好商品和优惠码的官方结算页，彻底废除繁琐的注册登录 -->
        <div class="action-box">
          <button @click="claimGiftDirectly" class="btn-claim">
            🚀 一键免费兑换并填写收件地址
          </button>
          <p class="tip-text">
            💡 点击后将直接跳转至安全结算页，系统已为您自动填入抵扣码与礼品，仅需填写配送地址即可完成发货！
          </p>
        </div>
      </div>

      <div style="text-shadow: 3px 3px 3px gray;">测试用：0TDWRM3QPP34</div>

      <!-- 底部规则说明链接 -->
      <div class="footer">
        <a href="#" @click.prevent="showRules = true" class="rules-link">
          📜 查看《Crispy Thin™ 限量版角色钥匙扣促销活动 – 官方规则》
        </a>
      </div>
    </div>

    <!-- 官方活动规则（一页版）合规弹窗 Modal -->
    <div v-if="showRules" class="modal-overlay" @click.self="showRules = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>官方活动规则（一页版）</h2>
          <button class="close-btn" @click="showRules = false">&times;</button>
        </div>
        <div class="modal-body">
          <h3>Crispy Thin™ 限量版角色钥匙扣促销活动 – 官方规则</h3>
          <p class="legal-notice">无需购买，法律禁止地区除外。本促销活动（“活动”）由 Asiamerica Food（“主办方”）主办。</p>
          
          <h4>1. 活动期间</h4>
          <p>活动自 2026 年 8 月 1 日开始，至 2026 年 10 月 31 日结束，或至所有奖品兑换完毕（以先到者为准）。</p>
          
          <h4>2. 参与资格</h4>
          <p>面向美国合法居民，且年满 18 周岁（或居住地法定成年年龄）。法律禁止地区无效。</p>
          
          <h4>3. 如何中奖</h4>
          <p>共有三十（30）张特制中奖卡被随机放入本次促销批次约三百（300）包 Crispy Thin™ 零食包装中。若您在合格包装中发现中奖卡，请按照提示输入兑换码领奖。</p>
          
          <h4>4. 奖品与价值</h4>
          <p>每张经核验的中奖卡可兑换一（1）个限量版 Crispy Thin™ 角色钥匙扣。近似零售价（ARV）：15.00 美元。奖品不可转让，不可兑换现金。</p>
          
          <h4>5. 兑换方式与审核</h4>
          <p>输入唯一兑换码并按提示填完物流单后即完成。奖品寄出前可能需要寄回原始中奖卡以作二次核验。主办方保留拒绝经篡改、复制、伪造中奖卡的权利。</p>
          
          <h4>6. 通用条款与责任限制</h4>
          <p>如遇欺诈、技术故障或其他超出合理控制范围的情况，主办方保留修改、暂停或终止活动的权利。参与者一旦参与，即表示同意本官方规则及主办方的最终决定。</p>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="showRules = false">我已经了解并同意</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 页面状态控制
const inputCode = ref('');
const isVerified = ref(false);
const errorMessage = ref('');
const showRules = ref(false);

// ----------------------------------------------------
// ⚠️ 必填配置：把你的 Shopify 店铺与商品核心 ID 填进这里！
// ----------------------------------------------------
const SHOPIFY_DOMAIN = "cgkvgw-jw.myshopify.com"; // 你的真实官方原生域名
// const VARIANT_ID = "10274783920441"; // 👉 替换为：你后台“薄脆公仔”真实的 Variant ID 数字
const VARIANT_ID = "53767537131833"; // 👉 替换为：你后台“薄脆公仔”真实的 Variant ID 数字

// 后台设置好的 1 个卡号（或者你批量导出的30个合法码数组）
const validCodes = [
  '0TDWRM3QPP34'
];

// 步骤 1：本地校验卡号
function verifyCode() {
  errorMessage.value = '';
  const cleanCode = inputCode.value.trim().toUpperCase();
  
  if (!cleanCode) {
    errorMessage.value = "请先输入包装内的 12 位兑换码！";
    return;
  }

  // 比对后台配置的合法卡号
  if (validCodes.includes(cleanCode)) {
    isVerified.value = true;
  } else {
    errorMessage.value = "兑换码无效或已被兑换完毕，请核对卡片文字信息！";
  }
}

// 步骤 2：核心修复！采用 Shopify Cart Permalink 极速通道下单
function claimGiftDirectly() {
  const code = inputCode.value.trim().toUpperCase();
  
  // 构造神奇的免登录一键直达购物车结算网址
  // 语法: https://域名/cart/商品变体ID:数量?discount=优惠码
  const checkoutUrl = `https://${SHOPIFY_DOMAIN}/cart/${VARIANT_ID}:1?discount=${code}`;
  
  // 打印日志方便你在浏览器控制台（F12）排查调试
  console.log("正在为您极速跳转至官方结算页:", checkoutUrl);
  
  // 网页重定向跳转（彻底解决原本按钮点不动、无反应的 Bug）
  window.location.href = checkoutUrl;
}
</script>

<style scoped>
/* 现代精美的高端黑金色系兑奖页面样式 */
.redemption-container {
  max-width: 580px;
  margin: 40px auto;
  padding: 0 15px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 35px 30px;
  text-align: center;
  border: 1px solid #f0f0f0;
}
.badge {
  background: #fff8e6;
  color: #d97706;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 1px;
}
.header h1 {
  margin: 15px 0 8px;
  color: #111827;
  font-size: 26px;
}
.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 25px;
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.input-group input {
  padding: 14px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
  text-transform: uppercase;
  transition: border-color 0.2s;
}
.input-group input:focus {
  outline: none;
  border-color: #f59e0b;
}
.btn-primary, .btn-claim {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}
.btn-primary:hover, .btn-claim:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}
.btn-claim {
  width: 100%;
  font-size: 18px;
  padding: 16px;
}
.error-msg {
  color: #ef4444;
  font-size: 14px;
  margin-top: 12px;
}
.success-banner {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.success-banner h3 {
  margin: 0 0 5px;
  font-size: 18px;
}
.success-banner p {
  margin: 0;
  font-size: 13px;
}
.product-preview {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f9fafb;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
  text-align: left;
}
.product-icon {
  font-size: 36px;
  background: white;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.product-info h4 {
  margin: 0 0 5px;
  color: #1f2937;
  font-size: 16px;
}
.old-price {
  text-decoration: line-through;
  color: #9ca3af;
  margin-right: 8px;
}
.free-tag {
  color: #10b981;
  font-weight: 700;
  background: #d1fae5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.tip-text {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  margin-top: 12px;
}
.footer {
  margin-top: 30px;
  border-top: 1px solid #f3f4f6;
  padding-top: 15px;
}
.rules-link {
  color: #9ca3af;
  font-size: 12px;
  text-decoration: none;
}
.rules-link:hover {
  color: #4b5563;
  text-decoration: underline;
}

/* 规则弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}
.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-align: left;
}
.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h2 { margin: 0; font-size: 18px; color: #111827; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }
.modal-body {
  padding: 20px;
  overflow-y: auto;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
}
.modal-body h3 { color: #111827; margin-top: 0; }
.modal-body h4 { color: #1f2937; margin: 15px 0 5px; }
.legal-notice { font-weight: bold; color: #374151; }
.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #f3f4f6;
  text-align: right;
}
</style>