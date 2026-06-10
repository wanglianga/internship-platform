# 高校实习岗位管理平台

## 原始需求

> 建设一个给高校就业办、学生、企业导师和院系辅导员使用的实习岗位平台，React 页面呈现岗位池、投递进度、协议状态和风险提醒，Spring Boot 保存学生档案、岗位要求、录用结果和协议流转。企业发布岗位、实习地点、薪资、专业要求和导师；学生维护简历、课程安排、意向城市和投递记录；院系辅导员审核实习是否符合培养方案；就业办处理三方协议、盖章、变更和违约。系统要把岗位发布、学生投递、企业面试、录用确认、院系审核、三方协议和实习报到连成闭环。专业不匹配、重复签约、企业撤岗、学生违约要分别影响协议和岗位状态。

## 项目简介

高校实习岗位管理平台，面向高校就业办、学生、企业导师和院系辅导员四类角色，实现从岗位发布到实习报到的全流程闭环管理。系统通过岗位池展示、投递进度追踪、三方协议流转和风险自动预警，解决实习管理中信息分散、流程脱节、风险难控的核心痛点。

### 用户角色

| 角色 | 核心职责 |
|------|----------|
| 高校就业办 | 三方协议管理、盖章审批、协议变更、违约处理、全局数据查看 |
| 学生 | 维护简历、课程安排、意向城市、投递岗位、查看投递进度和协议状态 |
| 企业导师 | 发布岗位、设置薪资/地点/专业要求、面试管理、录用确认、撤岗操作 |
| 院系辅导员 | 审核实习是否符合培养方案、查看本院系学生实习情况 |

### 核心页面

- **工作台仪表盘**：角色定制化统计概览、待办事项、风险提醒快捷入口、最近动态
- **岗位池**：岗位列表与筛选、岗位详情、企业岗位发布/撤岗
- **投递管理**：投递进度追踪、面试安排、录用确认
- **协议管理**：三方协议生成、盖章审批、协议变更、违约处理
- **风险提醒**：专业不匹配预警、重复签约检测、企业撤岗影响、学生违约告警
- **学生档案**：简历维护、课程安排、意向城市、投递记录汇总
- **审核中心**：院系审核实习合规性、就业办审核协议

## 技术栈

- **前端**：React 18 + TypeScript + Tailwind CSS + Zustand + React Router DOM + Axios + date-fns + Lucide React
- **后端**：Spring Boot 3.2.x + Spring Data JPA + H2 Database + Lombok
- **数据库**：H2 内存数据库（开发环境，无需额外安装）
- **容器化**：Docker + Docker Compose + Nginx

## 启动方式

### 前置要求

- Node.js 18+（前端开发）
- Java 17+（后端开发）
- Maven 3.9+（后端构建）
- pnpm（前端包管理器）
- Docker + Docker Compose（容器化部署）

### Docker 一键启动（推荐）

#### 1. 构建并启动所有服务

```bash
docker compose up --build
```

后台运行：

```bash
docker compose up --build -d
```

#### 2. 访问地址

- 前端页面：http://localhost:3000
- 后端 API：http://localhost:8080/api

#### 3. 停止并清理服务

```bash
docker compose down
```

### 本地开发启动

#### 1. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端启动后访问 http://localhost:8080/api/dashboard 验证 API 是否正常。

#### 2. 安装前端依赖

```bash
pnpm install
```

#### 3. 启动前端开发服务器

```bash
pnpm dev
```

访问地址：http://localhost:5173

前端通过 Vite 代理将 `/api` 请求转发到后端 `http://localhost:8080`。

## 项目结构

```
wl-287/
├── src/                          # React 前端源码
│   ├── components/               # 通用组件（Layout, StatCard, Modal, DataTable, StatusBadge）
│   ├── pages/                    # 页面组件（Dashboard, Jobs, Applications, Agreements, Risks, Students, Reviews）
│   ├── services/api.ts           # API 调用服务
│   ├── stores/appStore.ts        # Zustand 状态管理
│   ├── types/index.ts            # TypeScript 类型定义
│   └── App.tsx                   # 路由配置
├── backend/                      # Spring Boot 后端
│   ├── src/main/java/com/intern/
│   │   ├── controller/           # REST 控制器
│   │   ├── service/              # 业务逻辑层
│   │   ├── repository/           # 数据访问层
│   │   ├── entity/               # JPA 实体
│   │   ├── dto/                  # 数据传输对象
│   │   └── config/               # 配置类（CORS, 数据初始化）
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml            # Docker Compose 编排
├── Dockerfile                    # 前端 Docker 构建文件
├── nginx.conf                    # Nginx 反向代理配置
├── .dockerignore
└── README.md
```

## 闭环流程

```
企业发布岗位 → 学生投递简历 → 企业安排面试 → 企业确认录用 → 院系审核 → 就业办生成三方协议 → 就业办盖章 → 协议生效 → 学生实习报到
```

- 企业导师在平台上发布实习岗位，学生浏览岗位池后投递简历
- 专业不匹配时自动触发风险预警，院系审核自动标记
- 重复签约时系统检测并阻止新投递进入录用确认
- 企业撤岗时所有待处理投递自动终止，已有协议标记待变更
- 学生违约时协议状态变更为已违约，学生标记违约记录影响后续投递
- 就业办盖章后协议生效，学生完成实习报到后流程闭环
