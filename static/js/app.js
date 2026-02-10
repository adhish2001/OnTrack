// Set current date
const dateInput = document.getElementById('currentDate');
dateInput.value = new Date().toISOString().split('T')[0];

// Global variable to track last end time
let lastEndTime = '00:00';

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Date change listener
dateInput.addEventListener('change', () => {
    loadHabitLogs();
    loadTimeBlocks();
    lastEndTime = '00:00'; // Reset when date changes
});

// Habit type change listener
document.getElementById('habitType').addEventListener('change', (e) => {
    const targetHoursInput = document.getElementById('targetHours');
    const targetTypeSelect = document.getElementById('targetType');
    
    if (e.target.value === 'project') {
        targetHoursInput.style.display = 'block';
        targetTypeSelect.style.display = 'none';
    } else if (e.target.value === 'daily') {
        targetHoursInput.style.display = 'none';
        targetTypeSelect.style.display = 'block';
    } else {
        targetHoursInput.style.display = 'none';
        targetTypeSelect.style.display = 'none';
    }
});

// Category Form Submission
document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('categoryName').value;
    const color = document.getElementById('categoryColor').value;
    
    const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
    });
    
    if (response.ok) {
        document.getElementById('categoryForm').reset();
        await loadCategories();
        await loadTasks();
    } else {
        const data = await response.json();
        alert(data.error || 'Error creating category');
    }
});

// Task Form Submission
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('taskName').value;
    const categoryId = document.getElementById('taskCategorySelect').value || null;
    
    const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category_id: categoryId })
    });
    
    if (response.ok) {
        document.getElementById('taskForm').reset();
        await loadTasks();
    } else {
        const data = await response.json();
        alert(data.error || 'Error creating task');
    }
});

// Habit Form Submission
document.getElementById('habitForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('habitName').value;
    const habitType = document.getElementById('habitType').value;
    const targetHours = document.getElementById('targetHours').value;
    const targetType = document.getElementById('targetType').value;
    
    const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            habit_type: habitType,
            target_hours: targetHours || null,
            target_type: habitType === 'daily' ? targetType : 'binary'
        })
    });
    
    if (response.ok) {
        document.getElementById('habitForm').reset();
        document.getElementById('targetHours').style.display = 'none';
        document.getElementById('targetType').style.display = 'none';
        loadHabits();
    }
});

// Time Block Form Submission - auto-populate start time
document.getElementById('timeBlockForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const activity = document.getElementById('activity').value;
    const categoryId = document.getElementById('categorySelect').value || null;
    const taskId = document.getElementById('taskSelect').value || null;
    const blockDate = dateInput.value;
    
    const response = await fetch('/api/time-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            block_date: blockDate,
            start_time: startTime,
            end_time: endTime,
            activity: activity || 'Activity',
            category_id: categoryId,
            task_id: taskId
        })
    });
    
    if (response.ok) {
        // Set next start time to current end time
        lastEndTime = endTime;
        document.getElementById('startTime').value = endTime;
        document.getElementById('endTime').value = '';
        document.getElementById('activity').value = '';
        // Keep category and task selected
        loadTimeBlocks();
    }
});

// Set initial start time to 00:00
document.getElementById('startTime').value = '00:00';

// Category selection change - load tasks for that category
document.getElementById('categorySelect').addEventListener('change', async (e) => {
    await loadTasksForCategory(e.target.value);
});

async function loadTasksForCategory(categoryId) {
    const taskSelect = document.getElementById('taskSelect');
    taskSelect.innerHTML = '<option value="">No task</option>';
    
    if (!categoryId) return;
    
    const response = await fetch(`/api/tasks?category_id=${categoryId}`);
    const tasks = await response.json();
    
    tasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.name;
        taskSelect.appendChild(option);
    });
}

