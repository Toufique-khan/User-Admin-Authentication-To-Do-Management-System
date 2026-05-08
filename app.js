document.addEventListener('DOMContentLoaded', () => {

    
    const themeSwitch = document.getElementById('theme-switch');
    
    // Load saved theme on page load
    const loadTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            enableDarkmode();
        } else {
            disableDarkmode();
        }
    };

    const enableDarkmode = () => {
        document.body.classList.add('darkmode');
        localStorage.setItem('theme', 'dark');
    };

    const disableDarkmode = () => {
        document.body.classList.remove('darkmode');
        localStorage.setItem('theme', 'light');
    };

  
    loadTheme();

  
    if (themeSwitch) {
        themeSwitch.addEventListener('click', () => {
            if (document.body.classList.contains('darkmode')) {
                disableDarkmode();
            } else {
                enableDarkmode();
            }
        });
    }

    // INITIALIZATION & HELPERS

    
    const initialize = () => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.length === 0) {
            const adminUser = {
                id: Date.now(),
                username: 'Toufique',
                password: 'adminTK',
                role: 'admin',
                status: 'approved'
            };
            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
        }

        if (!localStorage.getItem('tasks')) {
            localStorage.setItem('tasks', JSON.stringify([]));
        }
    };
    
    
    const getCurrentUser = () => {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    };

    // Logout function
    const logout = () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    };

    initialize();
 
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    const bodyId = document.body.id;

    // LOGIN PAGE
    if (bodyId === 'login-page') {
        const loginForm = document.getElementById('login-form');
        const errorMessage = document.getElementById('error-message');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            
            const users = JSON.parse(localStorage.getItem('users'));
            const user = users.find(u => u.username === username && u.password === password);

            if (!user) {
                errorMessage.textContent = 'Invalid username or password.';
                return;
            }

            if (user.status === 'pending') {
                errorMessage.textContent = 'Your account is awaiting admin approval.';
                return;
            }
            
            if (user.status === 'blocked') {
                errorMessage.textContent = 'Your account has been blocked by an admin.';
                return;
            }

            sessionStorage.setItem('currentUser', JSON.stringify(user));

            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'user.html';
            }
        });
    }


    // REGISTER PAGE
    
    if (bodyId === 'register-page') {
        const registerForm = document.getElementById('register-form');
        const message = document.getElementById('message');

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;

            const users = JSON.parse(localStorage.getItem('users'));
            
            if (users.some(u => u.username === username)) {
                message.textContent = 'Username already exists.';
                message.className = 'error';
                return;
            }

            const newUser = {
                id: Date.now(),
                username: username,
                password: password,
                role: 'user',
                status: 'pending' 
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            message.textContent = 'Registration successful! Please wait for admin approval.';
            message.className = 'success';
            registerForm.reset();
        });
    }

    // ADMIN PAGE
    if (bodyId === 'admin-page') {
        // Auth Guard
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }

        const userTableBody = document.querySelector('#user-table tbody');

        const displayUsers = () => {
            const users = JSON.parse(localStorage.getItem('users'));
            userTableBody.innerHTML = ''; // Clear table
            
            users.filter(u => u.role === 'user').forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.status}</td>
                    <td class="actions">
                        ${user.status === 'pending' ? `<button class="approve-btn" data-id="${user.id}">Approve</button>` : ''}
                        ${user.status !== 'blocked' ? `<button class="block-btn" data-id="${user.id}">Block</button>` : ''}
                        ${user.status === 'blocked' ? `<button class="approve-btn" data-id="${user.id}">Unblock</button>` : ''}
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        };
        
        userTableBody.addEventListener('click', (e) => {
            const userId = e.target.dataset.id;
            if (!userId) return;

            const users = JSON.parse(localStorage.getItem('users'));
            const userIndex = users.findIndex(u => u.id == userId);

            if (e.target.classList.contains('approve-btn')) {
                users[userIndex].status = 'approved';
            } else if (e.target.classList.contains('block-btn')) {
                users[userIndex].status = 'blocked';
            }
            
            localStorage.setItem('users', JSON.stringify(users));
            displayUsers();
        });

        displayUsers();
    }

    // USER PAGE
    if (bodyId === 'user-page') {
        // Auth Guard
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'user') {
            window.location.href = 'index.html';
            return;
        }

        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${currentUser.username}!`;
        }

        const taskForm = document.getElementById('task-form');
        const taskInput = document.getElementById('task-input');
        const taskList = document.getElementById('task-list');

        const displayTasks = () => {
            const tasks = JSON.parse(localStorage.getItem('tasks'));
            const userTasks = tasks.filter(task => task.userId === currentUser.id);

            taskList.innerHTML = '';
            userTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = task.status === 'completed' ? 'completed' : '';
                li.innerHTML = `
                    <div class="task-content">
                        <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.status === 'completed' ? 'checked' : ''}>
                        <span class="task-text ${task.status === 'completed' ? 'completed-text' : ''}">${task.description}</span>
                    </div>
                    <div class="task-actions">
                        <button class="edit-btn" data-id="${task.id}">Edit</button>
                        <button class="delete-btn" data-id="${task.id}">Delete</button>
                    </div>
                `;
                taskList.appendChild(li);
            });

            // Update progress
            updateProgress(userTasks);
        };

        const updateProgress = (tasks) => {
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            
            if (progressBar && progressText) {
                const completedTasks = tasks.filter(task => task.status === 'completed').length;
                const totalTasks = tasks.length;
                const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
                
                progressBar.style.width = percentage + '%';
                progressText.textContent = `${completedTasks}/${totalTasks} tasks completed (${percentage}%)`;
            }
        };

        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const tasks = JSON.parse(localStorage.getItem('tasks'));
                const newTask = {
                    id: Date.now(),
                    userId: currentUser.id,
                    description: taskInput.value,
                    status: 'incomplete'
                };
                tasks.push(newTask);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                taskInput.value = '';
                displayTasks();
            });
        }
        
        if (taskList) {
            taskList.addEventListener('click', (e) => {
                const taskId = e.target.dataset.id;
                if (!taskId) return;
                
                let tasks = JSON.parse(localStorage.getItem('tasks'));

                // Handle checkbox toggle
                if (e.target.classList.contains('task-checkbox')) {
                    const taskIndex = tasks.findIndex(task => task.id == taskId);
                    tasks[taskIndex].status = e.target.checked ? 'completed' : 'incomplete';
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    displayTasks();
                    return;
                }

                if (e.target.classList.contains('delete-btn')) {
                    if (confirm('Are you sure you want to delete this task?')) {
                        tasks = tasks.filter(task => task.id != taskId);
                    }
                }
                
                if (e.target.classList.contains('edit-btn')) {
                    const taskIndex = tasks.findIndex(task => task.id == taskId);
                    const newDescription = prompt('Enter new task description:', tasks[taskIndex].description);
                    if (newDescription && newDescription.trim()) {
                        tasks[taskIndex].description = newDescription.trim();
                    }
                }
                
                localStorage.setItem('tasks', JSON.stringify(tasks));
                displayTasks();
            });

            displayTasks();
        }
    }

    // ADMIN PAGE 
    if (bodyId === 'admin-page') {
        // Auth Guard
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }

        const userTableBody = document.querySelector('#user-table tbody');
        if (userTableBody) {
            const displayUsers = () => {
                const users = JSON.parse(localStorage.getItem('users'));
                userTableBody.innerHTML = ''; // Clear table
                
                users.filter(u => u.role === 'user').forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.username}</td>
                        <td>${user.status}</td>
                        <td class="actions">
                            ${user.status === 'pending' ? `<button class="approve-btn" data-id="${user.id}">Approve</button>` : ''}
                            ${user.status !== 'blocked' ? `<button class="block-btn" data-id="${user.id}">Block</button>` : ''}
                            ${user.status === 'blocked' ? `<button class="approve-btn" data-id="${user.id}">Unblock</button>` : ''}
                        </td>
                    `;
                    userTableBody.appendChild(row);
                });
            };
            
            userTableBody.addEventListener('click', (e) => {
                const userId = e.target.dataset.id;
                if (!userId) return;

                const users = JSON.parse(localStorage.getItem('users'));
                const userIndex = users.findIndex(u => u.id == userId);

                if (e.target.classList.contains('approve-btn')) {
                    users[userIndex].status = 'approved';
                } else if (e.target.classList.contains('block-btn')) {
                    users[userIndex].status = 'blocked';
                }
                
                localStorage.setItem('users', JSON.stringify(users));
                displayUsers();
            });

            displayUsers();
        }
    }
});