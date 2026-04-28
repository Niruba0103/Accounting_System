# Railway Database Backup Setup Guide

## How to Enable Automatic Backups on Railway

Railway automatically creates daily backups of your PostgreSQL/MySQL database. Here's how to access and manage them:

### Step 1: Access Your Railway Dashboard
1. Go to https://railway.app
2. Login with your account
3. Select your project
4. Click on your database service

### Step 2: Enable Automatic Backups
1. In the Database settings, look for "Backups" section
2. Backups are **automatically enabled** for all paid Railway plans
3. Backups are created daily and retained for 7-30 days (depending on your plan)

### Step 3: Manual Backup (Before Major Changes)
```sql
-- Create a backup export (via railway CLI)
railway backup create

-- View existing backups
railway backup list

-- Restore from backup
railway backup restore --backup-id <backup-id>
```

### Step 4: View Backup Storage
1. In Railway Dashboard → Database → Backups tab
2. Shows all available backups with timestamps
3. Restore point-in-time recovery available

## Backup Frequency & Retention

**Free Plan:**
- 1 automatic backup per day
- 7-day retention

**Pro Plan ($5/month):**
- Multiple backups per day
- 30-day retention

**Business Plan:**
- Hourly backups
- Custom retention

## Best Practices

1. **Before major operations** (bulk deletes, migrations):
   - Manually create a backup via Railway dashboard
   - Test changes on staging first

2. **Monitor backup status:**
   - Check Railway dashboard weekly
   - Ensure backups are completing successfully

3. **Document restore procedures:**
   - Know how to access and restore from backups
   - Test restore process monthly

4. **Use soft deletes for critical data:**
   - Implement soft deletes for important records
   - Mark as deleted instead of permanent removal
   - Allows easy recovery of accidentally deleted data

## Emergency Recovery

If you need to restore from a backup:

1. **Via Railway Dashboard:**
   - Click "Restore" on the desired backup
   - System will restore to that point in time
   - Takes 5-15 minutes depending on database size

2. **Via CLI:**
   ```bash
   npm install -g @railway/cli
   railway backup restore --backup-id <id>
   ```

## Additional Safety: Audit Log

In addition to backups, we'll implement an audit log table that tracks:
- What data was deleted
- When it was deleted
- Who deleted it
- Can be restored manually if needed

See the audit_log setup in the migration files.
