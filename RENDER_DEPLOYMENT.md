# AnuCode - Render Deployment Guide

This guide will help you deploy both the AnuCode backend API and web app to Render.

## Prerequisites

1. A [Render account](https://render.com) (free tier available)
2. Your GitHub repository connected to Render
3. Required API keys (Anthropic, MongoDB, etc.)

## Deployment Methods

### Method 1: Using render.yaml (Recommended)

The project includes a `render.yaml` file that automatically configures deployment for both services.

1. **Connect Repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

2. **Configure Environment Variables**

   In the Render dashboard, set these environment variables for the **API service**:

   **Required:**
   - `ANTHROPIC_API_KEY` - Your Anthropic API key
   - `MONGODB_URI` - Your MongoDB connection string
   - `ALLOWED_ORIGINS` - Frontend URLs (comma-separated)
     ```
     https://anucode-web.onrender.com
     ```

   **Optional:**
   - `DATABASE_URL` - PostgreSQL connection string (if using)
   - `REDIS_URL` - Redis connection string (if using)
   - `OPENAI_API_KEY` - OpenAI API key (if using)

3. **Deploy**
   - Click "Apply" to create both services
   - Render will automatically build and deploy:
     - **API Backend**: `https://anucode-api.onrender.com`
     - **Web App**: `https://anucode-web.onrender.com`

### Method 2: Manual Web Service Setup

1. **Create New Web Service**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your repository

2. **Configure Build Settings**
   - **Name:** `anucode-api`
   - **Region:** Singapore (or closest to you)
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:**
     ```bash
     cd apps/api && npm install && npm run build
     ```
   - **Start Command:**
     ```bash
     cd apps/api && npm start
     ```

3. **Set Environment Variables** (same as above)

4. **Advanced Settings**
   - **Health Check Path:** `/health`
   - **Auto-Deploy:** Yes

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | `production` |
| `PORT` | Server port | No | `10000` (auto-set by Render) |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI features | Yes | `sk-ant-...` |
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://...` |
| `ALLOWED_ORIGINS` | Allowed CORS origins | Yes | `https://app.com` |
| `DATABASE_URL` | PostgreSQL connection (optional) | No | `postgresql://...` |
| `REDIS_URL` | Redis connection (optional) | No | `redis://...` |
| `JWT_SECRET` | Secret for JWT tokens | Auto | Auto-generated |
| `WORKSPACE_ROOT` | Workspace directory path | No | `/tmp/workspace` |

## Post-Deployment

### 1. Test Your Deployment

Visit your health check endpoint:
```
https://your-service.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "ai": "initialized",
    "mcp": "initialized",
    "context": "initialized"
  }
}
```

### 2. Update Frontend Configuration

Update your frontend to point to the deployed API:

```javascript
// In your frontend config
const API_URL = 'https://your-service.onrender.com';
```

### 3. Configure CORS

Make sure to add your frontend URL to `ALLOWED_ORIGINS`:
```
https://your-frontend.onrender.com,https://yourdomain.com
```

## Troubleshooting

### Build Fails

1. Check build logs in Render dashboard
2. Ensure all dependencies are listed in `package.json`
3. Verify TypeScript compiles locally: `npm run build`

### Service Not Starting

1. Check if all required environment variables are set
2. Review service logs in Render dashboard
3. Verify the start command is correct

### AI Features Not Working

1. Verify `ANTHROPIC_API_KEY` is set correctly
2. Check API key is valid and has credits
3. Review logs for API errors

### Socket.IO Connection Issues

1. Ensure `ALLOWED_ORIGINS` includes your frontend URL
2. Check that WebSocket connections are not blocked
3. Verify frontend is using HTTPS (not HTTP)

## Free Tier Limitations

Render's free tier includes:
- ✅ 750 hours/month (enough for 1 service)
- ✅ Automatic SSL certificates
- ✅ Automatic deployments from Git
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes 30-60 seconds

**Note:** For production use, consider upgrading to a paid plan to avoid spin-down delays.

## Scaling to Paid Tier

For better performance:
1. Upgrade to "Starter" or higher plan ($7/month)
2. No spin-down delays
3. Better performance and reliability
4. More memory and CPU

## Monitoring

Render provides:
- Real-time logs
- Metrics dashboard
- Alerts for downtime
- Deployment history

Access these in your service dashboard.

## Custom Domain

To use a custom domain:
1. Go to service settings
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records as instructed

## Database Setup (Optional)

If you need PostgreSQL or Redis:

1. **Add PostgreSQL:**
   - Create new PostgreSQL database in Render
   - Copy connection string
   - Add to `DATABASE_URL` environment variable

2. **Add Redis:**
   - Create Redis instance in Render
   - Copy connection string
   - Add to `REDIS_URL` environment variable

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- Check service logs for errors

## Next Steps

1. ✅ Deploy API to Render
2. ✅ Configure environment variables
3. ✅ Test health endpoint
4. ✅ Update frontend configuration
5. ✅ Test full application
6. 📊 Monitor logs and performance
7. 🚀 Deploy frontend (if needed)
