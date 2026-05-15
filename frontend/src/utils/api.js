// API utility for sending the cognitive game metrics

const getHeaders = () => {
    return {
        'Content-Type': 'application/json'
    };
};

const apiFetch = async (url, options = {}) => {
    return fetch(url, {
        ...options,
        credentials: 'include'
    });
};

export const registerUser = async (userData) => {
    try {
        const response = await apiFetch('http://localhost:8000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Registration failed');
        return data;
    } catch (err) {
        throw err;
    }
};

export const loginUser = async (username, password) => {
    try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await apiFetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Login failed');
        return data;
    } catch (err) {
        throw err;
    }
};

export const fetchCurrentUser = async () => {
    try {
        const response = await apiFetch('http://localhost:8000/api/auth/me', {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Not authenticated');
        return await response.json();
    } catch (err) {
        throw err;
    }
};

export const fetchPatients = async () => {
    try {
        const response = await apiFetch('http://localhost:8000/api/patients', {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch patients');
        return await response.json();
    } catch (err) {
        throw err;
    }
};

export const registerClinicPatient = async (patientData) => {
    try {
        const response = await apiFetch('http://localhost:8000/api/patients', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(patientData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Failed to register patient');
        return data;
    } catch (err) {
        throw err;
    }
};

export const submitGameMetrics = async (payload) => {
    console.log("Submitting metrics to API...", payload);
    try {
        const response = await apiFetch('http://localhost:8000/api/metrics', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Profile generated successfully:", data);
        return data;
    } catch (err) {
        console.error("Failed to submit metrics:", err);
        throw err;
    }
};

export const submitMemoryMetrics = async (payload) => {
    console.log("Submitting memory metrics to API...", payload);
    try {
        const response = await apiFetch('http://localhost:8000/api/metrics/memory', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Profile updated successfully:", data);
        return data;
    } catch (err) {
        console.error("Failed to submit memory metrics:", err);
        throw err;
    }
};

export const submitFlexibilityMetrics = async (payload) => {
    console.log("Submitting flexibility metrics to API...", payload);
    try {
        const response = await apiFetch('http://localhost:8000/api/metrics/flexibility', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Profile updated successfully:", data);
        return data;
    } catch (err) {
        console.error("Failed to submit flexibility metrics:", err);
        throw err;
    }
};

export const submitSpeedMetrics = async (payload) => {
    console.log("Submitting speed metrics to API...", payload);
    try {
        const response = await apiFetch('http://localhost:8000/api/metrics/speed', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Profile updated successfully:", data);
        return data;
    } catch (err) {
        console.error("Failed to submit speed metrics:", err);
        throw err;
    }
};

export const fetchCognitiveProfile = async (childId) => {
    console.log(`Fetching profile for ${childId}...`);
    try {
        const response = await apiFetch(`http://localhost:8000/api/profile/${childId}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error(`Profile fetch failed: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error("Failed to fetch profile:", err);
        throw err;
    }
};

export const fetchCognitiveHistory = async (childId) => {
    console.log(`Fetching longitudinal history for ${childId}...`);
    try {
        const response = await apiFetch(`http://localhost:8000/api/profile/${childId}/history`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error(`History fetch failed: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error("Failed to fetch history:", err);
        throw err;
    }
};

export const fetchGameSessions = async (childId) => {
    try {
        const response = await apiFetch(`http://localhost:8000/api/metrics/${childId}/history`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error(`Game sessions fetch failed: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        throw err;
    }
};

export const logoutUser = async () => {
    try {
        const response = await apiFetch('http://localhost:8000/api/auth/logout', {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Logout failed');
        return await response.json();
    } catch (err) {
        throw err;
    }
};

export const fetchAlerts = async () => {
    try {
        const response = await apiFetch('http://localhost:8000/api/alerts');
        if (!response.ok) throw new Error('Failed to fetch alerts');
        return await response.json();
    } catch (err) {
        throw err;
    }
};

export const markAlertRead = async (alertId) => {
    try {
        const response = await apiFetch(`http://localhost:8000/api/alerts/${alertId}/read`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Failed to mark alert as read');
        return await response.json();
    } catch (err) {
        throw err;
    }
};
