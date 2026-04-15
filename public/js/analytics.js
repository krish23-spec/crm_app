// Analytics page logic
let overviewChart, funnelChart, sourceChart;

document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }
    
    await loadAnalytics();
});

async function loadAnalytics() {
    try {
        // Load dashboard data for metrics
        const dashboardData = await apiRequest('/analytics/dashboard');
        if (dashboardData.success) {
            const a = dashboardData.analytics;
            
            // Update metrics
            document.getElementById('conversionRate').textContent = `${a.conversionRate || 0}%`;
            document.getElementById('totalOutreach').textContent = a.totalOutreach || 0;
            
            // Calculate active leads (excluding closed)
            const activeLeads = (a.leadStatus || [])
                .filter(s => !s.status.includes('Closed'))
                .reduce((sum, s) => sum + s.count, 0);
            document.getElementById('activeLeads').textContent = activeLeads;
            
            // Calculate average deal value
            if (a.totalRevenue > 0 && a.dealsClosed > 0) {
                const avgValue = a.totalRevenue / a.dealsClosed;
                document.getElementById('avgDealValue').innerHTML = formatCurrency(avgValue);
            }
            
            // Update charts
            updateOverviewChart(a.monthlyLeads, a.monthlyRevenue);
            updateFunnelChart(a.leadStatus);
            updateSourceChart(a.leadStatus);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        showNotification('Failed to load analytics data', 'error');
    }
}

function updateOverviewChart(leadsData, revenueData) {
    const ctx = document.getElementById('monthlyOverviewChart')?.getContext('2d');
    if (!ctx) return;
    
    const months = leadsData.map(d => d.month) || [];
    const leadCounts = leadsData.map(d => d.count) || [];
    const revenueAmounts = revenueData.map(d => d.revenue / 1000) || []; // in thousands
    
    if (overviewChart) overviewChart.destroy();
    
    overviewChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Leads Added',
                    data: leadCounts,
                    backgroundColor: 'rgba(67, 97, 238, 0.7)',
                    borderRadius: 8
                },
                {
                    label: 'Revenue (₹ Thousands)',
                    data: revenueAmounts,
                    backgroundColor: 'rgba(6, 214, 160, 0.7)',
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Count / ₹ (000s)' } } }
        }
    });
}

function updateFunnelChart(statusData) {
    const ctx = document.getElementById('funnelChart')?.getContext('2d');
    if (!ctx) return;
    
    // Order for funnel: New -> Contacted -> Interested -> Closed Won
    const funnelOrder = ['New', 'Contacted', 'Interested', 'Closed (Won)'];
    const funnelData = funnelOrder.map(status => {
        const found = statusData.find(s => s.status === status);
        return found ? found.count : 0;
    });
    
    if (funnelChart) funnelChart.destroy();
    
    funnelChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: funnelOrder,
            datasets: [{
                label: 'Lead Count',
                data: funnelData,
                backgroundColor: 'rgba(114, 9, 183, 0.7)',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, title: { display: true, text: 'Number of Leads' } } }
        }
    });
}

function updateSourceChart(statusData) {
    const ctx = document.getElementById('sourceChart')?.getContext('2d');
    if (!ctx) return;
    
    // This would ideally come from API with source breakdown
    // For demo, using sample data or from leads API
    loadSourceData();
}

async function loadSourceData() {
    try {
        const leadsData = await apiRequest('/leads');
        if (leadsData.success && leadsData.leads) {
            const sourceCounts = {};
            leadsData.leads.forEach(lead => {
                const source = lead.source || 'Other';
                sourceCounts[source] = (sourceCounts[source] || 0) + 1;
            });
            
            const ctx = document.getElementById('sourceChart')?.getContext('2d');
            if (!ctx) return;
            
            if (sourceChart) sourceChart.destroy();
            
            sourceChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(sourceCounts),
                    datasets: [{
                        data: Object.values(sourceCounts),
                        backgroundColor: ['#4361ee', '#ffd166', '#06d6a0', '#ef476f', '#7209b7']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }
    } catch (error) {
        console.error('Error loading source data:', error);
    }
}