<template>
    <el-container class="auth-container">
      <el-card class="auth-card">
        <h2 class="title">注册</h2>
  
        <el-form
          ref="registerForm"
          :model="form"
          :rules="rules"
          label-position="top"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
  
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
  
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
            />
          </el-form-item>
  
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
            />
          </el-form-item>
  
          <el-form-item>
            <el-button type="primary" @click="handleRegister" style="width: 100%">
              注册
            </el-button>
          </el-form-item>
        </el-form>
  
        <div class="footer-text">
          已有账号？
          <el-link type="primary" @click="goLogin">去登录</el-link>
        </div>
      </el-card>
    </el-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
    import axios from 'axios'
    
  const router = useRouter()
  
  const form = ref({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    confirmPassword: [
      { required: true, message: '请确认密码', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== form.value.password) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }
  
  const registerForm = ref(null)
  
  const handleRegister = async () => {
  try {
    // 表单验证
    await registerForm.value.validate();

    // 调用注册接口
    const response = await axios.post('/api/user/register', form.value, {
      withCredentials: true // ⚠️ 允许跨域携带 cookie
    });

    // 注册成功提示 & 跳转
    ElMessage.success('注册成功，请登录');
    router.push('/login');

  } catch (err) {
    // 验证失败或者请求失败都会进入这里
    console.log(err);
    ElMessage.error('注册失败，请检查表单或网络');
  }
};
  
  function goLogin() {
    router.push('/login')
  }
  </script>
  
  <style scoped>
  .auth-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f5f5f5;
  }
  
  .auth-card {
    width: 350px;
    padding: 20px;
  }
  
  .title {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .footer-text {
    text-align: center;
    margin-top: 15px;
  }
  </style>
  