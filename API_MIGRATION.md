# API Migration Guide

This document outlines the changes made to migrate from mock data to real backend API endpoints.

## Changes Made

### 1. New API Client (`src/lib/api-client.ts`)
- Created a centralized API client that communicates with the NestJS backend
- Handles authentication via JWT tokens
- Provides methods for all major API operations

### 2. Updated Services
All service files have been updated to use real API calls instead of localStorage mock data:

- **`task.service.ts`**: Now uses `/api/daily-tasks` endpoints
- **`report.service.ts`**: Now uses `/api/daily_reports` endpoints  
- **`checkInService.ts`**: Now uses `/api/check-ins` endpoints
- **`hod.service.ts`**: Now uses `/api/internships` endpoints

### 3. Updated API Interface (`src/lib/api.ts`)
- Maintained compatibility with existing components
- Routes legacy API calls to the new API client
- Handles authentication token management

### 4. Configuration
- **Backend URL**: Set via `NEXT_PUBLIC_API_URL` environment variable (defaults to `http://localhost:3001`)
- **Environment files**: Created `.env.local` and `.env.development`

### 5. Data Fetching Hooks (`src/hooks/useApiData.ts`)
- Created `useFaculties()` and `useDepartments()` hooks for components to fetch data from API
- Provides loading states and error handling

## Backend Requirements

Ensure your NestJS backend is running on `http://localhost:3001` with the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration  
- `GET /api/users/me` - Get current user profile

### Core Resources
- `GET /api/faculties` - Get all faculties
- `GET /api/departments` - Get departments (optional query: `?faculty_id=X`)
- `GET /api/companies` - Get all companies
- `GET /api/students` - Get students
- `GET /api/internships` - Get internships

### Daily Operations
- `GET /api/daily-tasks` - Get daily tasks
- `POST /api/daily-tasks` - Create daily task
- `PUT /api/daily-tasks/:id` - Update daily task

- `GET /api/daily_reports` - Get daily reports  
- `POST /api/daily_reports` - Create daily report
- `PUT /api/daily_reports/:id` - Update daily report

### Check-ins (if implemented)
- `GET /api/check-ins` - Get check-ins
- `POST /api/check-ins` - Create check-in
- `PUT /api/check-ins/:id` - Update check-in

## Migration Status

✅ **Completed:**
- API client setup
- Service layer migration
- Authentication flow
- Environment configuration

🚧 **In Progress:**
- Component migration to use API hooks
- Error handling improvements
- Loading state management

📋 **TODO:**
- Update remaining components to use `useFaculties()` and `useDepartments()` hooks
- Implement proper error boundaries
- Add retry logic for failed API calls
- Add API response caching

## Running the Application

1. **Start the backend:**
   ```bash
   cd internship-hub-backend
   npm run start:dev
   ```

2. **Start the frontend:**
   ```bash
   cd Internship-Hub-frontend
   npm run dev
   ```

3. **Verify connection:**
   - Frontend should be available at `http://localhost:3000`
   - Backend should be available at `http://localhost:3001`
   - Check browser console for any API connection errors

## Troubleshooting

### Common Issues:

1. **CORS errors**: Ensure backend has CORS enabled for frontend URL
2. **Authentication errors**: Check JWT token handling in both frontend and backend
3. **404 errors**: Verify backend endpoints match the ones used in api-client.ts
4. **Type mismatches**: Update TypeScript types to match backend response format

### Development Tips:
- Use browser DevTools Network tab to monitor API calls
- Check backend console for detailed error messages
- Verify environment variables are loaded correctly
