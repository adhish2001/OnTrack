from flask import Flask, render_template, request, jsonify, send_file
import sqlite3
import csv
from datetime import datetime, date
import os

app = Flask(__name__)
DATABASE = 'data/ontrack.db'

def get_db():
    """Connect to the SQLite database"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with required tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Habits table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            habit_type TEXT NOT NULL,
            target_hours INTEGER,
            target_value INTEGER,
            target_type TEXT DEFAULT 'binary',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Habit logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS habit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER,
            log_date DATE NOT NULL,
            hours_spent REAL,
            value INTEGER,
            completed BOOLEAN,
            completion_percentage INTEGER,
            notes TEXT,
            FOREIGN KEY (habit_id) REFERENCES habits (id)
        )
    ''')
    
    # Categories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tasks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            category_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )
    ''')
    
    # Time blocks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS time_blocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            block_date DATE NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            activity TEXT NOT NULL,
            duration_minutes INTEGER,
            category_id INTEGER,
            task_id INTEGER,
            FOREIGN KEY (category_id) REFERENCES categories (id),
            FOREIGN KEY (task_id) REFERENCES tasks (id)
        )
    ''')
    
    conn.commit()
    conn.close()

@app.route('/')
def index():
    """Main dashboard"""
    return render_template('index.html')

@app.route('/api/habits', methods=['GET', 'POST'])
def habits():
    """Get all habits or create a new habit"""
    conn = get_db()
    cursor = conn.cursor()
    
    if request.method == 'POST':
        data = request.json
        cursor.execute('''
            INSERT INTO habits (name, habit_type, target_hours, target_value, target_type)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['name'], data['habit_type'], data.get('target_hours'), 
              data.get('target_value'), data.get('target_type', 'binary')))
        conn.commit()
        habit_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': habit_id, 'success': True})
    
    else:
        cursor.execute('SELECT * FROM habits ORDER BY created_at DESC')
        habits = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(habits)

@app.route('/api/habits/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    """Delete a habit"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM habits WHERE id = ?', (habit_id,))
    cursor.execute('DELETE FROM habit_logs WHERE habit_id = ?', (habit_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/habit-logs', methods=['GET', 'POST'])
def habit_logs():
    """Get habit logs or create a new log entry"""
    conn = get_db()
    cursor = conn.cursor()
    
    if request.method == 'POST':
        data = request.json
        cursor.execute('''
            INSERT INTO habit_logs (habit_id, log_date, hours_spent, value, completed, completion_percentage, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (data['habit_id'], data['log_date'], data.get('hours_spent'), 
              data.get('value'), data.get('completed', False), 
              data.get('completion_percentage'), data.get('notes', '')))
        conn.commit()
        log_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': log_id, 'success': True})
    
    else:
        log_date = request.args.get('date', date.today().isoformat())
        cursor.execute('''
            SELECT hl.*, h.name, h.habit_type, h.target_hours, h.target_value, h.target_type
            FROM habit_logs hl
            JOIN habits h ON hl.habit_id = h.id
            WHERE hl.log_date = ?
            ORDER BY hl.id DESC
        ''', (log_date,))
        logs = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(logs)

@app.route('/api/habit-logs/<int:log_id>', methods=['PUT', 'DELETE'])
def edit_habit_log(log_id):
    """Edit or delete a habit log entry"""
    conn = get_db()
    cursor = conn.cursor()
    
    if request.method == 'PUT':
        data = request.json
        cursor.execute('''
            UPDATE habit_logs 
            SET hours_spent = ?, value = ?, completed = ?, completion_percentage = ?, notes = ?
            WHERE id = ?
        ''', (data.get('hours_spent'), data.get('value'), data.get('completed', False), 
              data.get('completion_percentage'), data.get('notes', ''), log_id))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    
    elif request.method == 'DELETE':
        cursor.execute('DELETE FROM habit_logs WHERE id = ?', (log_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True})

@app.route('/api/habit-progress/<int:habit_id>')
def habit_progress(habit_id):
    """Get total progress for a project-based habit"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT h.name, h.target_hours, COALESCE(SUM(hl.hours_spent), 0) as total_hours
        FROM habits h
        LEFT JOIN habit_logs hl ON h.id = hl.habit_id
        WHERE h.id = ?
        GROUP BY h.id
    ''', (habit_id,))
    result = dict(cursor.fetchone())
    conn.close()
    return jsonify(result)

@app.route('/api/categories', methods=['GET', 'POST'])
def categories():
    """Get all categories or create a new category"""
    conn = get_db()
    cursor = conn.cursor()
    
    if request.method == 'POST':
        data = request.json
        try:
            cursor.execute('''
                INSERT INTO categories (name, color)
                VALUES (?, ?)
            ''', (data['name'], data.get('color', '#667eea')))
            conn.commit()
            category_id = cursor.lastrowid
            conn.close()
            return jsonify({'id': category_id, 'success': True})
        except sqlite3.IntegrityError:
            conn.close()
            return jsonify({'success': False, 'error': 'Category already exists'}), 400
    
    else:
        cursor.execute('SELECT * FROM categories ORDER BY name')
        categories = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(categories)

@app.route('/api/categories/<int:category_id>', methods=['PUT', 'DELETE'])
def edit_category(category_id):
    """Edit or delete a category"""
    conn = get_db()
    cursor = conn.cursor()
    
    if request.method == 'PUT':
        data = request.json
        try:
            cursor.execute('''
                UPDATE categories 
                SET name = ?, color = ?
                WHERE id = ?
            ''', (data['name'], data.get('color', '#667eea'), category_id))
            conn.commit()
            conn.close()
            return jsonify({'success': True})
        except sqlite3.IntegrityError:
            conn.close()
            return jsonify({'success': False, 'error': 'Category name already exists'}), 400
    
    elif request.method == 'DELETE':
        # Check if category is being used
        cursor.execute('SELECT COUNT(*) as count FROM time_blocks WHERE category_id = ?', (category_id,))
        count = cursor.fetchone()['count']
        
        if count > 0:
            conn.close()
            return jsonify({'success': False, 'error': f'Cannot delete. {count} time blocks use this category.'}), 400
        
        cursor.execute('DELETE FROM categories WHERE id = ?', (category_id,))
        cursor.execute('DELETE FROM tasks WHERE category_id = ?', (category_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True})

@app.route('/api/tasks', methods=['GET', 'POST'])
def tasks():
    """Get all tasks or create a new task"""
    conn = get_db()
    cursor = conn.cursor()
    
    if request.method == 'POST':
        data = request.json
        try:
            cursor.execute('''
                INSERT INTO tasks (name, category_id)
                VALUES (?, ?)
            ''', (data['name'], data.get('category_id')))
            conn.commit()
            task_id = cursor.lastrowid
            conn.close()
            return jsonify({'id': task_id, 'success': True})
        except sqlite3.IntegrityError:
            conn.close()
            return jsonify({'success': False, 'error': 'Task already exists'}), 400
    
    else:
        category_id = request.args.get('category_id')
        if category_id:
            cursor.execute('''
                SELECT t.*, c.name as category_name, c.color as category_color
                FROM tasks t
                LEFT JOIN categories c ON t.category_id = c.id
                WHERE t.category_id = ?
                ORDER BY t.name
            ''', (category_id,))
        else:
            cursor.execute('''
                SELECT t.*, c.name as category_name, c.color as category_color
                FROM tasks t
                LEFT JOIN categories c ON t.category_id = c.id
                ORDER BY c.name, t.name
            ''')
        tasks = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(tasks)

@app.route('/api/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
def edit_task(task_id):
    """Edit or delete a task"""
    conn = get_db()
    cursor = conn.cursor()
    
    if request.method == 'PUT':
        data = request.json
        try:
            cursor.execute('''
                UPDATE tasks 
                SET name = ?, category_id = ?
                WHERE id = ?
            ''', (data['name'], data.get('category_id'), task_id))
            conn.commit()
            conn.close()
            return jsonify({'success': True})
        except sqlite3.IntegrityError:
            conn.close()
            return jsonify({'success': False, 'error': 'Task name already exists'}), 400
    
    elif request.method == 'DELETE':
        # Check if task is being used
        cursor.execute('SELECT COUNT(*) as count FROM time_blocks WHERE task_id = ?', (task_id,))
        count = cursor.fetchone()['count']
        
        if count > 0:
            conn.close()
            return jsonify({'success': False, 'error': f'Cannot delete. {count} time blocks use this task.'}), 400
        
        cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True})

@app.route('/api/time-blocks', methods=['GET', 'POST'])
def time_blocks():
    """Get time blocks or create a new time block"""
    conn = get_db()
    cursor = conn.cursor()
    
    if request.method == 'POST':
        data = request.json
        
        # Calculate duration in minutes
        start = datetime.strptime(data['start_time'], '%H:%M')
        end = datetime.strptime(data['end_time'], '%H:%M')
        duration = int((end - start).total_seconds() / 60)
        
        cursor.execute('''
            INSERT INTO time_blocks (block_date, start_time, end_time, activity, duration_minutes, category_id, task_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (data['block_date'], data['start_time'], data['end_time'], 
              data['activity'], duration, data.get('category_id'), data.get('task_id')))
        conn.commit()
        block_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': block_id, 'success': True})
    
    else:
        block_date = request.args.get('date', date.today().isoformat())
        cursor.execute('''
            SELECT tb.*, c.name as category_name, c.color as category_color, t.name as task_name
            FROM time_blocks tb
            LEFT JOIN categories c ON tb.category_id = c.id
            LEFT JOIN tasks t ON tb.task_id = t.id
            WHERE tb.block_date = ?
            ORDER BY tb.start_time
        ''', (block_date,))
        blocks = [dict(row) for row in cursor.fetchall()]
        
        # Calculate total time tracked
        total_minutes = sum(block['duration_minutes'] for block in blocks)
        conn.close()
        return jsonify({
            'blocks': blocks,
            'total_minutes': total_minutes,
            'total_hours': round(total_minutes / 60, 2)
        })

@app.route('/api/time-blocks/<int:block_id>', methods=['PUT', 'DELETE'])
def edit_time_block(block_id):
    """Edit or delete a time block"""
    conn = get_db()
    cursor = conn.cursor()
    
    if request.method == 'PUT':
        data = request.json
        
        # Calculate duration in minutes
        start = datetime.strptime(data['start_time'], '%H:%M')
        end = datetime.strptime(data['end_time'], '%H:%M')
        duration = int((end - start).total_seconds() / 60)
        
        cursor.execute('''
            UPDATE time_blocks 
            SET start_time = ?, end_time = ?, activity = ?, duration_minutes = ?, category_id = ?, task_id = ?
            WHERE id = ?
        ''', (data['start_time'], data['end_time'], data['activity'], duration, 
              data.get('category_id'), data.get('task_id'), block_id))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    
    elif request.method == 'DELETE':
        cursor.execute('DELETE FROM time_blocks WHERE id = ?', (block_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True})

@app.route('/export/habits')
def export_habits():
    """Export habit logs to CSV"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT h.name, h.habit_type, h.target_hours, hl.log_date, 
               hl.hours_spent, hl.completed, hl.notes
        FROM habit_logs hl
        JOIN habits h ON hl.habit_id = h.id
        ORDER BY hl.log_date DESC, h.name
    ''')
    
    filename = f'data/habits_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['Habit Name', 'Type', 'Target Hours', 'Date', 
                        'Hours Spent', 'Completed', 'Notes'])
        writer.writerows(cursor.fetchall())
    
    conn.close()
    return send_file(filename, as_attachment=True, download_name='habits_export.csv')

