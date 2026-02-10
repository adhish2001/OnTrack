# Migration Guide - OnTrack v3 (Categories & Analytics)

## What's New in v3

### 🏷️ Categories
- Create custom categories to group your time blocks (e.g., "Self-Study", "Miscellaneous", "Work")
- Assign colors to categories for visual organization
- Edit and delete categories
- Each time block can be assigned to a category

### 📊 Analytics
- View time breakdown by category
- Select custom date ranges (this week, this month, etc.)
- See percentage distribution of your time
- Track how many hours spent on each category

### ✏️ Enhanced Editing
- Edit existing habit logs
- Edit existing time blocks
- All edits now support category assignment

## Database Changes

**New table added:** `categories`
**Modified table:** `time_blocks` now has a `category_id` column

## Migration Instructions

### Option 1: Fresh Install (Recommended)
If you're just starting or don't have much data yet:

1. Stop your current app (Ctrl+C)
2. Backup your old database (optional):
   ```bash
   cp data/ontrack.db data/ontrack_backup.db
   ```
3. Replace all files with the new version
4. Restart the app:
   ```bash
   source venv/bin/activate  # if using venv
   python app.py
   ```

The app will automatically create the new `categories` table.

### Option 2: Keep Existing Data
If you have important data to preserve:

1. Stop your current app
2. Backup your database:
   ```bash
   cp data/ontrack.db data/ontrack_backup.db
   ```
3. Replace all files EXCEPT the data folder
4. Run this SQL command to update your database:
   ```bash
   sqlite3 data/ontrack.db
   ```
   
   Then paste this SQL:
   ```sql
   -- Create categories table
   CREATE TABLE IF NOT EXISTS categories (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL UNIQUE,
       color TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Add category_id column to time_blocks if it doesn't exist
   -- Note: SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS
   -- So we'll try and ignore if it fails
   ALTER TABLE time_blocks ADD COLUMN category_id INTEGER;
   
   -- Exit sqlite
   .exit
   ```
   
   If you get an error about the column already existing, that's fine - just ignore it.

5. Restart the app:
   ```bash
   source venv/bin/activate  # if using venv
   python app.py
   ```

## Using the New Features

### Creating Categories

1. Go to the **Categories** tab
2. Enter a category name (e.g., "Self-Study")
3. Pick a color
4. Click "Add Category"

**Example categories you might create:**
- 🎓 Self-Study (blue) - for LeetCode, studying, learning
- 🏃 Health (green) - for gym, exercise, meal prep
- 🏠 Miscellaneous (gray) - for eating, shower, chores
- 💼 Work (purple) - for work tasks
- 🚗 Errands (orange) - for driving, shopping
- 😴 Rest (dark blue) - for sleep, relaxation

### Assigning Time Blocks to Categories

**When creating a new time block:**
1. Fill in start time, end time, activity
2. Select a category from the dropdown (or leave as "No category")
3. Click "Add Block"

**Editing existing time blocks:**
1. Find the time block in "Today's Schedule"
2. Click "Edit"
3. Change the category dropdown
4. Click "Save"

### Viewing Analytics

1. Go to the **Analytics** tab
2. Select date range (defaults to this week)
3. Click "View Analytics"
4. See breakdown by category with:
   - Total hours per category
   - Percentage of time
   - Number of time blocks
   - Visual progress bars

**Pro tip:** Compare different weeks to see how your time allocation changes!

## Troubleshooting

### "No module named 'categories'" error
- Make sure you updated **app.py** to the new version

### Categories dropdown is empty
- Go to Categories tab and create some categories first
- Refresh the page

### Old time blocks don't show categories
- That's normal! Old blocks will show as "Uncategorized"
- You can edit them to assign categories

### Database error on startup
- Your old database might be incompatible
- Restore from backup and try the migration SQL again
- Or start fresh and re-import from CSV exports

## Need Help?

Check the main README.md for detailed setup instructions.

Happy tracking! 📊