// Load all categories
async function loadCategories() {
    const response = await fetch('/api/categories');
    const categories = await response.json();
    
    // Update all category selectors
    const selectors = ['categorySelect', 'taskCategorySelect'];
    selectors.forEach(selectorId => {
        const select = document.getElementById(selectorId);
        const currentValue = select.value;
        select.innerHTML = '<option value="">No category</option>';
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            if (cat.id == currentValue) option.selected = true;
            select.appendChild(option);
        });
    });
    
    // Update categories list
    const categoriesList = document.getElementById('categoriesList');
    if (categories.length === 0) {
        categoriesList.innerHTML = '<div class="empty-state"><p>No categories yet. Create one above!</p></div>';
        return;
    }
    
    categoriesList.innerHTML = '';
    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'habit-card';
        card.style.borderLeftColor = cat.color;
        card.id = `category-${cat.id}`;
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3>${cat.name}</h3>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                        <div style="width: 30px; height: 30px; background: ${cat.color}; border-radius: 5px; border: 2px solid #ddd;"></div>
                        <span style="color: #666;">${cat.color}</span>
                    </div>
                </div>
                <div>
                    <button onclick="editCategory(${cat.id}, '${cat.name}', '${cat.color}')" class="log-form button">Edit</button>
                    <button onclick="deleteCategory(${cat.id})" class="delete-btn">Delete</button>
                </div>
            </div>
            <div id="edit-cat-${cat.id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="edit-cat-name-${cat.id}" value="${cat.name}" placeholder="Category name" style="flex: 1;">
                    <input type="color" id="edit-cat-color-${cat.id}" value="${cat.color}">
                    <button onclick="saveCategoryEdit(${cat.id})">Save</button>
                    <button onclick="cancelCategoryEdit(${cat.id})">Cancel</button>
                </div>
            </div>
        `;
        categoriesList.appendChild(card);
    });
}

function editCategory(catId, name, color) {
    document.getElementById(`edit-cat-${catId}`).style.display = 'block';
}

function cancelCategoryEdit(catId) {
    document.getElementById(`edit-cat-${catId}`).style.display = 'none';
}

async function saveCategoryEdit(catId) {
    const name = document.getElementById(`edit-cat-name-${catId}`).value;
    const color = document.getElementById(`edit-cat-color-${catId}`).value;
    
    if (!name) {
        alert('Please enter a category name');
        return;
    }
    
    const response = await fetch(`/api/categories/${catId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
    });
    
    if (response.ok) {
        await loadCategories();
        await loadTimeBlocks();
        await loadTasks();
    } else {
        const data = await response.json();
        alert(data.error || 'Error updating category');
    }
}

async function deleteCategory(catId) {
    if (!confirm('Delete this category? Tasks and time blocks using this category will become uncategorized.')) {
        return;
    }
    
    const response = await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
    
    if (response.ok) {
        await loadCategories();
        await loadTimeBlocks();
        await loadTasks();
    } else {
        const data = await response.json();
        alert(data.error || 'Error deleting category');
    }
}

