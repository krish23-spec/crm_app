// Leads management page
let currentLeads = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }
    
    await loadLeads();
    
    // Event listeners
    document.getElementById('addLeadBtn')?.addEventListener('click', openAddModal);
    document.getElementById('searchInput')?.addEventListener('keyup', filterLeads);
    document.getElementById('statusFilter')?.addEventListener('change', filterLeads);
    document.getElementById('countryFilter')?.addEventListener('change', filterLeads);
    document.getElementById('exportCSVBtn')?.addEventListener('click', exportCSV);
    
    // Modal close
    const modal = document.getElementById('leadModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.querySelector('.close-modal');
    
    closeBtn?.addEventListener('click', () => modal.style.display = 'none');
    cancelBtn?.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
    
    // Form submit
    document.getElementById('leadForm')?.addEventListener('submit', saveLead);
});

async function loadLeads() {
    try {
        //const data = await apiRequest('/leads');
        const data = await apiRequest('/api/leads');
        console.log("API DATA:", data);
        if (data.success) {
            currentLeads = data.leads;
            renderLeads(currentLeads);
        }
    } catch (error) {
        //console.error('Error loading leads:', error);
        console.error('FULL ERROR:', error.message);
        showNotification('Failed to load leads', 'error');
    }
}

function renderLeads(leads) {
    const tbody = document.getElementById('leadsList');
    if (!tbody) return;
    
    if (leads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center">No leads found</td></tr>';
        return;
    }
    
    tbody.innerHTML = leads.map(lead => `
        <tr>
            <td><strong>${escapeHtml(lead.name)}</strong></td>
            <td><span class="country-badge">${lead.country === 'India' ? '🇮🇳 India' : '🌍 International'}</span></td>
            <td>${escapeHtml(lead.email || '-')}</td>
            <td>${escapeHtml(lead.business_type || '-')}</td>
            <td><span class="status-badge status-${lead.status.replace(/ /g, '-').replace(/\(/g, '').replace(/\)/g, '')}">${lead.status}</span></td>
            <td>${lead.outreach_count || 0}</td>
            <td class="action-buttons">
                <button class="action-btn" onclick="recordOutreach(${lead.id})" title="Record Outreach"><i class="fas fa-phone-alt"></i></button>
                <button class="action-btn" onclick="openEditModal(${lead.id})" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="deleteLead(${lead.id})" title="Delete"><i class="fas fa-trash"></i></button>
                <button class="action-btn" onclick="openReminderModal(${lead.id}, '${escapeHtml(lead.name)}')" title="Set Reminder"><i class="fas fa-bell"></i></button>
            </td>
        </tr>
    `).join('');
}

function filterLeads() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const countryFilter = document.getElementById('countryFilter')?.value || 'all';
    
    let filtered = [...currentLeads];
    
    if (searchTerm) {
        filtered = filtered.filter(lead => 
            lead.name.toLowerCase().includes(searchTerm) ||
            (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
            (lead.phone && lead.phone.includes(searchTerm))
        );
    }
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    
    if (countryFilter !== 'all') {
        filtered = filtered.filter(lead => lead.country === countryFilter);
    }
    
    renderLeads(filtered);
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add New Lead';
    document.getElementById('leadForm').reset();
    document.getElementById('leadId').value = '';
    document.getElementById('leadModal').style.display = 'flex';
}

async function openEditModal(id) {
    try {
        const data = await apiRequest(`/leads/${id}`);
        if (data.success && data.lead) {
            const lead = data.lead;
            document.getElementById('modalTitle').textContent = 'Edit Lead';
            document.getElementById('leadId').value = lead.id;
            document.getElementById('leadName').value = lead.name;
            document.getElementById('leadCountry').value = lead.country;
            document.getElementById('leadEmail').value = lead.email || '';
            document.getElementById('leadPhone').value = lead.phone || '';
            document.getElementById('leadBusiness').value = lead.business_type || '';
            document.getElementById('leadSource').value = lead.source;
            document.getElementById('leadStatus').value = lead.status;
            document.getElementById('leadNotes').value = lead.notes || '';
            document.getElementById('leadModal').style.display = 'flex';
        }
    } catch (error) {
        showNotification('Error loading lead data', 'error');
    }
}

async function saveLead(e) {
    e.preventDefault();
    
    const leadId = document.getElementById('leadId').value;
    const leadData = {
        name: document.getElementById('leadName').value,
        country: document.getElementById('leadCountry').value,
        email: document.getElementById('leadEmail').value,
        phone: document.getElementById('leadPhone').value,
        business_type: document.getElementById('leadBusiness').value,
        source: document.getElementById('leadSource').value,
        status: document.getElementById('leadStatus').value,
        notes: document.getElementById('leadNotes').value,
        amount: document.getElementById('leadAmount')?.value || 0
    };
    
    try {
        let response;
        if (leadId) {
            response = await apiRequest(`/api/leads/${leadId}`, {
                method: 'PUT',
                body: JSON.stringify(leadData)
            });
        } else {
            response = await apiRequest('/api/leads', {
                method: 'POST',
                body: JSON.stringify(leadData)
            });
        }
        
        if (response.success) {
            showNotification(leadId ? 'Lead updated successfully' : 'Lead created successfully', 'success');
            document.getElementById('leadModal').style.display = 'none';
            await loadLeads();
        }
    } catch (error) {
        showNotification('Error saving lead', 'error');
    }
}

async function deleteLead(id) {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
        const response = await apiRequest(`/leads/${id}`, { method: 'DELETE' });
        if (response.success) {
            showNotification('Lead deleted successfully', 'success');
            await loadLeads();
        }
    } catch (error) {
        showNotification('Error deleting lead', 'error');
    }
}

async function recordOutreach(id) {
    try {
        const response = await apiRequest(`/api/leads/${id}/outreach`, { method: 'POST' });
        if (response.success) {
            showNotification('Outreach recorded successfully', 'success');
            await loadLeads();
        }
    } catch (error) {
        showNotification('Error recording outreach', 'error');
    }
}

function openReminderModal(leadId, leadName) {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    const defaultDate = date.toISOString().slice(0, 16);
    
    const title = prompt('Reminder title:', `Follow up with ${leadName}`);
    if (!title) return;
    
    const reminderDate = prompt('Reminder date (YYYY-MM-DD HH:MM):', defaultDate);
    if (!reminderDate) return;
    
    const description = prompt('Description (optional):', '');
    
    createReminder(leadId, title, reminderDate, description);
}

async function createReminder(leadId, title, reminderDate, description) {
    try {
        const response = await apiRequest('/api/reminders', {
            method: 'POST',
            body: JSON.stringify({
                lead_id: leadId,
                reminder_date: reminderDate,
                title: title,
                description: description || ''
            })
        });
        
        if (response.success) {
            showNotification('Reminder set successfully', 'success');
        }
    } catch (error) {
        showNotification('Error setting reminder', 'error');
    }
}

async function exportCSV() {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch('/api/analytics/export-leads', {
            headers: {
                Authorization: 'Bearer ' + token
            }
        });

        if (!response.ok) throw new Error('Failed to export');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'leads.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();

    } catch (error) {
        console.error(error);
        showNotification('Export failed', 'error');
    }
}

// addetional for safe for crush ui

function escapeHtml(text) {
    if (!text) return '';
    return text
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}



document.getElementById('leadStatus').addEventListener('change', (e) => {
    const amountField = document.getElementById('amountField');
    
    if (e.target.value === 'closed (won)') {
        amountField.style.display = 'block';
    } else {
        amountField.style.display = 'none';
    }
});