#!/bin/bash

# Script to check if the auto-article generation cron is working
# Run this script to monitor the system

echo "=== Laravel Auto-Article Generation Cron Monitor ==="
echo "Current time: $(date)"
echo ""

echo "1. Checking crontab:"
crontab -l
echo ""

echo "2. Checking cron service status:"
systemctl is-active cron
echo ""

echo "3. Recent cron logs (last 10 lines):"
tail -n 10 /var/log/syslog | grep CRON
echo ""

echo "4. Laravel scheduler log (if exists):"
if [ -f /var/log/laravel-scheduler.log ]; then
    echo "Recent scheduler activity:"
    tail -n 5 /var/log/laravel-scheduler.log
else
    echo "Scheduler log not found yet (will be created on first run)"
fi
echo ""

echo "5. Testing manual command execution:"
cd /var/www/bintangmfhd.com/resource-docs
php artisan articles:auto-generate
echo ""

echo "6. Recent Laravel logs:"
tail -n 5 storage/logs/laravel-$(date +%Y-%m-%d).log 2>/dev/null || echo "No logs for today yet"
echo ""

echo "=== Monitor complete ==="
