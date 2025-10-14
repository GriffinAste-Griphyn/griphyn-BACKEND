# Newest-GRIPHYN

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/griffin-ctreamingcos-projects/v0-newest-griphyn)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/kEfcH6V6NvD)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/griffin-ctreamingcos-projects/v0-newest-griphyn](https://vercel.com/griffin-ctreamingcos-projects/v0-newest-griphyn)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/kEfcH6V6NvD](https://v0.app/chat/projects/kEfcH6V6NvD)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Local assistant setup

The in-app assistant calls OpenAI through `/api/assistant`. To enable it locally, create a `.env.local` file in the project root and add:

```bash
OPENAI_API_KEY=sk-your-key-here
# Optional: point assistant at your backend API.
# Use http://localhost:4000 when running the API locally,
# or https://griphyn-backend.onrender.com for the hosted Render instance.
DEALS_API_BASE_URL=http://localhost:4000
```

Restart `npm run dev` after setting the key. Without this variable the endpoint will reply with a 500 error noting the missing key.
