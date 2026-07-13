<template>
  <div class="redemption-wrapper max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    
    <!-- 第一部分：文案展示与说明 -->
    <section v-if="currentStep === 1" class="step-1">
      <h2 class="text-2xl font-bold text-center text-green-600 mb-4">🎉 恭喜您获得官方抽奖兑奖资格！</h2>
      <div class="rules-box border p-4 bg-gray-50 rounded mb-6 text-sm text-gray-700 space-y-2">
        <p><strong>【活动规则】</strong> 本次活动由官方举办，所有礼品真实有效。</p>
        <p><strong>【兑奖方法】</strong> 请在下方输入您的刮奖卡号。兑奖卡号一经输入并兑奖成功，将<strong>永久作废</strong>，无法二次使用。</p>
        <p><strong>【防范欺诈】</strong> 官方不会以任何形式收取您的双向邮费或手续费，请认准本官方域名。</p>
        <p class="text-red-500 font-semibold">【法律条款】 本活动最终解释权归本公司所有。收件地址仅限邮寄美国本土。</p>
      </div>

      <!-- 第二部分：卡号验证 -->
      <div class="verify-box space-y-4">
        <label class="block font-medium">请输入您的兑奖卡号：</label>
        <input 
          v-model.trim="promoCode" 
          type="text" 
          placeholder="请输入数字+英文字母组合码" 
          class="w-full border p-3 rounded"
          :disabled="loading"
        />
        <p v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</p>
        <button 
          @click="verifyCode" 
          :disabled="loading" 
          class="w-full bg-orange-600 text-white p-3 rounded font-bold hover:bg-orange-700 transition"
        >
          {{ loading ? '验证中...' : '验证兑奖码' }}
        </button>
      </div>
    </section>

    <!-- 第三部分：展示公仔、会员限制与收集地址 -->
    <section v-if="currentStep === 2" class="step-2 space-y-6">
      <div class="gift-preview text-center">
        <h3 class="text-xl font-bold text-orange-600 mb-2">验证成功！您已锁定神秘礼品</h3>
        
        <!-- 悬停/点击变图彩蛋 -->
        <div class="image-container flex justify-center items-center h-64">
          <img 
            :src="isHovered ? femaleImg : maleImg" 
            :style="{ width: isHovered ? '240px' : '200px' }"
            alt="神秘礼品公仔" 
            class="transition-all duration-300 cursor-pointer object-contain"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
            @touchstart="isHovered = true"
            @touchend="isHovered = false"
          />
        </div>
      </div>

      <!-- 会员卡点：根据登录状态拦截显示 -->
      <div v-if="!isLoggedIn" class="member-lock border border-dashed border-orange-400 p-4 text-center rounded bg-orange-50">
        <p class="text-sm text-gray-600 mb-3">💡 想要获取更多物流追踪及后续专属资讯？</p>
        <p class="font-semibold text-gray-800 mb-4">请先注册成为会员并登录会员后方可查看与提交</p>
        <div class="space-x-4">
          <button @click="showLoginModal = true" class="bg-gray-800 text-white px-4 py-2 rounded text-sm">登录账号</button>
          <button @click="showRegisterModal = true" class="bg-orange-600 text-white px-4 py-2 rounded text-sm">注册会员</button>
        </div>
      </div>

      <!-- 已登录：展示地址表单 -->
      <form v-else @submit.prevent="submitRedemption" class="address-form space-y-4">
        <h4 class="font-bold border-b pb-2 text-gray-800">填写收件信息 <span class="text-orange-600 text-xs">（只限邮寄美国本土）</span></h4>
        <div class="grid grid-cols-2 gap-4">
          <input v-model="form.lastName" type="text" placeholder="姓 (Last Name)" required class="border p-2 rounded">
          <input v-model="form.firstName" type="text" placeholder="名 (First Name)" required class="border p-2 rounded">
        </div>
        <input v-model="form.phone" type="tel" placeholder="电话 (Phone)" required class="border p-2 rounded w-full">
        <input v-model="form.email" type="email" placeholder="Email" required class="border p-2 rounded w-full" disabled>
        <input v-model="form.address1" type="text" placeholder="详细地址 (Address line 1)" required class="border p-2 rounded w-full">
        <div class="grid grid-cols-3 gap-2">
          <input v-model="form.city" type="text" placeholder="城市 (City)" required class="border p-2 rounded">
          <input v-model="form.province" type="text" placeholder="州 (State, e.g. CA)" required class="border p-2 rounded">
          <input v-model="form.zip" type="text" placeholder="邮编 (Zip Code)" required class="border p-2 rounded">
        </div>
        <p class="text-xs text-gray-500">⚠️ 系统将自动检测地址有效性，请确保在美国本土范围内。</p>
        <button 
          type="submit" 
          :disabled="submitting" 
          class="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700 transition"
        >
          {{ submitting ? '正在提交订单...' : '确认并免费提交兑奖' }}
        </button>
      </form>
    </section>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { shopifyCreateCheckout, shopifyUpdateAddress, shopifyApplyDiscount, shopifyCompleteFreeCheckout } from '../services/shopifyService';

import femaleImg from '../assets/female.png';
import maleImg from '../assets/male.jpg';

const currentStep = ref(1);
const promoCode = ref('');
const errorMsg = ref('');
const loading = ref(false);
const submitting = ref(false);
const isHovered = ref(false);

// 会员相关状态（实际开发中建议与 Pinia 联动）
const isLoggedIn = ref(false); 
const showLoginModal = ref(false);
const showRegisterModal = ref(false);

// 15个验证码前端预设名单（大写）
const validCodes = ['CODE001', 'CODE002', 'CODE003', 'CODE004', 'CODE005', 'CODE006', 'CODE007', 'CODE008', 'CODE009', 'CODE010', 'CODE011', 'CODE012', 'CODE013', 'CODE014', 'CODE015'];

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: 'user@example.com', // 会员登录后自动带出
  address1: '',
  city: '',
  province: '',
  zip: '',
  country: 'US' // 固定为美国
});

// 第二部分验证
const verifyCode = async () => {
  errorMsg.value = '';
  const code = promoCode.value.toUpperCase();
  if (!code) {
    errorMsg.value = '请输入兑奖卡号！';
    return;
  }
  
  if (validCodes.includes(code)) {
    currentStep.value = 2;
  } else {
    errorMsg.value = '兑奖卡号不存在或已被使用，请检查后重试。';
  }
};

// 第三部分：核心无感向 Shopify 提交 0 元订单
const submitRedemption = async () => {
  submitting.value = true;
  try {
    // 1. 创建结账单并塞入公仔商品
    const checkoutId = await shopifyCreateCheckout("gid://shopify/ProductVariant/YOUR_VARIANT_ID");
    
    // 2. 将 Vue 表单的美国地址绑定上去
    await shopifyUpdateAddress(checkoutId, form);
    
    // 3. 应用打折码（2美金扣减）
    const finalAmount = await shopifyApplyDiscount(checkoutId, promoCode.value);
    
    // 4. 严密校验：确保最终付款金额必须为 0.00
    if (parseFloat(finalAmount) === 0.00) {
      // 执行无感 0 元订单闭环
      const order = await shopifyCompleteFreeCheckout(checkoutId);
      alert(`兑奖成功！您的订单号为: ${order.orderNumber}。我们将尽快为您邮寄！`);
    } else {
      alert("配置错误：运费或税费未能成功归零，请联系客服。");
    }
  } catch (err) {
    alert("提交失败，错误信息: " + err.message);
  } finally {
    submitting.value = false;
  }
};
</script>