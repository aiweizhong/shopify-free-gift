// shopifyService.js
const domain = 'cgkvgw-jw.myshopify.com'; 
const storefrontAccessToken = '1312edf7ef1c276c4a2fdb8745b24639'; // 助手发给你的 Token
const apiVersion = '2026-04'; 

async function shopifyFetch(query, variables = {}) {
  const response = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const resData = await response.json();
  if (resData.errors) {
    throw new Error(resData.errors[0].message);
  }
  return resData.data;
}

// 1. 创建 Checkout
export async function shopifyCreateCheckout(variantId) {
  const query = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout { id }
        checkoutUserErrors { message }
      }
    }
  `;
  const res = await shopifyFetch(query, { input: { lineItems: [{ variantId, quantity: 1 }] } });
  if (res.checkoutCreate.checkoutUserErrors.length > 0) {
    throw new Error(res.checkoutCreate.checkoutUserErrors[0].message);
  }
  return res.checkoutCreate.checkout.id;
}

// 2. 绑定收件人美国地址
export async function shopifyUpdateAddress(checkoutId, address) {
  const query = `
    mutation checkoutShippingAddressUpdateV2($shippingAddress: MailingAddressInput!, $checkoutId: ID!) {
      checkoutShippingAddressUpdateV2(shippingAddress: $shippingAddress, checkoutId: $checkoutId) {
        checkout { id }
        checkoutUserErrors { message }
      }
    }
  `;
  const res = await shopifyFetch(query, { checkoutId, shippingAddress: address });
  if (res.checkoutShippingAddressUpdateV2.checkoutUserErrors.length > 0) {
    throw new Error(res.checkoutShippingAddressUpdateV2.checkoutUserErrors[0].message);
  }
}

// 3. 应用打折码并返回最终金额
export async function shopifyApplyDiscount(checkoutId, discountCode) {
  const query = `
    mutation checkoutDiscountCodeApplyV2($discountCode: String!, $checkoutId: ID!) {
      checkoutDiscountCodeApplyV2(discountCode: $discountCode, checkoutId: $checkoutId) {
        checkout { paymentDue { amount } }
        checkoutUserErrors { message }
      }
    }
  `;
  const res = await shopifyFetch(query, { checkoutId, discountCode });
  if (res.checkoutDiscountCodeApplyV2.checkoutUserErrors.length > 0) {
    throw new Error(res.checkoutDiscountCodeApplyV2.checkoutUserErrors[0].message);
  }
  return res.checkoutDiscountCodeApplyV2.checkout.paymentDue.amount;
}

// 4. 无感完成 0 元订单提交
export async function shopifyCompleteFreeCheckout(checkoutId) {
  const query = `
    mutation checkoutCompleteFree($checkoutId: ID!) {
      checkoutCompleteFree(checkoutId: $checkoutId) {
        checkout { order { id orderNumber } }
        checkoutUserErrors { message }
      }
    }
  `;
  const res = await shopifyFetch(query, { checkoutId });
  if (res.checkoutCompleteFree.checkoutUserErrors.length > 0) {
    throw new Error(res.checkoutCompleteFree.checkoutUserErrors[0].message);
  }
  return res.checkoutCompleteFree.checkout.order;
}