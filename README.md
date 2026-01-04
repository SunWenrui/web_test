# 行为与勋章管理系统

一个支持多用户实时同步的H5后台配置系统，用于管理行为设定、勋章数值和用户设定。

## 功能特性

- ✅ **数据持久化**：所有操作自动保存到数据库，关闭浏览器或重启服务器数据不会丢失
- ✅ **数据库存储**：使用SQLite数据库持久化所有数据
- ✅ **实时同步**：通过WebSocket实现多用户实时数据同步
- ✅ **RESTful API**：完整的CRUD操作接口
- ✅ **多用户协作**：多个用户同时操作，数据实时同步
- ✅ **公网部署**：支持部署到云服务器，让其他人访问

## 技术栈

- **前端**：HTML5 + JavaScript + Socket.IO Client
- **后端**：Node.js + Express
- **数据库**：SQLite3
- **实时通信**：Socket.IO

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务器

```bash
npm start
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

### 3. 访问应用

打开浏览器访问：`http://localhost:3000`

## 部署说明

### 本地部署

1. 确保已安装 Node.js (版本 >= 14)
2. 在项目目录运行 `npm install`
3. 运行 `npm start`
4. 服务器将在 `http://localhost:3000` 启动

### 生产环境部署

#### 使用 PM2（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name medal-system

# 查看状态
pm2 status

# 查看日志
pm2 logs medal-system
```

#### 使用 Docker

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

构建和运行：

```bash
docker build -t medal-system .
docker run -d -p 3000:3000 medal-system
```

#### 使用云服务

可以部署到以下平台：
- **Heroku**：支持 Node.js，自动部署
- **Vercel**：支持 Node.js 服务器
- **Railway**：简单易用的部署平台
- **DigitalOcean**：VPS 部署
- **阿里云/腾讯云**：国内云服务器

### 环境变量

可以通过环境变量配置端口：

```bash
PORT=3000 npm start
```

## API 接口

### 行为 (Behaviors)

- `GET /api/behaviors` - 获取所有行为
- `POST /api/behaviors` - 创建行为
- `PUT /api/behaviors/:id` - 更新行为
- `DELETE /api/behaviors/:id` - 删除行为

### 勋章 (Medals)

- `GET /api/medals` - 获取所有勋章
- `POST /api/medals` - 创建勋章
- `DELETE /api/medals/:id` - 删除勋章

### 用户 (Users)

- `GET /api/users` - 获取所有用户
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 清空数据

- `POST /api/clear-all` - 清空指定类型的所有数据
  - Body: `{ "type": "behaviors" | "medals" | "users" }`

## WebSocket 事件

### 客户端接收

- `data-update` - 数据更新通知
  - `type`: 更新类型（behavior, medal, user 等）
  - `data`: 更新的数据

## 数据库结构

数据库文件：`medal_system.db`

### behaviors 表
- id (INTEGER PRIMARY KEY)
- name (TEXT UNIQUE)
- note (TEXT)
- dailyLimit (INTEGER)
- enabled (INTEGER)
- createdAt, updatedAt (DATETIME)

### medals 表
- id (INTEGER PRIMARY KEY)
- icon (TEXT)
- name (TEXT)
- note (TEXT)
- behaviorId (INTEGER)
- module (TEXT)
- type (TEXT)
- tiers (TEXT - JSON格式)
- createdAt, updatedAt (DATETIME)

### users 表
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- actions (TEXT - JSON格式)
- createdAt, updatedAt (DATETIME)

## 数据持久化

✅ **所有操作都会自动保存！**

- 添加、编辑、删除操作会立即保存到数据库
- 关闭浏览器后重新打开，数据仍然存在
- 重启服务器后，数据不会丢失
- 数据库文件：`medal_system.db`（在项目根目录）

### 测试数据持久化

```bash
# 运行测试脚本
npm test

# 或手动测试：
# 1. 启动服务器: npm start
# 2. 在网页上添加一些数据
# 3. 关闭浏览器
# 4. 重新打开浏览器，数据应该还在
```

### 数据备份

```bash
# 手动备份
npm run backup

# 或直接复制数据库文件
cp medal_system.db medal_system_backup.db
```

## 部署到公网

想让其他人也能访问你的网页？查看 [DEPLOY.md](./DEPLOY.md) 获取详细部署指南。

**快速部署方案：**
- **测试用**：使用 ngrok（5分钟完成）
- **长期用**：部署到 Railway（免费，有固定网址）
- **企业用**：使用自己的服务器 + PM2

## 注意事项

1. **数据备份**：定期备份 `medal_system.db` 文件（使用 `npm run backup`）
2. **并发控制**：系统支持多用户同时操作，通过WebSocket实时同步
3. **用户限制**：最多支持10个用户
4. **端口配置**：默认端口3000，可通过环境变量修改

## 故障排除

### 数据库锁定错误
如果遇到数据库锁定，可能是多个进程同时访问。确保只有一个服务器实例在运行。

### WebSocket连接失败
检查防火墙设置，确保WebSocket端口（与HTTP相同）可访问。

### 数据不同步
检查浏览器控制台是否有错误，确认WebSocket连接正常。

## 许可证

MIT

