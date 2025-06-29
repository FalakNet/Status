<!-- 站点登录 -->
<template>
  <div class="site-login">
    <n-card class="login-content" hoverable>
      <n-alert :show-icon="false">
        The site is password protected. Please enter the password to view.
      </n-alert>
      <n-form ref="formRef" :model="formData" :rules="formRules">
        <n-form-item label="Password" path="password">
          <n-input
            v-model:value="formData.password"
            placeholder="Enter password"
            type="password"
            show-password-on="mousedown"
            @keyup.enter="toLogin"
          />
        </n-form-item>
      </n-form>
      <n-button
        :loading="loading"
        :disabled="loading"
        type="primary"
        @click="toLogin"
      >
        Login
      </n-button>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import type { FormInst, FormRules } from "naive-ui";
import SHA256 from "crypto-js/sha256";

const { t } = useI18n();
const statusStore = useStatusStore();

// 表单数据
const formRef = ref<FormInst>();
const formData = ref<{ password: string }>({ password: "" });
const formRules: FormRules = {
  password: {
    required: true,
    message: "Enter password",
    trigger: ["input", "blur"],
  },
};
const loading = ref<boolean>(false);

// 尝试登录
const toLogin = useDebounce(
  async () => {
    try {
      // 校验表单
      await formRef.value?.validate();
      loading.value = true;
      // 随机延时 - 开发环境
      const delay = Math.floor(Math.random() * 1000) + 500;
      await sleep(delay);
      // 尝试登录
      const password = SHA256(formData.value.password).toString();
      await $fetch("/api/verify", { method: "POST", body: { password } });
      statusStore.loginStatus = true;
      window.$message.success("Login successful");
    } catch (error) {
      console.error("error in login", error);
      window.$message.error("Password is incorrect");
    } finally {
      loading.value = false;
    }
  },
  300,
  { leading: true, trailing: false },
);
</script>

<style lang="scss" scoped>
.site-login {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;
  
  @media (max-width: 480px) {
    padding: 15px;
  }
  
  .login-content {
    max-width: 480px;
    width: 100%;
    margin: 0 20px;
    border-radius: 12px;
    
    @media (max-width: 768px) {
      max-width: 400px;
      margin: 0 15px;
    }
    
    @media (max-width: 480px) {
      max-width: 100%;
      margin: 0;
      border-radius: 8px;
    }
    
    .n-alert {
      margin-bottom: 20px;
      text-align: center;
      
      @media (max-width: 480px) {
        margin-bottom: 15px;
        font-size: 14px;
      }
    }
    
    .n-button {
      width: 100%;
      margin-top: 20px;
      
      @media (max-width: 480px) {
        margin-top: 15px;
        height: 40px;
      }
    }
    
    :deep(.n-input) {
      @media (max-width: 480px) {
        --n-height: 40px;
      }
    }
  }
}
</style>
