# 🚀 QUICK START GUIDE - OnTrack

## For Complete Beginners on Arch Linux

### Step 1: Install Python
Open your terminal and run:
```bash
sudo pacman -S python python-pip
```
Enter your password when asked.

### Step 2: Download and Extract
Download the `ontrack` folder to your computer (e.g., to your Downloads folder).

### Step 3: Navigate to the Folder
```bash
cd ~/Downloads/ontrack
```
(Adjust the path if you saved it elsewhere)

### Step 4: Install Requirements
```bash
pip install -r requirements.txt
```

### Step 5: Run the App!
```bash
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
```

### Step 6: Open in Browser
Open your web browser and go to:
```
http://localhost:5000
```

🎉 You're now running OnTrack!

---

## How to Use OnTrack

### Creating Your First Habit

1. **Click the "Habit Tracker" tab** (already selected by default)

2. **Fill out the form:**
   - **Habit name**: e.g., "Gym" or "Study for AWS"
   - **Type**: 
     - Choose "Daily Habit" for simple yes/no tracking (like taking vitamins)
     - Choose "Project" for hour-based tracking (like preparing for a certification)
   - **Target hours**: Only fill this if you chose "Project" (e.g., 180 for your AWS cert)

3. **Click "Add Habit"**

4. **Your habit appears below!** Now you can:
   - For daily habits: Check the box when completed
   - For projects: Enter hours spent today
   - Add optional notes
   - Click "Log" to save

### Tracking Your Time

1. **Click the "Time Tracker" tab**

2. **Add a time block:**
   - **Start time**: e.g., 08:00
   - **End time**: e.g., 10:00
   - **Activity**: e.g., "Deep work - coding"
   - Click "Add Block"

3. **Goal**: Account for all 24 hours!
   - The app shows you how many hours you've tracked
   - And how many are remaining

### Exporting Your Data

1. **Click the "Export Data" tab**

2. **Click the export buttons** to download CSV files:
   - "Download Habits CSV" - All your habit logs
   - "Download Time Blocks CSV" - All your time tracking data

3. **These files are your backup!** You can:
   - Open them in Excel/LibreOffice
   - Use them to migrate to a new computer
   - Analyze your productivity trends

---

## Common Questions

### Q: How do I stop the app?
**A:** Press `Ctrl+C` in the terminal where it's running.

### Q: How do I access this from my phone on the same WiFi?
**A:** 
1. Find your computer's IP address:
   ```bash
   ip addr show | grep "inet "
   ```
   Look for something like `192.168.1.100`

2. On your phone's browser, go to:
   ```
   http://192.168.1.100:5000
   ```
   (Replace with your actual IP)

### Q: Where is my data stored?
**A:** In the `data/ontrack.db` file inside the ontrack folder. As long as you keep this folder, your data is safe!

### Q: Can I change the date to log past habits?
**A:** Yes! Use the date picker at the top of the page.

### Q: How do I run this 24/7?
**A:** See the README.md file for instructions on:
- Running in the background
- Setting up as a system service
- Deploying to Raspberry Pi

---

## Example Workflow

**Morning (7 AM):**
1. Open OnTrack
2. Add time block: 06:00-07:00, "Sleep"
3. Add time block: 07:00-08:00, "Morning routine"
4. Check off daily habit: "Take creatine" ✓

**After Gym (10 AM):**
1. Add time block: 08:00-10:00, "Gym workout"
2. Check off daily habit: "Gym" ✓

**After Study Session (2 PM):**
1. Add time block: 10:00-14:00, "AWS certification study"
2. Log project habit: "AWS Cert" - 4 hours

**End of Day:**
1. Fill in remaining time blocks
2. Review: Did I account for all 24 hours?
3. Export CSV for weekly review

---

## Need Help?

Check the full **README.md** file for:
- Raspberry Pi deployment
- Running as a background service
- Troubleshooting tips
- Advanced configuration

Enjoy tracking your productivity! 📊
