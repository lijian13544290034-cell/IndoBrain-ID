# AI Provider 配置

在项目根目录创建 `.env.local`，选择一个 Provider：

```env
AI_PROVIDER=openai
AI_MODEL=gpt-5-mini
OPENAI_API_KEY=your_key
```

可切换配置：

```env
AI_PROVIDER=gemini
AI_MODEL=gemini-2.0-flash
GEMINI_API_KEY=your_key
```

```env
AI_PROVIDER=openrouter
AI_MODEL=openai/gpt-4o-mini
OPENROUTER_API_KEY=your_key
```

```env
AI_PROVIDER=groq
AI_MODEL=llama-3.3-70b-versatile
GROQ_API_KEY=your_key
```

DeepSeek 与 Qwen 使用相同结构，分别设置 `AI_PROVIDER=deepseek` / `qwen` 和对应 Key。聊天业务代码无需修改。
