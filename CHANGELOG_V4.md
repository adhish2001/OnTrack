# OnTrack v4 - CHANGELOG

## 🎉 Major New Features

### 1. Tasks System
- **Create tasks** within categories (e.g., "Math", "Science" under "Self-Study")
- **Assign tasks to time blocks** for granular tracking
- **Filter analytics by task** - see exactly how much time spent on Math vs Science
- **Task autocomplete** - when selecting a category, only relevant tasks show up
- **Edit and delete tasks**

**Use Case:** You can now group "LeetCode" and "AWS Study" as "Self-Study" category, but track them separately as tasks to see individual breakdowns.

### 2. Habit Percentage Tracking
- **New target type:** Percentage (0-100%)
- Great for habits with partial completion
- Example: "Study 1 hour" can be logged as 50% if you only studied 30 minutes
- **Visual indicators** showing percentage completion
- **Analytics** track average completion percentage

**How to use:**
1. Create a Daily Habit
2. Select "Percentage (0-100%)" as the target type
3. Log with any value from 0-100%

### 3. Comprehensive Analytics
Three separate analytics views:

**Category Analytics:**
- See time distribution across categories
- Percentage breakdowns with visual progress bars
- Total time tracked per category

**Task Analytics:**
- Drill down into specific tasks
- See which Math topics or coding problems you spent most time on
- Filter by category or view all tasks

**Habit Analytics:**
- Track habit completion rates over time
- For daily habits: completion percentage and streak data
- For project habits: progress toward hour goals
- For percentage habits: average completion rates

### 4. CSV Import
- **Import habits** from previously exported CSVs
- **Import time blocks** to restore your data
- Useful for:
  - Migrating between devices
  - Restoring from backups
  - Bulk data entry
- Shows import success count and any errors

## 📊 Enhanced Features

### Time Tracking
- Time blocks now support both category AND task assignment
- Task dropdown auto-populates based on selected category
- See both category and task badges on each time block
- Edit time blocks to change task assignment

### Habit Tracking
- Three types of daily habits: Binary (Yes/No), Percentage, or Project-based
- Better visual indicators for different habit types
- Enhanced editing with support for all new fields

### Analytics Date Ranges
- Select custom date ranges
- Default to "this week" for quick access
- View trends over time

## 🔧 Technical Improvements

### Database Schema Updates
New tables:
- `tasks` - stores individual tasks linked to categories
- Updated `time_blocks` - now includes `task_id` column
- Updated `habits` - now includes `target_type` column
- Updated `habit_logs` - now includes `completion_percentage` column

### API Endpoints Added
- `/api/tasks` - GET, POST
- `/api/tasks/<id>` - PUT, DELETE
- `/api/analytics/tasks` - GET task analytics
- `/api/analytics/habits` - GET habit analytics
- `/import/habits` - POST CSV import
- `/import/timeblocks` - POST CSV import

### Export Enhancements
- CSV exports now include category and task names
- Better column organization

## 📝 Migration from v3

### Automatic Migration
The app will automatically create the new database columns when you first run it.

### Manual Steps Required
If you're upgrading from v3, you may need to:

1. **Update database schema** (run in sqlite3):
```sql
ALTER TABLE habits ADD COLUMN target_type TEXT DEFAULT 'binary';
ALTER TABLE habit_logs ADD COLUMN completion_percentage INTEGER;
ALTER TABLE time_blocks ADD COLUMN task_id INTEGER;

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);
```

2. **Or:** Start fresh and use CSV import to restore your data

## 🎯 Example Workflows

### Workflow 1: Student Tracking Study Time
1. Create category "Self-Study" (blue color)
2. Create tasks: "Math", "Physics", "Chemistry"
3. Add time blocks:
   - 2:00-4:00 PM, "Calculus homework", Self-Study → Math
   - 4:00-5:00 PM, "Lab report", Self-Study → Physics
4. View analytics to see: "I spent 2 hours on Math and 1 hour on Physics this week"

### Workflow 2: Habit with Partial Completion
1. Create daily habit "Exercise 30 minutes" with Percentage type
2. On days you only exercise 15 minutes, log 50%
3. View habit analytics to see average completion: "You averaged 75% completion this month"

### Workflow 3: Project Management
1. Create category "Work" (purple)
2. Create tasks: "Frontend", "Backend", "Meetings"
3. Track time blocks with specific tasks
4. View task analytics: "Spent 15 hours on Frontend, 10 on Backend, 5 in Meetings"

## 🐛 Bug Fixes
- Fixed category deletion not removing associated tasks
- Improved error handling for CSV imports
- Better validation for time block duration calculations
- Fixed progress bar percentage calculations

## 🚀 Performance
- Optimized database queries with proper JOIN statements
- Reduced redundant API calls
- Lazy loading for task dropdowns

## 💡 Tips

1. **Organize your categories first** before creating tasks
2. **Use descriptive task names** for better analytics insights
3. **Export your data weekly** as a backup
4. **Review analytics regularly** to understand your time usage patterns
5. **For percentage habits**, be honest about partial completion - the analytics will help you improve!

## 📦 Files Changed
- `app.py` - Added tasks API, analytics endpoints, import functionality
- `templates/index.html` - New task management UI, enhanced analytics
- `static/js/app.js` - Complete rewrite with all new features
- `static/css/style.css` - New badge styles for tasks

## Next Steps

After upgrading, try this:
1. Create a few categories
2. Add some tasks under each category
3. Log a week of time blocks with tasks
4. View the analytics to see your time breakdown!

Enjoy the enhanced tracking! 📊✨