// Load all tasks
async function loadTasks() {
    const response = await fetch('/api/tasks');
    const tasks = await response.json();
    
    const tasksList = document.getElementById('tasksList');
    if (tasks.length === 0) {
        tasksList.innerHTML = '<div class="empty-state"><p>No tasks yet. Create one above!</p></div>';
        return;
    }
    
    tasksList.innerHTML = '';
    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'habit-card';
        if (task.category_color) {
            card.style.borderLeftColor = task.category_color;
        }
        
        const categoryBadge = task.category_name 
            ? `<span class="badge" style="background: ${task.category_color}">${task.category_name}</span>` 
            : '';
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3>${task.name} ${categoryBadge}</h3>
                </div>
                <div>
                    <button onclick="editTask(${task.id}, '${task.name.replace(/'/g, "\\'")}', ${task.category_id || 'null'})" class="log-form button">Edit</button>
                    <button onclick="deleteTask(${task.id})" class="delete-btn">Delete</button>
                </div>
            </div>
            <div id="edit-task-${task.id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="edit-task-name-${task.id}" value="${task.name.replace(/"/g, '&quot;')}" style="flex: 1;">
                    <select id="edit-task-cat-${task.id}" style="padding: 8px;"></select>
                    <button onclick="saveTaskEdit(${task.id})">Save</button>
                    <button onclick="cancelTaskEdit(${task.id})">Cancel</button>
                </div>
            </div>
        `;
        tasksList.appendChild(card);
    });
}

async function editTask(taskId, name, categoryId) {
    document.getElementById(`edit-task-${taskId}`).style.display = 'block';
    
    // Populate category dropdown
    const response = await fetch('/api/categories');
    const categories = await response.json();
    const select = document.getElementById(`edit-task-cat-${taskId}`);
    select.innerHTML = '<option value="">No category</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        if (cat.id === categoryId) option.selected = true;
        select.appendChild(option);
    });
}

function cancelTaskEdit(taskId) {
    document.getElementById(`edit-task-${taskId}`).style.display = 'none';
}

async function saveTaskEdit(taskId) {
    const name = document.getElementById(`edit-task-name-${taskId}`).value;
    const categoryId = document.getElementById(`edit-task-cat-${taskId}`).value || null;
    
    if (!name) {
        alert('Please enter a task name');
        return;
    }
    
    const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category_id: categoryId })
    });
    
    if (response.ok) {
        await loadTasks();
    } else {
        const data = await response.json();
        alert(data.error || 'Error updating task');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    
    const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    
    if (response.ok) {
        await loadTasks();
    } else {
        const data = await response.json();
        alert(data.error || 'Error deleting task');
    }
}

// Load all habits
async function loadHabits() {
    const response = await fetch('/api/habits');
    const habits = await response.json();
    
    const habitsList = document.getElementById('habitsList');
    
    if (habits.length === 0) {
        habitsList.innerHTML = '<div class="empty-state"><p>No habits yet. Create one above!</p></div>';
        return;
    }
    
    habitsList.innerHTML = '';
    
    for (const habit of habits) {
        const card = document.createElement('div');
        card.className = 'habit-card';
        
        let progressHTML = '';
        if (habit.habit_type === 'project') {
            const progressResponse = await fetch(`/api/habit-progress/${habit.id}`);
            const progress = await progressResponse.json();
            const percentage = (progress.total_hours / progress.target_hours) * 100;
            
            progressHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <p>${progress.total_hours} / ${progress.target_hours} hours (${percentage.toFixed(1)}%)</p>
            `;
        }
        
        const targetType = habit.target_type || 'binary';
        let logInput = '';
        
        if (habit.habit_type === 'project') {
            logInput = `<input type="number" step="0.5" placeholder="Hours spent today" id="hours-${habit.id}">`;
        } else if (targetType === 'percentage') {
            logInput = `<input type="number" min="0" max="100" placeholder="Completion %" id="percentage-${habit.id}">`;
        } else {
            logInput = `<label><input type="checkbox" id="check-${habit.id}"> Completed today</label>`;
        }
        
        card.innerHTML = `
            <h3>${habit.name}</h3>
            <span class="badge">${habit.habit_type === 'daily' ? 'Daily' : 'Project'}</span>
            ${habit.habit_type === 'daily' && targetType === 'percentage' ? '<span class="badge" style="background: #4caf50;">Percentage</span>' : ''}
            ${progressHTML}
            <div class="log-form">
                ${logInput}
                <input type="text" placeholder="Notes (optional)" id="notes-${habit.id}">
                <button onclick="logHabit(${habit.id}, '${habit.habit_type}', '${targetType}')">Log</button>
                <button class="delete-btn" onclick="deleteHabit(${habit.id})">Delete</button>
            </div>
        `;
        
        habitsList.appendChild(card);
    }
    
    loadHabitLogs();
}

