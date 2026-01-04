# ngrok 设置指南

## 问题：需要认证

ngrok 现在需要注册账号才能使用。有两种解决方案：

## 方案一：注册 ngrok 账号（免费）

### 步骤：

1. **注册账号**
   - 访问 https://dashboard.ngrok.com/signup
   - 使用邮箱注册（免费）

2. **获取 authtoken**
   - 登录后访问 https://dashboard.ngrok.com/get-started/your-authtoken
   - 复制你的 authtoken

3. **配置 authtoken**
   ```bash
   ngrok config add-authtoken 你的authtoken
   ```

4. **启动 ngrok**
   ```bash
   ngrok http 3000
   ```

完成！现在可以使用了。

---

## 方案二：使用其他部署方案（推荐，更简单）

如果不想注册 ngrok，可以使用以下方案：

### 🚀 Railway（最推荐，完全免费）

**优点**：
- 完全免费（有免费额度）
- 有固定网址，不会变
- 自动部署，无需配置
- 数据自动持久化

**步骤**：

1. **准备代码仓库**
   ```bash
   # 如果还没有 git 仓库
   git init
   git add .
   git commit -m "Initial commit"
   
   # 创建 GitHub 仓库，然后：
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```

2. **部署到 Railway**
   - 访问 https://railway.app
   - 点击 "Start a New Project"
   - 选择 "Deploy from GitHub repo"
   - 授权并选择你的仓库
   - Railway 会自动部署

3. **获得网址**
   - 部署完成后，Railway 会给你一个固定网址
   - 例如：`https://your-app.railway.app`

### 🌐 其他免费部署选项

- **Render**：https://render.com（类似 Railway）
- **Fly.io**：https://fly.io（需要信用卡但免费额度很大）
- **Vercel**：https://vercel.com（需要调整代码支持 Serverless）

---

## 快速对比

| 方案 | 难度 | 网址类型 | 推荐度 |
|------|------|----------|--------|
| ngrok（需注册） | ⭐⭐ | 每次重启会变 | ⭐⭐⭐ |
| Railway | ⭐ | 固定网址 | ⭐⭐⭐⭐⭐ |
| Render | ⭐ | 固定网址 | ⭐⭐⭐⭐ |
| 自己服务器 | ⭐⭐⭐⭐ | 固定网址 | ⭐⭐⭐ |

---

## 我的推荐

**如果你想要最快的方案**：注册 ngrok（5分钟）

**如果你想要最好的方案**：使用 Railway（10分钟，但更稳定）

需要我帮你设置 Railway 吗？