@app.route('/api/analytics')
def analytics():
    """Get time tracking analytics by category for a date range"""
    conn = get_db()
    cursor = conn.cursor()
    
    start_date = request.args.get('start_date', date.today().isoformat())
    end_date = request.args.get('end_date', date.today().isoformat())
    
    # Get total hours by category
    cursor.execute('''
        SELECT 
            c.id,
            c.name,
            c.color,
            COALESCE(SUM(tb.duration_minutes), 0) as total_minutes,
            COUNT(tb.id) as block_count
        FROM categories c
        LEFT JOIN time_blocks tb ON c.id = tb.category_id 
            AND tb.block_date BETWEEN ? AND ?
        GROUP BY c.id, c.name, c.color
        ORDER BY total_minutes DESC
    ''', (start_date, end_date))
    
    category_stats = []
    for row in cursor.fetchall():
        category_stats.append({
            'id': row['id'],
            'name': row['name'],
            'color': row['color'],
            'total_minutes': row['total_minutes'],
            'total_hours': round(row['total_minutes'] / 60, 2),
            'block_count': row['block_count']
        })
    
    # Get uncategorized blocks
    cursor.execute('''
        SELECT 
            COALESCE(SUM(duration_minutes), 0) as total_minutes,
            COUNT(*) as block_count
        FROM time_blocks
        WHERE category_id IS NULL 
            AND block_date BETWEEN ? AND ?
    ''', (start_date, end_date))
    
    uncategorized = cursor.fetchone()
    if uncategorized['total_minutes'] > 0:
        category_stats.append({
            'id': None,
            'name': 'Uncategorized',
            'color': '#999999',
            'total_minutes': uncategorized['total_minutes'],
            'total_hours': round(uncategorized['total_minutes'] / 60, 2),
            'block_count': uncategorized['block_count']
        })
    
    # Calculate total
    total_minutes = sum(stat['total_minutes'] for stat in category_stats)
    
    conn.close()
    return jsonify({
        'start_date': start_date,
        'end_date': end_date,
        'categories': category_stats,
        'total_minutes': total_minutes,
        'total_hours': round(total_minutes / 60, 2)
    })

