document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const closeModal = document.querySelector('.close');
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');
    const completedTaskList = document.getElementById('completedTaskList');
    const detailsModal = document.getElementById('detailsModal');
    const closeDetailsModal = document.querySelector('.close-details');
    const taskDetails = document.getElementById('taskDetails');
    const editTaskBtn = document.getElementById('editTaskBtn');
    const deleteTaskBtn = document.getElementById('deleteTaskBtn');
    const daysContainer = document.getElementById('daysContainer');
    const totalTasksElem = document.getElementById('totalTasks');
    const completedTasksElem = document.getElementById('completedTasks');
    const incompleteTasksElem = document.getElementById('incompleteTasks');
    const themeSelectPopup = document.getElementById('themeSelectPopup');
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.id = 'themeStylesheet';
    document.head.appendChild(linkElement);

    let currentDay = localStorage.getItem('currentDay') || new Date().toISOString().split('T')[0];
    let taskToEdit = null;

    const loadTasks = (day) => {
        taskList.innerHTML = '';
        completedTaskList.innerHTML = '';
        const tasks = JSON.parse(localStorage.getItem(`tasks_${day}`)) || [];
        tasks.forEach(task => {
            addTaskToList(task);
        });
        updateStats();
    };

    const saveTasks = (day) => {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            tasks.push(JSON.parse(li.dataset.details));
        });
        completedTaskList.querySelectorAll('li').forEach(li => {
            tasks.push(JSON.parse(li.dataset.details));
        });
        localStorage.setItem(`tasks_${day}`, JSON.stringify(tasks));
        updateStats();
    };

    const updateStats = () => {
  const allTasks = [];
  const daysOfYear = getDaysOfYear();
  daysOfYear.forEach(day => {
    const tasks = JSON.parse(localStorage.getItem(`tasks_${day}`)) || [];
    allTasks.push(...tasks);
  });

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(task => task.completed).length;
  const incompleteTasks = totalTasks - completedTasks;

  totalTasksElem.innerHTML = `إجمالي المهام: ${totalTasks}`;
  completedTasksElem.innerHTML = `المهام المكتملة: ${completedTasks}`;
  incompleteTasksElem.innerHTML = `المهام غير المكتملة: ${incompleteTasks}`;
};

