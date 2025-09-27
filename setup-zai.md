# Z.AI Integration Setup Guide

## Required Environment Variables

Add these variables to your `.env` file:

```env
# Z.AI API Configuration
ZAI_API_KEY=your_zai_api_key_here
ZAI_BASE_URL=https://api.z.ai/api/paas/v4
```

## Getting Your Z.AI API Key

1. Visit [Z.AI Developer Portal](https://docs.z.ai/api-reference/introduction)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key and add it to your `.env` file

## Features Implemented

### 1. Manual Article Generation
- Updated the existing `/generate-article` endpoint to use Z.AI GLM-4.5 model
- Maintains the same frontend interface

### 2. Auto Article Generation
- New method `autoGenerateArticle()` in PageController
- Generates articles with random prompts every minute
- Automatically creates pages in the database

### 3. Console Command
- Command: `php artisan articles:auto-generate`
- Can be run manually or scheduled

### 4. Cron Job Setup
- Added to `routes/console.php` to run every minute
- Use `php artisan schedule:work` for development
- Use system cron for production: `* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1`

## Usage

### Manual Generation
Visit `/article-ai` and use the existing interface to generate articles manually.

### Automatic Generation
Articles will be automatically generated every minute using random prompts from a predefined list.

### Manual Command Execution
```bash
php artisan articles:auto-generate
```

## Monitoring

Check the Laravel logs for generation status:
```bash
tail -f storage/logs/laravel.log
```

## Troubleshooting

1. Ensure your Z.AI API key is valid and has sufficient credits
2. Check that the Z.AI API endpoint is accessible
3. Verify your database connection for page creation
4. Check Laravel logs for any error messages