@app.route('/api/analytics/tasks')
def task_analytics():
    """Get time tracking analytics by task for a date range"""
    conn = get_db()
    cursor = conn.cursor()
    
    start_date = request.args.get('start_date', date.today().isoformat())
    end_date = request.args.get('end_date', date.today().isoformat())
    category_id = request.args.get('category_id')
    
    if category_id:
        cursor.execute('''
            SELECT 
                t.id,
                t.name,
                c.name as category_name,
                c.color,
                COALESCE(SUM(tb.duration_minutes), 0) as total_minutes,
                COUNT(tb.id) as block_count
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN time_blocks tb ON t.id = tb.task_id 
                AND tb.block_date BETWEEN ? AND ?
            WHERE t.category_id = ?
            GROUP BY t.id, t.name, c.name, c.color
            ORDER BY total_minutes DESC
        ''', (start_date, end_date, category_id))
    else:
        cursor.execute('''
            SELECT 
                t.id,
                t.name,
                c.name as category_name,
                c.color,
                COALESCE(SUM(tb.duration_minutes), 0) as total_minutes,
                COUNT(tb.id) as block_count
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN time_blocks tb ON t.id = tb.task_id 
                AND tb.block_date BETWEEN ? AND ?
            GROUP BY t.id, t.name, c.name, c.color
            ORDER BY c.name, total_minutes DESC
        ''', (start_date, end_date))
    
    task_stats = []
    for row in cursor.fetchall():
        if row['total_minutes'] > 0:
            task_stats.append({
                'id': row['id'],
                'name': row['name'],
                'category_name': row['category_name'],
                'color': row['color'],
                'total_minutes': row['total_minutes'],
                'total_hours': round(row['total_minutes'] / 60, 2),
                'block_count': row['block_count']
            })
    
    total_minutes = sum(stat['total_minutes'] for stat in task_stats)
    
    conn.close()
    return jsonify({
        'start_date': start_date,
        'end_date': end_date,
        'tasks': task_stats,
        'total_minutes': total_minutes,
        'total_hours': round(total_minutes / 60, 2)
    })

