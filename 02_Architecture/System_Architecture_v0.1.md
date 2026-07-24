# System Architecture v0.1

Project: IndoBrain

Version: 0.1

---

# 1. System Vision

IndoBrain 不是一个普通 AI Chat。

它是一个持续成长的 Experience Engine。

目标不是回答问题，而是积累经验。

所有模块都围绕 Experience Engine 展开。

---

# 2. Overall Architecture

                User
                  │
                  ▼
        PWA(Web / Mobile)
                  │
                  ▼
          AI Conversation
                  │
                  ▼
        Experience Brain
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
   Intent      Memory     Experience
 Recognition              Retrieval
      │                       │
      └───────────┬───────────┘
                  ▼
            AI Response
                  │
                  ▼
        Experience Learning
                  │
                  ▼
      Experience Database

---

# 3. Core Modules

## 3.1 Conversation Layer

负责：

- 聊天
- 语音
- 翻译
- 场景沟通

所有用户入口只有一个：

Chat。

---

## 3.2 Experience Brain

负责理解用户真正的需求。

包含四个能力：

Role Recognition

识别角色：

- 保姆
- 司机
- 工厂员工
- 客户
- 银行

Task Recognition

识别任务：

例如：

做饭

请假

买菜

发工资

开户

Intent Recognition

真正目的：

翻译？

解决问题？

学习？

Memory Retrieval

读取用户历史。

---

## 3.3 Experience Engine

整个系统核心。

Experience Loop：

Event

↓

Task

↓

Dialogue

↓

Experience

↓

Learning

↓

Next User

任何聊天都必须进入这个闭环。

---

## 3.4 Memory Engine

保存：

用户成长。

用户偏好。

历史聊天。

学习记录。

而不是简单保存聊天。

---

## 3.5 Learning Engine

每天自动运行。

负责：

分类。

总结。

提炼。

经验升级。

形成新的 Experience。

---

# 4. Experience Database

数据库主要包含：

Role

Scenario

Task

Dialogue

Vocabulary

Culture

Experience

Solution

Success Rate

Feedback

---

# 5. Data Flow

用户发送消息

↓

Experience Brain

↓

识别：

Role

Task

Intent

↓

调用 Experience

↓

AI 回复

↓

保存聊天

↓

Learning Engine

↓

经验升级

↓

更新数据库

---

# 6. Product Principles

第一：

先解决问题。

第二：

学习语言只是副产品。

第三：

经验比知识重要。

第四：

真实聊天比教材重要。

第五：

AI 每天成长。

---

# 7. Future Expansion

所有行业都复用同一个 Experience Engine。

例如：

Nanny

Driver

Factory

Trade

Restaurant

Beauty

Hospital

Bank

Government

无需修改系统。

只新增 Experience Module。

---

# 8. Long-term Barrier

真正的壁垒不是 AI 模型。

而是：

Experience Database。

Experience Brain。

Experience Loop。

这是整个产品最核心的竞争力。