const getDaysOfYear = () => {
  const daysOfYear = [];
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31);

  for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
    daysOfYear.push(new Date(date).toISOString().split('T')[0]);
  }

  return daysOfYear;
};
    addTaskBtn.onclick = () => {
        taskModal.style.display = 'block';
        taskModal.classList.add('fade-in');
    };

    closeModal.onclick = () => {
        taskModal.classList.remove('fade-in');
        taskModal.classList.add('fade-out');
        requestAnimationFrame(() => {
            taskModal.style.display = 'none';
            taskModal.classList.remove('fade-out');
        });
    };

    closeDetailsModal.onclick = () => {
        detailsModal.classList.remove('fade-in');
        detailsModal.classList.add('fade-out');
        requestAnimationFrame(() => {
            detailsModal.style.display = 'none';
            detailsModal.classList.remove('fade-out');
        });
    };

    window.onclick = (event) => {
        if (event.target === taskModal) {
            closeModal.click();
        } else if (event.target === detailsModal) {
            closeDetailsModal.click();
        }
    };

    taskForm.onsubmit = (event) => {
        event.preventDefault();

        const taskName = document.getElementById('taskName').value;
        const taskDescription = document.getElementById('taskDescription').value;
        const taskPriority = document.getElementById('taskPriority').value;
        const taskReminder = document.getElementById('taskReminder').value;

        const task = {
            name: taskName,
            description: taskDescription,
            priority: taskPriority,
            reminder: taskReminder,
            completed: false
        };

        if (taskToEdit) {
            // تحديث المهمة المحددة
            taskToEdit.dataset.details = JSON.stringify(task);

            const updatedTask = JSON.parse(taskToEdit.dataset.details);
            taskToEdit.innerHTML = `<input type="checkbox" ${updatedTask.completed ? 'checked' : ''}><strong>${updatedTask.name}</strong>`;
            taskToEdit.className = updatedTask.priority;

            if (updatedTask.completed) {
                completedTaskList.appendChild(taskToEdit);
            } else {
                taskList.appendChild(taskToEdit);
            }
            taskToEdit = null; // إعادة تعيين المهمة المحددة للتعديل
        } else {
            // إضافة مهمة جديدة إذا لم تكن هناك مهمة محددة للتعديل
            addTaskToList(task);
        }

        saveTasks(currentDay);

        taskModal.classList.remove('fade-in');
        taskModal.classList.add('fade-out');
        requestAnimationFrame(() => {
            taskModal.style.display = 'none';
            taskModal.classList.remove('fade-out');
        });

        taskForm.reset();
    };

    const addTaskToList = (task) => {
        const li = document.createElement('li');
        li.className = task.priority;
        li.innerHTML = `<input type="checkbox" ${task.completed ? 'checked' : ''}><strong>${task.name}</strong>`;
        li.dataset.details = JSON.stringify(task);

        if (task.completed) {
            completedTaskList.appendChild(li);
        } else {
            taskList.appendChild(li);
        }

        updateStats();
    };

    taskList.onclick = handleTaskClick;
    completedTaskList.onclick = handleTaskClick;

    function handleTaskClick(event) {
        if (event.target.tagName === 'LI' || event.target.tagName === 'STRONG') {
            selectedTaskItem = event.target.closest('li');
            const task = JSON.parse(selectedTaskItem.dataset.details);
            taskDetails.innerHTML = `
                <strong>اسم المهمة:</strong> ${task.name}<br>
                <strong>الوصف:</strong> ${task.description}<br>
                <strong>الأولوية:</strong> ${task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}<br>
                <strong>المنبه:</strong> ${task.reminder}<br>
            `;
            detailsModal.style.display = 'block';
            detailsModal.classList.add('fade-in');
        } else if (event.target.type === 'checkbox') {
            const li = event.target.closest('li');
            const task = JSON.parse(li.dataset.details);
            task.completed = event.target.checked;
            li.dataset.details = JSON.stringify(task);

            if (task.completed) {
                completedTaskList.appendChild(li);
                playSound();
            } else {
                taskList.appendChild(li);
            }

            saveTasks(currentDay);
        }
    }

    deleteTaskBtn.onclick = () => {
        if (selectedTaskItem) {
            const confirmDelete = confirm('هل أنت متأكد أنك تريد حذف هذه المهمة؟');
            if (confirmDelete) {
                selectedTaskItem.remove();
                saveTasks(currentDay);
                detailsModal.classList.remove('fade-in');
                detailsModal.classList.add('fade-out');
                requestAnimationFrame(() => {
                    detailsModal.style.display = 'none';
                    detailsModal.classList.remove('fade-out');
                });
            }
        }
    };

    editTaskBtn.onclick = () => {
        if (selectedTaskItem) {
            const task = JSON.parse(selectedTaskItem.dataset.details);
            document.getElementById('taskName').value = task.name;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskReminder').value = task.reminder;

            taskToEdit = selectedTaskItem; // تعيين المهمة المحددة للتعديل

            taskModal.style.display = 'block';
            taskModal.classList.add('fade-in');

            detailsModal.classList.remove('fade-in');
            detailsModal.classList.add('fade-out');
            requestAnimationFrame(() => {
                detailsModal.style.display = 'none';
                detailsModal.classList.remove('fade-out');
            });
        }
    };

    const createDaysOfYear = () => {
        const daysOfYear = [];
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31);

        for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
            daysOfYear.push(new Date(date).toISOString().split('T')[0]);
        }

        daysOfYear.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = formatDate(day);
            dayElement.dataset.date = day;

            if (day === currentDay) {
                dayElement.classList.add('selected');
                setTimeout(() => {
                    dayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 0);
            }

            dayElement.onclick = () => {
                document.querySelectorAll('.day').forEach(el => el.classList.remove('selected'));
                dayElement.classList.add('selected');
                currentDay = day;
                localStorage.setItem('currentDay', currentDay);
                loadTasks(day);
            };

            daysContainer.appendChild(dayElement);
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = arabicMonths[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const playSound = () => {
        const audio = new Audio('m.mp3'); // تأكد من المسار الصحيح
        audio.play();
    };

    createDaysOfYear();
    loadTasks(currentDay);

    // Theme selection logic
    themeSelectPopup.addEventListener('change', (event) => {
        linkElement.href = event.target.value;
        localStorage.setItem('selectedTheme', event.target.value);
    });

    // Load previously selected theme if exists
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        linkElement.href = savedTheme;
        themeSelectPopup.value = savedTheme;
    } else {
        linkElement.href = 'styles.css'; // Default style
    }

    // Toggle popup menu visibility
    const popupToggle = document.getElementById('popupToggle');
    const popupContent = document.querySelector('.popup-content');

    popupToggle.addEventListener('click', () => {
        popupContent.classList.toggle('show');
    });

    window.addEventListener('click', (event) => {
        if (!popupContent.contains(event.target) && !popupToggle.contains(event.target)) {
            if (popupContent.classList.contains('show')) {
                popupContent.classList.remove('show');
            }
        }
    });
});















