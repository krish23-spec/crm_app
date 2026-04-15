// Dashboard page logic
let monthlyChart, statusChart;

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }
    
    await loadDashboardData();
    
    // Refresh reminders button
    document.getElementById('refreshReminders')?.addEventListener('click', loadDashboardData);
    
    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                window.location.href = `/leads?search=${encodeURIComponent(e.target.value)}`;
            }
        });
    }
});

async function loadDashboardData() {
    try {
        const data = await apiRequest('/analytics/dashboard');
        
        if (data.success && data.analytics) {
            const a = data.analytics;
            
            // Update stats
            document.getElementById('totalLeads').textContent = a.totalLeads || 0;
            document.getElementById('totalOutreach').textContent = a.totalOutreach || 0;
            document.getElementById('dealsClosed').textContent = a.dealsClosed || 0;
            document.getElementById('totalRevenue').innerHTML = formatCurrency(a.totalRevenue || 0);
            
            // Update charts
            updateMonthlyChart(a.monthlyLeads, a.monthlyRevenue);
            updateStatusChart(a.leadStatus);
            
            // Update reminders
            updateRemindersList(a.remindersList || []);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

function updateMonthlyChart(leadsData, revenueData) {
    const ctx = document.getElementById('monthlyChart')?.getContext('2d');
    if (!ctx) return;
    
    const months = leadsData.map(d => d.month) || [];
    const leadCounts = leadsData.map(d => d.count) || [];
    const revenueAmounts = revenueData.map(d => d.revenue) || [];
    
    if (monthlyChart) monthlyChart.destroy();
    
    monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Leads Added',
                    data: leadCounts,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Revenue (₹)',
                    data: revenueAmounts,
                    borderColor: '#06d6a0',
                    backgroundColor: 'rgba(6, 214, 160, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true }, y1: { position: 'right', beginAtZero: true } }
        }
    });
}

function updateStatusChart(statusData) {
    const ctx = document.getElementById('statusChart')?.getContext('2d');
    if (!ctx) return;
    
    const labels = statusData.map(s => s.status);
    const counts = statusData.map(s => s.count);
    
    if (statusChart) statusChart.destroy();
    
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: ['#4361ee', '#ffd166', '#06d6a0', '#ef476f', '#7209b7', '#fca311'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function updateRemindersList(reminders) {
    const container = document.getElementById('remindersList');
    if (!container) return;
    
    if (!reminders || reminders.length === 0) {
        container.innerHTML = '<div class="empty-state">No upcoming reminders</div>';
        return;
    }
    
    container.innerHTML = reminders.map(reminder => `
        <div class="reminder-item">
            <div class="reminder-info">
                <h4>${escapeHtml(reminder.title)}</h4>
                <p>Lead: ${escapeHtml(reminder.lead_name)}</p>
                ${reminder.description ? `<p class="reminder-desc">${escapeHtml(reminder.description)}</p>` : ''}
            </div>
            <div class="reminder-date">
                <i class="fas fa-calendar-alt"></i> ${formatDate(reminder.reminder_date)}
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}