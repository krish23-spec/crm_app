// Authentication page logic
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) {
        window.location.href = '/dashboard';
        return;
    }
    
    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tabId}Form`).classList.add('active');
        });
    });
    
    // ✅ Login form (FIXED)
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const data = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard';
            } else {
                showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            showNotification(error.message || 'Network error', 'error');
        }
    });
    
    // ✅ Signup form (FIXED)
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        try {
            const data = await apiRequest('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showNotification('Account created successfully!', 'success');
                window.location.href = '/dashboard';
            } else {
                showNotification(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            showNotification(error.message || 'Network error', 'error');
        }
    });
});