@app.route('/api/analytics/habits')
def habit_analytics():
    """Get habit completion analytics for a date range"""
    conn = get_db()
    cursor = conn.cursor()
    
    start_date = request.args.get('start_date', date.today().isoformat())
    end_date = request.args.get('end_date', date.today().isoformat())
    
    cursor.execute('''
        SELECT 
            h.id,
            h.name,
            h.habit_type,
            h.target_type,
            h.target_hours,
            COUNT(hl.id) as log_count,
            SUM(CASE WHEN hl.completed = 1 THEN 1 ELSE 0 END) as completed_count,
            AVG(CASE WHEN hl.completion_percentage IS NOT NULL THEN hl.completion_percentage ELSE 
                CASE WHEN hl.completed = 1 THEN 100 ELSE 0 END END) as avg_completion,
            SUM(COALESCE(hl.hours_spent, 0)) as total_hours
        FROM habits h
        LEFT JOIN habit_logs hl ON h.id = hl.habit_id 
            AND hl.log_date BETWEEN ? AND ?
        GROUP BY h.id, h.name, h.habit_type, h.target_type, h.target_hours
        ORDER BY h.name
    ''', (start_date, end_date))
    
    habit_stats = []
    for row in cursor.fetchall():
        habit_stats.append({
            'id': row['id'],
            'name': row['name'],
            'habit_type': row['habit_type'],
            'target_type': row['target_type'],
            'target_hours': row['target_hours'],
            'log_count': row['log_count'],
            'completed_count': row['completed_count'],
            'avg_completion': round(row['avg_completion'] if row['avg_completion'] else 0, 1),
            'total_hours': round(row['total_hours'], 2),
            'completion_rate': round((row['completed_count'] / row['log_count'] * 100) if row['log_count'] > 0 else 0, 1)
        })
    
    conn.close()
    return jsonify({
        'start_date': start_date,
        'end_date': end_date,
        'habits': habit_stats
    })