async function logHabit(habitId, habitType, targetType) {
    const logDate = dateInput.value;
    let hoursSpent = null;
    let completed = false;
    let completionPercentage = null;
    
    if (habitType === 'project') {
        hoursSpent = document.getElementById(`hours-${habitId}`).value;
        if (!hoursSpent) {
            alert('Please enter hours spent');
            return;
        }
    } else if (targetType === 'percentage') {
        completionPercentage = document.getElementById(`percentage-${habitId}`).value;
        if (completionPercentage === '') {
            alert('Please enter completion percentage');
            return;
        }
        completed = completionPercentage >= 100;
    } else {
        completed = document.getElementById(`check-${habitId}`).checked;
    }
    
    const notes = document.getElementById(`notes-${habitId}`).value;
    
    const response = await fetch('/api/habit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            habit_id: habitId,
            log_date: logDate,
            hours_spent: hoursSpent,
            completed: completed,
            completion_percentage: completionPercentage,
            notes: notes
        })
    });
    
    if (response.ok) {
        // Clear the input
        if (habitType === 'project') {
            document.getElementById(`hours-${habitId}`).value = '';
        } else if (targetType === 'percentage') {
            document.getElementById(`percentage-${habitId}`).value = '';
        } else {
            document.getElementById(`check-${habitId}`).checked = false;
        }
        document.getElementById(`notes-${habitId}`).value = '';
        
        loadHabits();
        loadHabitLogs();
    }
}

async function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit and all its logs?')) return;
    
    const response = await fetch(`/api/habits/${habitId}`, { method: 'DELETE' });
    
    if (response.ok) {
        loadHabits();
    }
}

// Load habit logs for today
async function loadHabitLogs() {
    const logDate = dateInput.value;
    const response = await fetch(`/api/habit-logs?date=${logDate}`);
    const logs = await response.json();
    
    const todayLogs = document.getElementById('todayLogs');
    
    if (logs.length === 0) {
        todayLogs.innerHTML = '<div class="empty-state"><p>No logs for this date yet.</p></div>';
        return;
    }
    
    todayLogs.innerHTML = '';
    
    logs.forEach(log => {
        const logCard = document.createElement('div');
        logCard.className = 'habit-card';
        logCard.id = `log-${log.id}`;
        
        let statusText = '';
        if (log.habit_type === 'project') {
            statusText = `⏱️ ${log.hours_spent} hours logged`;
        } else if (log.target_type === 'percentage') {
            statusText = `📊 ${log.completion_percentage}% complete`;
        } else {
            statusText = log.completed ? '✅ Completed' : '❌ Not completed';
        }
        
        const targetType = log.target_type || 'binary';
        let editInput = '';
        
        if (log.habit_type === 'project') {
            editInput = `<input type="number" step="0.5" id="edit-hours-${log.id}" value="${log.hours_spent}" placeholder="Hours">`;
        } else if (targetType === 'percentage') {
            editInput = `<input type="number" min="0" max="100" id="edit-percentage-${log.id}" value="${log.completion_percentage}" placeholder="Completion %">`;
        } else {
            editInput = `<label><input type="checkbox" id="edit-check-${log.id}" ${log.completed ? 'checked' : ''}> Completed</label>`;
        }
        
        logCard.innerHTML = `
            <h3>${log.name}</h3>
            <p id="status-${log.id}">${statusText}</p>
            ${log.notes ? `<p id="notes-display-${log.id}"><em>Notes: ${log.notes}</em></p>` : ''}
            <div style="margin-top: 10px;">
                <button onclick="editLog(${log.id})" class="log-form button">Edit</button>
                <button onclick="deleteLog(${log.id})" class="delete-btn">Delete</button>
            </div>
            <div id="edit-form-${log.id}" style="display: none; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                ${editInput}
                <input type="text" id="edit-notes-${log.id}" value="${(log.notes || '').replace(/"/g, '&quot;')}" placeholder="Notes">
                <button onclick="saveLogEdit(${log.id}, '${log.habit_type}', '${targetType}')">Save</button>
                <button onclick="cancelLogEdit(${log.id})">Cancel</button>
            </div>
        `;
        
        todayLogs.appendChild(logCard);
    });
}

function editLog(logId) {
    document.getElementById(`edit-form-${logId}`).style.display = 'flex';
    document.getElementById(`edit-form-${logId}`).style.gap = '10px';
}

function cancelLogEdit(logId) {
    document.getElementById(`edit-form-${logId}`).style.display = 'none';
}

