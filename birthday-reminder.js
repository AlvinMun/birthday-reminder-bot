const birthdayList = document.getElementById('birthday-list');
const notification = document.getElementById('notification');
const editModal = document.getElementById('edit-modal');
let currentEditIndex = null;
let currentFilter = 'all';

function init() {
    renderBirthdays();
    checkTodayBirthdays();
    setDatePlaceholder();
}

function setDatePlaceholder() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

function saveBirthdays(birthdays) {
    localStorage.setItem('birthdays', JSON.stringify(birthdays));
}

function getBirthdays() {
    return JSON.parse(localStorage.getItem('birthdays')) || [];
}

function renderBirthdays() {
    let birthdays = getBirthdays();
    
    const searchQuery = document.getElementById('search').value.toLowerCase();
    if (searchQuery) {
        birthdays = birthdays.filter(b => b.name.toLowerCase().includes(searchQuery));
    }
    
    const today = new Date();
    const currentYear = today.getFullYear();
    
    switch(currentFilter) {
        case 'upcoming':
            birthdays = birthdays.filter(b => {
                const bday = new Date(b.date);
                bday.setFullYear(currentYear);
                return bday >= today;
            });
            break;
        case 'today':
            birthdays = birthdays.filter(b => isToday(b.date));
            break;
    }
    
    if (birthdays.length === 0) {
        birthdayList.innerHTML = '<div class="empty-message">No birthdays found</div>';
        return;
    }
    
    birthdays.sort((a, b) => {
        const dateA = getNextOccurrence(a.date);
        const dateB = getNextOccurrence(b.date);
        return dateA - dateB;
    });
    
    birthdayList.innerHTML = birthdays.map((b, index) => {
        const nextOccurrence = getNextOccurrence(b.date);
        const daysUntil = Math.floor((nextOccurrence - today) / (1000 * 60 * 60 * 24));
        
        let itemClass = 'birthday-item';
        if (isToday(b.date)) {
            itemClass += ' today';
        }
        
        return `
            <div class="${itemClass}">
                <div class="birthday-info">
                    <div class="birthday-name">${b.name}</div>
                    <div class="birthday-date">${formatDate(b.date)} (${getAge(b.date)} years)</div>
                    ${daysUntil >= 0 ? `<div class="days-remaining">${formatDaysRemaining(daysUntil)}</div>` : ''}
                </div>
                <div class="birthday-actions">
                    <button class="secondary" onclick="openEditModal(${index})"><i class="fas fa-edit"></i></button>
                    <button class="danger" onclick="removeBirthday(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function filterBirthdays(filter) {
    currentFilter = filter;
    renderBirthdays();
}

function searchBirthdays() {
    renderBirthdays();
}

function addBirthday() {
    const name = document.getElementById('name').value.trim();
    const date = document.getElementById('date').value;
    
    if (!name || !date) {
        showNotification('Please fill in both fields');
        return;
    }
    
    const birthdays = getBirthdays();
    birthdays.push({ name, date });
    saveBirthdays(birthdays);
    renderBirthdays();
    
    document.getElementById('name').value = '';
    setDatePlaceholder();
    
    showNotification('Birthday added');
}

function removeBirthday(index) {
    if (!confirm('Are you sure you want to delete this birthday?')) return;
    
    const birthdays = getBirthdays();
    birthdays.splice(index, 1);
    saveBirthdays(birthdays);
    renderBirthdays();
    
    showNotification('Birthday removed');
}

function openEditModal(index) {
    const birthdays = getBirthdays();
    const birthday = birthdays[index];
    
    document.getElementById('edit-name').value = birthday.name;
    document.getElementById('edit-date').value = birthday.date;
    currentEditIndex = index;
    
    editModal.style.display = 'flex';
}

function closeModal() {
    editModal.style.display = 'none';
    currentEditIndex = null;
}

function saveEditedBirthday() {
    const name = document.getElementById('edit-name').value.trim();
    const date = document.getElementById('edit-date').value;
    
    if (!name || !date) {
        showNotification('Please fill in both fields');
        return;
    }
    
    const birthdays = getBirthdays();
    birthdays[currentEditIndex] = { name, date };
    saveBirthdays(birthdays);
    renderBirthdays();
    closeModal();
    
    showNotification('Changes saved');
}

function showNotification(message) {
    notification.textContent = message;
    notification.className = 'notification show';
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function checkTodayBirthdays() {
    const birthdays = getBirthdays();
    const todayBirthdays = birthdays.filter(b => isToday(b.date));
    
    if (todayBirthdays.length > 0) {
        const names = todayBirthdays.map(b => b.name).join(', ');
        showNotification(`🎉 Today: ${names}'s birthday!`);
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function getAge(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

function getNextOccurrence(dateString) {
    const today = new Date();
    const bday = new Date(dateString);
    const currentYear = today.getFullYear();
    
    bday.setFullYear(currentYear);
    if (bday < today) {
        bday.setFullYear(currentYear + 1);
    }
    
    return bday;
}

function isToday(dateString) {
    const today = new Date();
    const bday = new Date(dateString);
    return bday.getDate() === today.getDate() && 
           bday.getMonth() === today.getMonth();
}

function formatDaysRemaining(days) {
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    return `${days} days remaining`;
}

window.onload = init;