document.addEventListener('DOMContentLoaded', () => {
  const themeSelectPopup = document.getElementById('themeSelectPopup');
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.id = 'themeStylesheet';
  document.head.appendChild(linkElement);

  // Event listener for theme selection
  themeSelectPopup.addEventListener('change', (event) => {
    linkElement.href = event.target.value;
    localStorage.setItem('selectedTheme', event.target.value);
  });

  // Load previously selected theme if exists
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme) {
    linkElement.href = savedTheme;
    themeSelectPopup.value = savedTheme;
  } else {
    linkElement.href = 'styles.css'; // Default style
  }

  // Toggle popup menu visibility
  const popupToggle = document.getElementById('popupToggle');
  const popupContent = document.querySelector('.popup-content');

  popupToggle.addEventListener('click', () => {
    popupContent.classList.toggle('show');
  });
});

document.addEventListener('DOMContentLoaded', () => {
    const popupToggle = document.getElementById('popupToggle');
    const popupMenu = document.getElementById('popupMenu');

    popupToggle.addEventListener('click', () => {
        popupMenu.classList.toggle('show');
    });

    const themeSelectPopup = document.getElementById('themeSelectPopup');
    themeSelectPopup.addEventListener('change', (event) => {
        const themeStylesheet = document.getElementById('themeStylesheet');
        themeStylesheet.href = event.target.value;
    });
});














document.addEventListener('DOMContentLoaded', () => {
    const popupToggle = document.getElementById('popupToggle');
    const popupContent = document.querySelector('.popup-content');
    const showStatsBtn = document.getElementById('showStatsBtn');
    const statsContainer = document.getElementById('statsContainer');

    // إظهار/إخفاء القائمة المنبثقة عند النقر على زر الإعدادات
    popupToggle.addEventListener('click', () => {
        popupContent.classList.toggle('show');
    });

    // إظهار الإحصائيات عند النقر على زر الإحصائيات
    showStatsBtn.addEventListener('click', () => {
        statsContainer.style.display = statsContainer.style.display === 'none' ? 'block' : 'none';
        updateStats(); // تحديث الإحصائيات عند العرض
    });

    // إخفاء القائمة المنبثقة عند النقر خارجها
    window.addEventListener('click', (event) => {
        if (!popupContent.contains(event.target) && !popupToggle.contains(event.target)) {
            if (popupContent.classList.contains('show')) {
                popupContent.classList.remove('show');
            }
        }
    });

    // وظيفة لتحديث الإحصائيات
    const updateStats = () => {
        const tasks = JSON.parse(localStorage.getItem(`tasks_${currentDay}`)) || [];
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const incompleteTasks = totalTasks - completedTasks;

        document.getElementById('totalTasks').textContent = `إجمالي المهام: ${totalTasks}`;
        document.getElementById('completedTasks').textContent = `المهام المكتملة: ${completedTasks}`;
        document.getElementById('incompleteTasks').textContent = `المهام غير المكتملة: ${incompleteTasks}`;
    };
});