async function saveLogEdit(logId, habitType, targetType) {
    let hoursSpent = null;
    let completed = false;
    let completionPercentage = null;
    
    if (habitType === 'project') {
        hoursSpent = document.getElementById(`edit-hours-${logId}`).value;
        if (!hoursSpent) {
            alert('Please enter hours spent');
            return;
        }
    } else if (targetType === 'percentage') {
        completionPercentage = document.getElementById(`edit-percentage-${logId}`).value;
        if (completionPercentage === '') {
            alert('Please enter completion percentage');
            return;
        }
        completed = completionPercentage >= 100;
    } else {
        completed = document.getElementById(`edit-check-${logId}`).checked;
    }
    
    const notes = document.getElementById(`edit-notes-${logId}`).value;
    
    const response = await fetch(`/api/habit-logs/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            hours_spent: hoursSpent,
            completed: completed,
            completion_percentage: completionPercentage,
            notes: notes
        })
    });
    
    if (response.ok) {
        loadHabitLogs();
        loadHabits();
    }
}

async function deleteLog(logId) {
    if (!confirm('Delete this log entry?')) return;
    
    const response = await fetch(`/api/habit-logs/${logId}`, { method: 'DELETE' });
    
    if (response.ok) {
        loadHabitLogs();
        loadHabits();
    }
}

// Load time blocks
async function loadTimeBlocks() {
    const blockDate = dateInput.value;
    const response = await fetch(`/api/time-blocks?date=${blockDate}`);
    const data = await response.json();
    
    document.getElementById('totalTracked').textContent = data.total_hours;
    document.getElementById('remainingTime').textContent = (24 - data.total_hours).toFixed(2);
    
    const timeBlocksList = document.getElementById('timeBlocksList');
    
    if (data.blocks.length === 0) {
        timeBlocksList.innerHTML = '<div class="empty-state"><p>No time blocks for this date.</p></div>';
        return;
    }
    
    timeBlocksList.innerHTML = '';
    
    data.blocks.forEach(block => {
        const blockCard = document.createElement('div');
        blockCard.className = 'time-block-card';
        
        if (block.category_color) {
            blockCard.style.borderLeftColor = block.category_color;
        }
        
        const categoryBadge = block.category_name 
            ? `<span class="badge" style="background: ${block.category_color}">${block.category_name}</span>` 
            : '';
        
        const taskBadge = block.task_name 
            ? `<span class="badge" style="background: #4caf50; margin-left: 5px;">${block.task_name}</span>` 
            : '';
        
        blockCard.innerHTML = `
            <div class="time-block-info">
                <div>
                    <strong>${block.start_time} - ${block.end_time}</strong>
                    ${categoryBadge}${taskBadge}
                </div>
                <p>${block.activity} (${block.duration_minutes} min / ${(block.duration_minutes/60).toFixed(2)} hrs)</p>
            </div>
            <div>
                <button class="delete-btn" onclick="deleteTimeBlock(${block.id})">Delete</button>
            </div>
        `;
        
        timeBlocksList.appendChild(blockCard);
    });
}

async function deleteTimeBlock(blockId) {
    if (!confirm('Delete this time block?')) return;
    
    const response = await fetch(`/api/time-blocks/${blockId}`, { method: 'DELETE' });
    
    if (response.ok) {
        await loadTimeBlocks();
    }
}

// Export/Import functions
function exportHabits() {
    window.location.href = '/export/habits';
}

function exportTimeBlocks() {
    window.location.href = '/export/timeblocks';
}

async function importHabits() {
    const fileInput = document.getElementById('habitsFileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file to import');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/import/habits', {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
        alert(`Successfully imported ${result.imported} habit logs!`);
        await loadHabits();
        await loadHabitLogs();
        fileInput.value = '';
    } else {
        alert('Error importing: ' + result.error);
    }
}

async function importTimeBlocks() {
    const fileInput = document.getElementById('timeBlocksFileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file to import');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/import/timeblocks', {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
        alert(`Successfully imported ${result.imported} time blocks!`);
        await loadTimeBlocks();
        fileInput.value = '';
    } else {
        alert('Error importing: ' + result.error);
    }
}

// Analytics functions
function initAnalytics() {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    document.getElementById('analyticsStartDate').value = weekAgo.toISOString().split('T')[0];
    document.getElementById('analyticsEndDate').value = today.toISOString().split('T')[0];
}

async function loadAnalytics() {
    const startDate = document.getElementById('analyticsStartDate').value;
    const endDate = document.getElementById('analyticsEndDate').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }
    
    // Load category analytics
    const response = await fetch(`/api/analytics?start_date=${startDate}&end_date=${endDate}`);
    const data = await response.json();
    
    const analyticsResults = document.getElementById('analyticsResults');
    
    if (data.total_hours === 0) {
        analyticsResults.innerHTML = '<div class="empty-state"><p>No time blocks found for this date range.</p></div>';
    } else {
        analyticsResults.innerHTML = `
            <div class="stats-box" style="margin-bottom: 20px;">
                <p><strong>Total Time Tracked:</strong> ${data.total_hours} hours (${data.total_minutes} minutes)</p>
                <p><strong>Date Range:</strong> ${startDate} to ${endDate}</p>
            </div>
        `;
        
        data.categories.forEach(cat => {
            if (cat.total_hours === 0) return;
            
            const percentage = ((cat.total_hours / data.total_hours) * 100).toFixed(1);
            
            const card = document.createElement('div');
            card.className = 'habit-card';
            card.style.borderLeftColor = cat.color;
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <h3>${cat.name}</h3>
                        <p>${cat.total_hours} hours (${cat.total_minutes} minutes)</p>
                        <p style="color: #666;">${cat.block_count} time blocks</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 2em; font-weight: bold; color: ${cat.color};">${percentage}%</div>
                    </div>
                </div>
                <div class="progress-bar" style="margin-top: 10px;">
                    <div class="progress-fill" style="width: ${percentage}%; background: ${cat.color};"></div>
                </div>
            `;
            
            analyticsResults.appendChild(card);
        });
    }
    
    // Load task analytics
    const taskResponse = await fetch(`/api/analytics/tasks?start_date=${startDate}&end_date=${endDate}`);
    const taskData = await taskResponse.json();
    
    const taskAnalyticsResults = document.getElementById('taskAnalyticsResults');
    
    if (taskData.tasks.length === 0) {
        taskAnalyticsResults.innerHTML = '<div class="empty-state"><p>No task data for this date range.</p></div>';
    } else {
        taskAnalyticsResults.innerHTML = `
            <div class="stats-box" style="margin-bottom: 20px;">
                <p><strong>Total Task Time:</strong> ${taskData.total_hours} hours</p>
            </div>
        `;
        
        taskData.tasks.forEach(task => {
            const percentage = ((task.total_hours / taskData.total_hours) * 100).toFixed(1);
            
            const card = document.createElement('div');
            card.className = 'habit-card';
            card.style.borderLeftColor = task.color;
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <h3>${task.name}</h3>
                        <span class="badge" style="background: ${task.color}">${task.category_name}</span>
                        <p>${task.total_hours} hours (${task.total_minutes} minutes)</p>
                        <p style="color: #666;">${task.block_count} time blocks</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 2em; font-weight: bold; color: ${task.color};">${percentage}%</div>
                    </div>
                </div>
                <div class="progress-bar" style="margin-top: 10px;">
                    <div class="progress-fill" style="width: ${percentage}%; background: ${task.color};"></div>
                </div>
            `;
            
            taskAnalyticsResults.appendChild(card);
        });
    }
    
    // Load habit analytics
    const habitResponse = await fetch(`/api/analytics/habits?start_date=${startDate}&end_date=${endDate}`);
    const habitData = await habitResponse.json();
    
    const habitAnalyticsResults = document.getElementById('habitAnalyticsResults');
    
    if (habitData.habits.length === 0) {
        habitAnalyticsResults.innerHTML = '<div class="empty-state"><p>No habit data for this date range.</p></div>';
    } else {
        habitAnalyticsResults.innerHTML = '';
        
        habitData.habits.forEach(habit => {
            const card = document.createElement('div');
            card.className = 'habit-card';
            
            let statsHTML = '';
            if (habit.habit_type === 'project') {
                statsHTML = `<p><strong>Total Hours:</strong> ${habit.total_hours} hours</p>`;
                if (habit.target_hours) {
                    const progress = (habit.total_hours / habit.target_hours * 100).toFixed(1);
                    statsHTML += `<p><strong>Progress:</strong> ${progress}% of ${habit.target_hours} hour target</p>`;
                }
            } else {
                statsHTML = `
                    <p><strong>Completion Rate:</strong> ${habit.completion_rate}%</p>
                    <p><strong>Completed:</strong> ${habit.completed_count} of ${habit.log_count} days</p>
                `;
                if (habit.target_type === 'percentage') {
                    statsHTML += `<p><strong>Average Completion:</strong> ${habit.avg_completion}%</p>`;
                }
            }
            
            card.innerHTML = `
                <h3>${habit.name}</h3>
                <span class="badge">${habit.habit_type === 'daily' ? 'Daily' : 'Project'}</span>
                ${statsHTML}
                <div class="progress-bar" style="margin-top: 10px;">
                    <div class="progress-fill" style="width: ${habit.habit_type === 'project' ? Math.min((habit.total_hours / (habit.target_hours || 1)) * 100, 100) : habit.completion_rate}%;"></div>
                </div>
            `;
            
            habitAnalyticsResults.appendChild(card);
        });
    }
}

// Initial load
loadHabits();
loadTimeBlocks();
loadCategories();
loadTasks();
initAnalytics();

// ====== STOPWATCH FUNCTIONALITY ======

let stopwatchInterval = null;
let stopwatchStartTime = null;
let stopwatchElapsed = 0;
let activeTime = 0;
let breakTime = 0;
let isOnBreak = false;
let breakStartTime = null;

// Stopwatch category change
document.getElementById('stopwatchCategory').addEventListener('change', async (e) => {
    const taskSelect = document.getElementById('stopwatchTask');
    taskSelect.innerHTML = '<option value="">Select task (optional)</option>';
    
    if (!e.target.value) return;
    
    const response = await fetch(`/api/tasks?category_id=${e.target.value}`);
    const tasks = await response.json();
    
    tasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.name;
        taskSelect.appendChild(option);
    });
});

function toggleStopwatch() {
    const btn = document.getElementById('startStopBtn');
    const breakBtn = document.getElementById('breakBtn');
    const statusDiv = document.getElementById('stopwatchStatus');
    
    if (stopwatchInterval) {
        // Stop
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        btn.textContent = 'Start';
        btn.classList.remove('running');
        breakBtn.style.display = 'none';
        
        // Save the time block
        saveStopwatchBlock();
    } else {
        // Start
        const category = document.getElementById('stopwatchCategory').value;
        if (!category) {
            alert('Please select a category first');
            return;
        }
        
        stopwatchStartTime = Date.now() - stopwatchElapsed;
        stopwatchInterval = setInterval(updateStopwatch, 100);
        btn.textContent = 'Stop';
        btn.classList.add('running');
        breakBtn.style.display = 'inline-block';
        statusDiv.style.display = 'block';
    }
}

function updateStopwatch() {
    stopwatchElapsed = Date.now() - stopwatchStartTime;
    
    if (!isOnBreak) {
        activeTime = stopwatchElapsed - breakTime;
    } else {
        breakTime = (Date.now() - breakStartTime) + (breakTime - (breakStartTime ? 0 : breakTime));
    }
    
    const totalSeconds = Math.floor(stopwatchElapsed / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    document.getElementById('stopwatchTime').textContent = 
        `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    
    // Update active/break time display
    const activeSeconds = Math.floor(activeTime / 1000);
    const breakSeconds = Math.floor(breakTime / 1000);
    
    document.getElementById('activeTime').textContent = 
        `${Math.floor(activeSeconds / 60)}:${pad(activeSeconds % 60)}`;
    document.getElementById('breakTime').textContent = 
        `${Math.floor(breakSeconds / 60)}:${pad(breakSeconds % 60)}`;
}

function takeBreak() {
    if (isOnBreak) {
        // End break
        isOnBreak = false;
        document.getElementById('breakBtn').textContent = 'Break';
        document.getElementById('breakBtn').classList.remove('running');
        breakStartTime = null;
    } else {
        // Start break
        isOnBreak = true;
        breakStartTime = Date.now();
        document.getElementById('breakBtn').textContent = 'End Break';
        document.getElementById('breakBtn').classList.add('running');
    }
}

function resetStopwatch() {
    if (stopwatchInterval && !confirm('Stop and reset the current timer?')) {
        return;
    }
    
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    stopwatchElapsed = 0;
    activeTime = 0;
    breakTime = 0;
    isOnBreak = false;
    breakStartTime = null;
    
    document.getElementById('stopwatchTime').textContent = '00:00:00';
    document.getElementById('startStopBtn').textContent = 'Start';
    document.getElementById('startStopBtn').classList.remove('running');
    document.getElementById('breakBtn').style.display = 'none';
    document.getElementById('stopwatchStatus').style.display = 'none';
    document.getElementById('activeTime').textContent = '0:00';
    document.getElementById('breakTime').textContent = '0:00';
}

async function saveStopwatchBlock() {
    if (stopwatchElapsed === 0) return;
    
    const categoryId = document.getElementById('stopwatchCategory').value;
    const taskId = document.getElementById('stopwatchTask').value || null;
    const notes = document.getElementById('stopwatchNotes').value || '';
    
    // Calculate times
    const now = new Date();
    const activeDuration = Math.floor(activeTime / 60000); // minutes
    const breakDuration = Math.floor(breakTime / 60000); // minutes
    
    // End time is now
    const endHours = now.getHours();
    const endMinutes = now.getMinutes();
    const endTime = `${pad(endHours)}:${pad(endMinutes)}`;
    
    // Start time is (active + break) minutes ago
    const startDate = new Date(now.getTime() - stopwatchElapsed);
    const startHours = startDate.getHours();
    const startMinutes = startDate.getMinutes();
    const startTime = `${pad(startHours)}:${pad(startMinutes)}`;
    
    const blockDate = dateInput.value;
    
    // Save main activity block
    const mainResponse = await fetch('/api/time-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            block_date: blockDate,
            start_time: startTime,
            end_time: endTime,
            activity: notes || 'Stopwatch activity',
            category_id: categoryId,
            task_id: taskId
        })
    });
    
    // If there was break time, save break blocks
    if (breakDuration > 0) {
        // Create "Break" category if it doesn't exist, or use existing
        const categoriesResponse = await fetch('/api/categories');
        const categories = await categoriesResponse.json();
        let breakCategory = categories.find(c => c.name === 'Break');
        
        if (!breakCategory) {
            const createResponse = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Break', color: '#999999' })
            });
            const result = await createResponse.json();
            breakCategory = { id: result.id };
        }
        
        // For simplicity, create one break block for total break time
        // In reality, breaks might be scattered throughout - this is an approximation
        const breakResponse = await fetch('/api/time-blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                block_date: blockDate,
                start_time: startTime,
                end_time: endTime,
                activity: `Break time (deducted from activity)`,
                category_id: breakCategory.id,
                task_id: null
            })
        });
    }
    
    if (mainResponse.ok) {
        alert(`Saved! Active time: ${Math.floor(activeDuration / 60)}h ${activeDuration % 60}m${breakDuration > 0 ? `\nBreak time: ${Math.floor(breakDuration / 60)}h ${breakDuration % 60}m` : ''}`);
        resetStopwatch();
        document.getElementById('stopwatchNotes').value = '';
        await loadTimeBlocks();
    }
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

// ====== END STOPWATCH FUNCTIONALITY ======

// Load categories into stopwatch dropdown
async function loadStopwatchCategories() {
    const response = await fetch('/api/categories');
    const categories = await response.json();
    
    const select = document.getElementById('stopwatchCategory');
    select.innerHTML = '<option value="">Select category</option>';
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

// Update the initial load
const originalInit = window.onload;
window.onload = function() {
    if (originalInit) originalInit();
    loadStopwatchCategories();
};

