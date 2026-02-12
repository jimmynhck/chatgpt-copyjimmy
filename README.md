# ChatGPT Clone

A ChatGPT clone built with Next.js, React, and Tailwind CSS.

## Features

- 💬 Chat interface similar to ChatGPT
- 📝 Markdown support for formatted responses
- 💾 Chat history with multiple conversations
- 📱 Responsive design (mobile-friendly)
- 🤖 Powered by OpenRouter's free AI API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chatgpt-copy.git
cd chatgpt-copy/my-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variable (optional):
   - `OPENROUTER_API_KEY` - Get a free key at [openrouter.ai/keys](https://openrouter.ai/keys)
4. Deploy!

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | API key for OpenRouter AI | No (falls back to demo mode) |

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- OpenRouter API (free tier)

## License

MIT