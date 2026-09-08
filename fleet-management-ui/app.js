const API_URL = 'https://fleet-management-api-arwq.onrender.com/api/v1';
const API_KEY = 'secret-api-key';

class FleetApp {
    constructor() {
        this.vehicles = [];
        this.sessions = new Map();
        this.init();
    }

    init() {
        this.checkHealth();
        this.loadVehicles();
        this.setupEventListeners();
    }

    async checkHealth() {
        try {
            const res = await fetch('https://fleet-management-api-arwq.onrender.com/healthz');
            if (res.ok) {
                document.getElementById('api-status-dot').style.background = '#4ade80';
                document.getElementById('api-status-text').innerText = 'Backend: Online';
            }
        } catch (e) {
            document.getElementById('api-status-dot').style.background = '#f87171';
            document.getElementById('api-status-text').innerText = 'Backend: Offline';
        }
    }

    setupEventListeners() {
        document.getElementById('vehicle-form').addEventListener('submit', (e) => this.handleVehicleSubmit(e));
        
        const vinInput = document.getElementById('vin');
        const countDisplay = document.getElementById('vin-count');
        vinInput.addEventListener('input', () => {
            const count = vinInput.value.length;
            countDisplay.innerText = `${count} / 17 characters`;
            countDisplay.style.color = count === 17 ? 'var(--success)' : 'var(--text-secondary)';
        });
    }

    async handleVehicleSubmit(e) {
        e.preventDefault();
        const data = {
            vin: document.getElementById('vin').value,
            make: document.getElementById('make').value,
            model: document.getElementById('model').value,
            year: parseInt(document.getElementById('year').value)
        };

        try {
            const res = await fetch(`${API_URL}/vehicles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                    'Idempotency-Key': `v-${Date.now()}`
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            if (res.ok) {
                this.showToast('Vehicle created successfully!');
                e.target.reset();
                this.loadVehicles();
                // Reset counter
                document.getElementById('vin-count').innerText = '0 / 17 characters';
                document.getElementById('vin-count').style.color = 'var(--text-secondary)';
            } else {
                let errorMsg = result.message || result.detail || 'Error';
                if (result.errors && result.errors.length > 0) {
                    errorMsg = result.errors.map(err => `${err.field}: ${err.message}`).join(', ');
                }
                this.showToast(errorMsg, true);
            }
        } catch (err) {
            this.showToast('Network error occurred', true);
        }
    }

    generateRandomVin() {
        const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
        let vin = '';
        for (let i = 0; i < 17; i++) {
            vin += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const vinInput = document.getElementById('vin');
        vinInput.value = vin;
        vinInput.dispatchEvent(new Event('input'));
    }

    async loadVehicles() {
        try {
            const res = await fetch(`${API_URL}/vehicles`, {
                headers: { 'x-api-key': API_KEY }
            });
            const data = await res.json();
            this.vehicles = data.items || [];
            this.renderVehicles();
        } catch (err) {
            console.error('Failed to load vehicles', err);
        }
    }

    async startSession(vehicleId) {
        const stationId = `ST-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
        try {
            const res = await fetch(`${API_URL}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                    'Idempotency-Key': `s-${Date.now()}`
                },
                body: JSON.stringify({
                    vehicleId,
                    stationId,
                    maxKwh: 75.0
                })
            });

            const data = await res.json();
            if (res.ok) {
                this.sessions.set(vehicleId, data.id);
                this.showToast(`Session started at ${stationId}`);
                this.renderVehicles();
            } else {
                this.showToast(data.message || 'Busy', true);
            }
        } catch (err) {
            this.showToast('Failed to start session', true);
        }
    }

    async stopSession(vehicleId) {
        const sessionId = this.sessions.get(vehicleId);
        if (!sessionId) return;

        try {
            const res = await fetch(`${API_URL}/sessions/${sessionId}/stop`, {
                method: 'POST',
                headers: {
                    'x-api-key': API_KEY,
                    'Idempotency-Key': `stop-${Date.now()}`
                }
            });

            if (res.ok) {
                this.sessions.delete(vehicleId);
                this.showToast('Session stopped');
                this.renderVehicles();
            }
        } catch (err) {
            this.showToast('Failed to stop session', true);
        }
    }

    renderVehicles() {
        const container = document.getElementById('vehicle-list-container');
        if (this.vehicles.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No vehicles in fleet.</p>';
            return;
        }

        container.innerHTML = `
            <div class="vehicle-list">
                ${this.vehicles.map(v => `
                    <div class="vehicle-item">
                        <div class="vehicle-info">
                            <h3>${v.make} ${v.model}</h3>
                            <p>${v.vin} • ${v.year} • Status: <span style="color: ${v.status === 'active' ? 'var(--success)' : 'var(--text-secondary)'}">${v.status}</span></p>
                        </div>
                        <div class="session-controls">
                            ${this.sessions.has(v.id) 
                                ? `<button class="btn-sm" style="background: var(--danger)" onclick="window.app.stopSession('${v.id}')">Stop Charging</button>`
                                : `<button class="btn-sm secondary" onclick="window.app.startSession('${v.id}')">Start Charge</button>`
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showToast(msg, isError = false) {
        const toast = document.getElementById('toast');
        toast.innerText = msg;
        toast.style.borderColor = isError ? 'var(--danger)' : 'var(--accent-color)';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    async searchPolicies() {
        const container = document.getElementById('policy-content');
        container.innerHTML = '<p style="color: var(--text-secondary);">Searching...</p>';
        try {
            const res = await fetch(`https://fleet-management-api-arwq.onrender.com/api/policies/search?status=active`, {
                headers: { 'x-api-key': 'secret-api-key' }
            });
            const data = await res.json();
            if (res.ok) {
                container.innerHTML = `<pre style="font-size: 0.75rem; color: #a5b4fc; white-space: pre-wrap;">${JSON.stringify(data, null, 2)}</pre>`;
                this.showToast('Policies loaded successfully');
            } else {
                container.innerHTML = `<p style="color: var(--danger);">Error: ${data.error?.message || 'Failed'}</p>`;
                this.showToast(data.error?.message || 'Error loading policies', true);
            }
        } catch (err) {
            container.innerHTML = '<p style="color: var(--danger);">Connection failed</p>';
            this.showToast('Failed to fetch policies', true);
        }
    }

    async viewPolicyDetails() {
        const container = document.getElementById('policy-content');
        container.innerHTML = '<p style="color: var(--text-secondary);">Loading details...</p>';
        try {
            const res = await fetch(`https://fleet-management-api-arwq.onrender.com/api/policies/123e4567-e89b-12d3-a456-426614174000`, {
                headers: { 'x-api-key': 'secret-api-key' }
            });
            const data = await res.json();
            if (res.ok) {
                container.innerHTML = `<pre style="font-size: 0.75rem; color: #6ee7b7; white-space: pre-wrap;">${JSON.stringify(data, null, 2)}</pre>`;
                this.showToast('Policy details loaded');
            } else {
                container.innerHTML = `<p style="color: var(--danger);">Error: ${data.error?.message || 'Failed'}</p>`;
                this.showToast(data.error?.message || 'Error loading policy', true);
            }
        } catch (err) {
            container.innerHTML = '<p style="color: var(--danger);">Connection failed</p>';
            this.showToast('Failed to fetch policy details', true);
        }
    }
}

// Export to window for onclick handlers
window.app = new FleetApp();
