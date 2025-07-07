# Deployment Guide

## Quick Deployment Steps

### 1. Frontend Deployment (Vercel)

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables:
     \`\`\`
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
     NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.railway.app
     \`\`\`
   - Deploy

### 2. Backend Deployment (Railway)

1. **Prepare Backend**
   \`\`\`bash
   cd backend
   # Ensure package.json has start script
   \`\`\`

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repository
   - Select backend folder
   - Set environment variables:
     \`\`\`
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collaborative-todo
     JWT_SECRET=your-production-jwt-secret
     NODE_ENV=production
     PORT=5000
     \`\`\`
   - Deploy

### 3. Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create free cluster
   - Create database user
   - Whitelist IP addresses (0.0.0.0/0 for deployment)

2. **Get Connection String**
   - Copy connection string
   - Replace username/password
   - Update backend environment variables

### 4. Final Steps

1. **Update Frontend Environment**
   - Update Vercel environment variables with backend URL
   - Redeploy frontend

2. **Test Deployment**
   - Visit deployed frontend URL
   - Test all features
   - Check real-time functionality

## Environment Variables Checklist

### Frontend (Vercel)
- [ ] `NEXT_PUBLIC_API_URL`
- [ ] `NEXT_PUBLIC_SOCKET_URL`

### Backend (Railway)
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET`
- [ ] `NODE_ENV`
- [ ] `PORT`

## Troubleshooting

### Common Issues
1. **CORS Errors**: Update backend CORS configuration
2. **Socket Connection**: Ensure WebSocket support on hosting platform
3. **Database Connection**: Check MongoDB Atlas IP whitelist
4. **Environment Variables**: Verify all variables are set correctly

### Debug Steps
1. Check deployment logs
2. Test API endpoints directly
3. Verify database connectivity
4. Check browser console for errors
