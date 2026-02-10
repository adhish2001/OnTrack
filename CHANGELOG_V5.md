# OnTrack v5 - CHANGELOG

## 🎉 Major New Features

### 1. ⏱️ Stopwatch Feature
**Live time tracking with automatic block creation!**

- **Start/Stop timer** - Click start when you begin a task
- **Break tracking** - Take breaks without stopping the task timer
- **Auto-save to schedule** - Automatically creates time blocks when you stop
- **Category & Task selection** - Choose what you're working on before starting
- **Visual display** - Large stopwatch display with active/break time tracking

**How it works:**
1. Select category and task (optional)
2. Click "Start" - timer begins
3. Click "Break" if you take a break (deducts from active time)
4. Click "Stop" - automatically saves to your schedule
5. See both "Active Time" and "Break Time" in your time blocks

**Use case:** Perfect for Pomodoro technique, study sessions, or any activity where you want precise time tracking.

### 2. 📊 Times Habit Type
**Track numeric values for habits!**

- **New habit type: "Times"** - count anything numeric
- **Target values** - set goals (e.g., 2000 calories, 100 push-ups)
- **Progress tracking** - see how close you are to your target
- **Flexible use cases:**
  - Macro tracking (protein, calories, water intake)
  - Exercise reps (push-ups, sit-ups)
  - Pages read
  - Steps walked
  - Anything you want to count!

**Example habits:**
- "Protein intake" - Target: 150g
- "Push-ups" - Target: 100 reps
- "Water" - Target: 8 glasses
- "Pages read" - Target: 50 pages

### 3. 🐳 Docker Support
**Easy deployment with Docker!**

- **Dockerfile** included for containerization
- **docker-compose.yml** for one-command deployment
- **Volume mounting** for data persistence
- **Production-ready** setup

**Benefits:**
- Consistent environment across all platforms
- Easy to deploy to any server
- No Python version conflicts
- Portable - works on Linux, Mac, Windows, Raspberry Pi

## 🔄 Enhanced Features

### Scheduler Improvements
- **Start time defaults to 00:00** (midnight)
- **Auto-increments** - next start time = previous end time
- **Notes field optional** - Category + Task provide enough detail
- **Duration display** - shows both minutes and hours

### Habit Types Summary
Now **three** habit types:

1. **Daily Habit**
   - Binary (Yes/No)
   - Percentage (0-100%)
   
2. **Times** ⭐ NEW
   - Track numeric values
   - Set target values
   - View progress

3. **Project**
   - Hour-based tracking
   - Set target hours
   - View progress toward goal

## 🗄️ Database Changes

### New Columns
- `habits.target_value` - for Times habit type
- `habit_logs.value` - store numeric values

### Migration SQL
```sql
ALTER TABLE habits ADD COLUMN target_value INTEGER;
ALTER TABLE habit_logs ADD COLUMN value INTEGER;
```

## 📦 Docker Deployment

### Quick Start
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Deployment Options

**Local Network:**
- Run Docker on any computer
- Access from any device via `http://COMPUTER-IP:5000`

**Raspberry Pi:**
```bash
git clone your-repo
cd ontrack
docker-compose up -d
```

**Cloud Hosting (NOT Vercel):**
- ✅ Railway.app - Auto-deploys Flask apps
- ✅ Render.com - Free tier with persistent disk
- ✅ Fly.io - Docker-based deployment
- ✅ VPS (DigitalOcean, Linode) - Full control
- ❌ Vercel - NOT recommended (no SQLite support)

See `DOCKER_GUIDE.md` for detailed deployment instructions.

## 🎯 Example Workflows

### Workflow 1: Stopwatch Study Session
1. Go to Time Tracker tab
2. Select category: "Self-Study"
3. Select task: "Math"
4. Click "Start"
5. Study for 45 minutes
6. Need coffee? Click "Break" (timer keeps running, break time tracked separately)
7. Back from break? Click "End Break"
8. Done studying? Click "Stop"
9. ✅ Automatically creates time block: "Math - 45 min active, 5 min break"

### Workflow 2: Track Macros with Times Habit
1. Create habit: "Protein Intake" (Times type)
2. Set target: 150g
3. Log meals throughout the day:
   - Breakfast: 30g
   - Lunch: 45g
   - Dinner: 60g
   - Snack: 20g
4. View analytics: "155g / 150g = 103% complete!" ✅

### Workflow 3: Docker Deployment to Raspberry Pi
```bash
# On your Pi
git clone https://github.com/yourusername/ontrack.git
cd ontrack
docker-compose up -d

# Access from any device on network
http://raspberrypi.local:5000
```

## 🐛 Bug Fixes
- Fixed habit logging not clearing input fields
- Fixed analytics date defaults
- Improved stopwatch time calculation accuracy
- Better error handling for category/task relationships

## 📝 Files Added/Modified

### New Files
- `Dockerfile` - Docker container configuration
- `docker-compose.yml` - Easy deployment setup
- `.dockerignore` - Docker build exclusions
- `DOCKER_GUIDE.md` - Comprehensive deployment guide

### Modified Files
- `app.py` - Added stopwatch support, Times habit type
- `templates/index.html` - Stopwatch UI, Times habit form
- `static/css/style.css` - Stopwatch styling
- `static/js/app.js` - Stopwatch logic, Times habit support
- `.gitignore` - Added Docker/environment files

## ⚠️ Breaking Changes

None! This is a backward-compatible update. Existing habits and time blocks work exactly as before.

## 🔮 Future Enhancements (Possible v6)

- Export to Excel with charts
- Mobile app (React Native)
- Sync across devices
- Recurring habits/reminders
- Calendar view
- Goal templates
- Team/family sharing

## 🙏 Notes

### Why NOT Vercel?
Vercel is serverless and doesn't support:
- Persistent file systems (SQLite needs this)
- Long-running processes (Flask apps)
- Background jobs

Use Railway, Render, or Fly.io instead for Flask apps!

### Docker vs Python venv?
**Use Docker if:**
- Deploying to server/Pi
- Want consistent environment
- Familiar with containers

**Use venv if:**
- Local development only
- Prefer traditional Python workflow
- Don't want Docker overhead

Both work great!

Enjoy v5! 🚀
