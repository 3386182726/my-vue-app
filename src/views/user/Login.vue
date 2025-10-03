<template>
    <el-container class="login-container">
      <el-header height="60px">
        <h2 class="title">欢迎登录</h2>
      </el-header>
  
      <el-main>
        <el-card class="login-card">
          <el-form
            :model="form"
            :rules="rules"
            ref="loginForm"
            label-position="top"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
  
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
              />
            </el-form-item>
  
            <el-form-item>
              <el-button type="primary" @click="login" style="width: 100%">
                登录
              </el-button>
            </el-form-item>
          </el-form>
  
          <!-- 这里新增 -->
          <div class="footer-text">
            还没有账号？
            <el-link type="primary" @click="goRegister">去注册</el-link>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import axios from 'axios'
  import tokenStore from '../../stores/tokenStore'

  const router = useRouter()
  
  // 表单数据
  const form = ref({
    username: '',
    password: ''
  })
  
  // 校验规则
  const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
  }
  
  // 点击登录
  const login = async () => {
  try {
    const response = await axios.post('/api/user/login', form.value, {
      withCredentials: true // ⚠️ 关键！允许跨域时携带 cookie
    })
    console.log('后端返回:', response.data)
    // 如果后端设置了 Cookie，jwt需要拿 token
    tokenStore.setToken(response.data.token)
    // 登录成功后直接跳转
    router.push('/').catch(err => console.log(err))
  } catch (err) {
    console.error('登录失败:', err)
  }
}
  
  // 去注册
  function goRegister() {
    router.push('/register')
  }
  </script>
  
  <style scoped>
  .login-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #f5f5f5;
  }
  
  .login-card {
    width: 350px;
    padding: 20px;
  }
  
  .title {
    text-align: center;
    margin: 0;
    padding: 10px 0;
  }
  
  .footer-text {
    text-align: center;
    margin-top: 15px;
  }
  </style>