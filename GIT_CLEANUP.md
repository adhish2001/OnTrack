# Removing Database from Git History

## If you already pushed the database to GitHub:

### Step 1: Remove from Git tracking (but keep locally)
```bash
cd /path/to/ontrack

# Remove data directory from Git but keep it locally
git rm -r --cached data/

# Or just the database file
git rm --cached data/ontrack.db
```

### Step 2: Add .gitignore
```bash
# The .gitignore file is already in your project
# Just make sure it's there
cat .gitignore
```

### Step 3: Commit the changes
```bash
git add .gitignore
git commit -m "Add .gitignore and remove database from tracking"
```

### Step 4: Push to GitHub
```bash
git push origin main
# or: git push origin master (depending on your branch name)
```

## IMPORTANT: Remove from Git History (Optional but Recommended)

The database is still in your Git history even after removing it. To completely remove it:

### Option 1: Using git filter-repo (Recommended)
```bash
# Install git-filter-repo
# On Arch: sudo pacman -S git-filter-repo

# Remove data directory from entire history
git filter-repo --path data/ --invert-paths

# Force push (WARNING: This rewrites history!)
git push origin --force --all
```

### Option 2: Using BFG Repo-Cleaner
```bash
# Download BFG
# https://rsepassi.github.io/bfg-repo-cleaner/

# Remove the database
java -jar bfg.jar --delete-files ontrack.db

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

## ⚠️ Important Notes:

1. **Force pushing rewrites history** - only do this if you're the only one using the repository, or coordinate with your team

2. **Anyone who cloned before** will need to re-clone after you force push

3. **Your local data is safe** - the `.gitignore` ensures your `data/` folder stays local only

## What happens after this:

✅ Your database stays on your computer in `data/ontrack.db`
✅ Future commits won't include the database
✅ Your data is private and secure
✅ You can still export CSVs and commit them if needed (just add them to exports/)

## Recommended: Backup Strategy

Since your database won't be on GitHub, make sure to:

1. **Regular CSV exports** (weekly/monthly)
2. **Local backups** of the `data/` folder
3. **Cloud backup** (Dropbox, Google Drive, etc.) for the database file

## Quick Backup Command
```bash
# Create a backup
cp data/ontrack.db data/ontrack_backup_$(date +%Y%m%d).db

# Or use the app's CSV export feature
# Go to Export tab → Download both CSVs
```
