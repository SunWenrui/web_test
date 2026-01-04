# 部署指南 - 让网页可以公网访问并记忆操作

## 📌 数据持久化说明

✅ **数据已经可以永久保存！**
- 所有操作（添加行为、勋章、用户等）都会自动保存到 `medal_system.db` 数据库文件
- 关闭浏览器、重启服务器，数据都不会丢失
- 数据库文件位置：项目根目录下的 `medal_system.db`

## 🚀 部署方案（选择一种）

### 方案一：使用 ngrok（最简单，适合测试）

**优点**：5分钟即可完成，无需服务器  
**缺点**：免费版每次重启会改变网址

#### 步骤：

1. **安装 ngrok**
   ```bash
   # macOS
   brew install ngrok
   
   # 或访问 https://ngrok.com/download 下载
   ```

2. **启动你的服务器**
   ```bash
   npm start
   ```

3. **在另一个终端运行 ngrok**
   ```bash
   ngrok http 3000
   ```

4. **获得公网地址**
   - ngrok 会显示一个网址，例如：`https://abc123.ngrok.io`
   - 把这个网址分享给其他人即可访问

### 方案二：部署到 Railway（推荐，免费）

**优点**：永久免费额度，自动部署，有固定网址  
**缺点**：需要注册账号

#### 步骤：

1. **访问 Railway**
   - 打开 https://railway.app
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的代码仓库

3. **配置环境变量**
   - 在项目设置中添加环境变量：`PORT=3000`

4. **部署**
   - Railway 会自动检测 Node.js 项目并部署
   - 部署完成后会给你一个网址，例如：`https://your-app.railway.app`

5. **数据持久化**
   - Railway 会自动保存数据库文件
   - 数据会永久保存

### 方案三：部署到 Vercel（适合前端，需要调整）

**注意**：Vercel 是无服务器架构，需要修改代码支持 Serverless Functions

### 方案四：使用自己的服务器（最灵活）

#### 步骤：

1. **购买云服务器**
   - 阿里云、腾讯云、DigitalOcean 等
   - 最低配置：1核1G即可

2. **连接服务器**
   ```bash
   ssh root@your-server-ip
   ```

3. **安装 Node.js**
   ```bash
   # 使用 nvm 安装 Node.js
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

4. **上传代码**
   ```bash
   # 在本地打包代码（排除 node_modules）
   tar -czf app.tar.gz --exclude='node_modules' --exclude='.git' .
   
   # 上传到服务器
   scp app.tar.gz root@your-server-ip:/root/
   
   # 在服务器上解压
   ssh root@your-server-ip
   cd /root
   tar -xzf app.tar.gz
   npm install
   ```

5. **使用 PM2 运行（保持后台运行）**
   ```bash
   # 安装 PM2
   npm install -g pm2
   
   # 启动应用
   pm2 start server.js --name medal-system
   
   # 设置开机自启
   pm2 startup
   pm2 save
   ```

6. **配置 Nginx 反向代理（可选）**
   ```bash
   # 安装 Nginx
   apt-get install nginx
   
   # 编辑配置文件
   nano /etc/nginx/sites-available/default
   ```
   
   添加以下配置：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   # 重启 Nginx
   systemctl restart nginx
   ```

7. **配置防火墙**
   ```bash
   # 开放 3000 端口（如果直接访问）
   ufw allow 3000
   
   # 或开放 80 端口（如果使用 Nginx）
   ufw allow 80
   ```

### 方案五：使用 Docker（推荐用于生产环境）

#### 步骤：

1. **创建 Dockerfile**（已包含在项目中）

2. **构建镜像**
   ```bash
   docker build -t medal-system .
   ```

3. **运行容器**
   ```bash
   docker run -d -p 3000:3000 --name medal-app -v $(pwd)/medal_system.db:/app/medal_system.db medal-system
   ```

4. **部署到云平台**
   - 可以部署到任何支持 Docker 的平台
   - 例如：Railway、Render、Fly.io 等

## 🔒 数据备份建议

### 自动备份脚本

创建 `backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp medal_system.db "$BACKUP_DIR/medal_system_$DATE.db"
echo "备份完成: $BACKUP_DIR/medal_system_$DATE.db"
```

### 使用 cron 定时备份

```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨2点备份
0 2 * * * /path/to/backup.sh
```

## 📱 测试数据持久化

1. **添加一些数据**
   - 在网页上添加行为、勋章、用户

2. **关闭浏览器**
   - 完全关闭浏览器窗口

3. **重新打开网页**
   - 访问相同的网址
   - 数据应该还在！

4. **重启服务器**
   ```bash
   # 停止服务器
   pm2 stop medal-system
   
   # 启动服务器
   pm2 start medal-system
   ```
   - 数据应该还在！

## ✅ 验证清单

部署完成后，检查以下内容：

- [ ] 网页可以正常访问
- [ ] 可以添加/编辑/删除数据
- [ ] 关闭浏览器后重新打开，数据还在
- [ ] 重启服务器后，数据还在
- [ ] 多个用户同时访问，数据实时同步
- [ ] 数据库文件 `medal_system.db` 存在且大小在增长

## 🆘 常见问题

**Q: 数据丢失了怎么办？**
A: 检查 `medal_system.db` 文件是否存在，如果存在，数据应该还在。如果丢失，可以使用备份文件恢复。

**Q: 如何查看数据库内容？**
A: 使用 SQLite 工具：
```bash
sqlite3 medal_system.db
.tables
SELECT * FROM behaviors;
```

**Q: 如何迁移到其他服务器？**
A: 复制 `medal_system.db` 文件到新服务器即可。

**Q: 数据库文件会越来越大吗？**
A: SQLite 会自动管理，但建议定期备份。如果数据量很大，可以考虑迁移到 PostgreSQL 或 MySQL。

## 🎯 推荐方案

- **快速测试**：使用 ngrok（方案一）
- **长期使用**：使用 Railway（方案二）
- **企业使用**：使用自己的服务器 + PM2（方案四）

