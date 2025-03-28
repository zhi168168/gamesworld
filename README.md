# GamesWorld.ink 游戏平台

GamesWorld.ink是一个现代化的HTML5游戏平台，提供丰富的在线游戏体验。平台支持游戏分类、搜索、管理和用户交互功能。

## 主要功能

- 游戏浏览与搜索
- 分类过滤
- 游戏详情页面
- 管理员控制面板
- 游戏添加与编辑（带图片裁剪功能）
- 响应式设计（适配移动端与桌面端）

## 技术栈

- **前端**: React.js, Bootstrap 5, React Router
- **后端**: Node.js, Express.js
- **数据库**: MongoDB
- **图片处理**: react-image-crop

## 安装与运行

### 前置条件

- Node.js (v14+)
- MongoDB (v4+)

### 安装步骤

1. 克隆仓库
   ```
   git clone https://github.com/zhi168168/gamesworld.git
   cd gamesworld
   ```

2. 安装依赖
   ```
   # 安装前端依赖
   cd frontend
   npm install
   
   # 安装后端依赖
   cd ../backend
   npm install
   ```

3. 配置环境变量
   - 在backend目录创建.env文件:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/gamesworld
   JWT_SECRET=your_jwt_secret
   ```

4. 启动服务
   ```
   # 启动后端
   cd backend
   npm start
   
   # 在另一个终端启动前端
   cd frontend
   npm start
   ```

5. 访问应用
   - 前端: http://localhost:3000
   - 后端API: http://localhost:5001

## 管理员访问

1. 创建管理员账号:
   ```
   用户名: admin
   密码: admin123
   ```

2. 访问管理员面板: http://localhost:3000/admin

## 开发者文档

- 前端结构位于`frontend`目录
- 后端API位于`backend`目录
- 游戏图片上传保存在`backend/uploads`目录

## 许可

MIT

## 联系方式

项目维护: GamesWorld.ink 团队 