# OnTrack - Habit & Time Tracker

A simple, self-hosted web application for tracking habits and managing your daily time. Built with Flask (Python) and vanilla JavaScript.

## Features

- **Habit Tracking**: Create daily habits or project-based habits with hour targets
- **Time Tracking**: Account for all 24 hours of your day with time blocks
- **Progress Visualization**: See progress bars for project-based habits
- **CSV Export**: Export your data for backup or migration
- **Self-Hosted**: Run on your local network or Raspberry Pi

## Installation (Arch Linux)

### 1. Install Python and pip (if not already installed)
```bash
sudo pacman -S python python-pip
```

### 2. Navigate to the project directory
```bash
cd /path/to/ontrack
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

## Running the Application

### On your local machine:
```bash
python app.py
```

The application will start on `http://0.0.0.0:5000`

You can access it from any device on your local network by going to:
`http://YOUR_COMPUTER_IP:5000`

To find your IP address:
```bash
ip addr show | grep inet
```

### To run in the background:
```bash
nohup python app.py &
```

### To stop the background process:
```bash
pkill -f "python app.py"
```

## Using OnTrack

### Habit Tracking
1. Click "Habit Tracker" tab
2. Create a new habit:
   - **Daily Habit**: Simple checkbox completion (e.g., "Take creatine")
   - **Project Habit**: Track hours toward a goal (e.g., "AWS Certification - 180 hours")
3. Log your progress each day
4. View your progress in the "Today's Progress" section

### Time Tracking
1. Click "Time Tracker" tab
2. Add time blocks throughout your day:
   - Start time
   - End time
   - Activity description
3. See how much of your 24 hours are accounted for
4. Goal: Account for all 24 hours!

### Exporting Data
1. Click "Export Data" tab
2. Download CSV files for:
   - Habit logs
   - Time blocks
3. Use these CSVs for backup or to migrate to a new installation

## File Structure
```
ontrack/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── data/
│   └── ontrack.db        # SQLite database (auto-created)
├── static/
│   ├── css/
│   │   └── style.css     # Styling
│   └── js/
│       └── app.js        # Frontend logic
└── templates/
    └── index.html        # Main HTML template
```

## Deploying to Raspberry Pi Zero 2W

### 1. Transfer files to your Pi
```bash
scp -r ontrack/ pi@YOUR_PI_IP:/home/pi/
```

### 2. SSH into your Pi
```bash
ssh pi@YOUR_PI_IP
```

### 3. Install Python and dependencies
```bash
sudo apt update
sudo apt install python3 python3-pip
cd /home/pi/ontrack
pip3 install -r requirements.txt
```

### 4. Run the application
```bash
python3 app.py
```

### 5. (Optional) Run as a service
Create a systemd service file:
```bash
sudo nano /etc/systemd/system/ontrack.service
```

Add this content:
```ini
[Unit]
Description=OnTrack Habit Tracker
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/ontrack
ExecStart=/usr/bin/python3 /home/pi/ontrack/app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl enable ontrack
sudo systemctl start ontrack
```

Check status:
```bash
sudo systemctl status ontrack
```

## Data Migration

Your data is stored in `/data/ontrack.db`. To migrate:

**Option 1: Copy the entire folder**
```bash
cp -r ontrack/ /path/to/new/location/
```

**Option 2: Use CSV exports**
1. Export both CSV files from the old installation
2. Install OnTrack on the new device
3. Manually import the data (or write a simple import script)

## Troubleshooting

### Port already in use
If port 5000 is already taken, edit `app.py` and change:
```python
app.run(host='0.0.0.0', port=5000, debug=True)
```
to a different port like 5001, 8080, etc.

### Can't access from other devices
Make sure your firewall allows incoming connections on port 5000:
```bash
sudo ufw allow 5000
```

### Database locked errors
This can happen with SQLite on slow systems. Try:
- Reducing simultaneous requests
- Using a single browser tab at a time
- Consider PostgreSQL for production use

## Tips

- Set the date selector to track habits/time for past or future dates
- Use descriptive activity names in time blocks (e.g., "Deep work - coding" vs just "work")
- Review your weekly progress by exporting CSVs and analyzing in Excel/LibreOffice
- For project habits, break down large goals (e.g., 180 hours) into weekly targets

## License

Free to use and modify for personal use.