@app.route('/export/timeblocks')
def export_timeblocks():
    """Export time blocks to CSV"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT tb.block_date, tb.start_time, tb.end_time, tb.activity, tb.duration_minutes,
               c.name as category, t.name as task
        FROM time_blocks tb
        LEFT JOIN categories c ON tb.category_id = c.id
        LEFT JOIN tasks t ON tb.task_id = t.id
        ORDER BY tb.block_date DESC, tb.start_time
    ''')
    
    filename = f'data/timeblocks_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['Date', 'Start Time', 'End Time', 'Activity', 'Duration (minutes)', 'Category', 'Task'])
        writer.writerows(cursor.fetchall())
    
    conn.close()
    return send_file(filename, as_attachment=True, download_name='timeblocks_export.csv')

@app.route('/import/habits', methods=['POST'])
def import_habits():
    """Import habits from CSV"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400
    
    try:
        content = file.read().decode('utf-8')
        reader = csv.DictReader(content.splitlines())
        
        conn = get_db()
        cursor = conn.cursor()
        
        imported = 0
        errors = []
        
        for row in reader:
            try:
                # First, ensure the habit exists
                cursor.execute('SELECT id FROM habits WHERE name = ?', (row['Habit Name'],))
                habit = cursor.fetchone()
                
                if not habit:
                    # Create the habit
                    habit_type = row.get('Type', 'daily')
                    target_hours = row.get('Target Hours')
                    cursor.execute('''
                        INSERT INTO habits (name, habit_type, target_hours)
                        VALUES (?, ?, ?)
                    ''', (row['Habit Name'], habit_type, target_hours if target_hours else None))
                    habit_id = cursor.lastrowid
                else:
                    habit_id = habit['id']
                
                # Insert the log
                log_date = row.get('Date')
                hours_spent = row.get('Hours Spent')
                completed = row.get('Completed', '').lower() in ['true', '1', 'yes']
                notes = row.get('Notes', '')
                
                if log_date:
                    cursor.execute('''
                        INSERT INTO habit_logs (habit_id, log_date, hours_spent, completed, notes)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (habit_id, log_date, hours_spent if hours_spent else None, completed, notes))
                    imported += 1
                    
            except Exception as e:
                errors.append(f"Row error: {str(e)}")
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'imported': imported,
            'errors': errors
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/import/timeblocks', methods=['POST'])
def import_timeblocks():
    """Import time blocks from CSV"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400
    
    try:
        content = file.read().decode('utf-8')
        reader = csv.DictReader(content.splitlines())
        
        conn = get_db()
        cursor = conn.cursor()
        
        imported = 0
        errors = []
        
        for row in reader:
            try:
                block_date = row.get('Date')
                start_time = row.get('Start Time')
                end_time = row.get('End Time')
                activity = row.get('Activity')
                duration = row.get('Duration (minutes)')
                category_name = row.get('Category')
                task_name = row.get('Task')
                
                # Get category ID if exists
                category_id = None
                if category_name:
                    cursor.execute('SELECT id FROM categories WHERE name = ?', (category_name,))
                    cat = cursor.fetchone()
                    if cat:
                        category_id = cat['id']
                
                # Get task ID if exists
                task_id = None
                if task_name:
                    cursor.execute('SELECT id FROM tasks WHERE name = ?', (task_name,))
                    task = cursor.fetchone()
                    if task:
                        task_id = task['id']
                
                if block_date and start_time and end_time and activity:
                    cursor.execute('''
                        INSERT INTO time_blocks (block_date, start_time, end_time, activity, duration_minutes, category_id, task_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (block_date, start_time, end_time, activity, duration, category_id, task_id))
                    imported += 1
                    
            except Exception as e:
                errors.append(f"Row error: {str(e)}")
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'imported': imported,
            'errors': errors
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Initialize database
    init_db()
    
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=True)
