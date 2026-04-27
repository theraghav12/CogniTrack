// API utility for sending the cognitive game metrics
export const submitGameMetrics = async (payload) => {
    console.log("Submitting metrics to API...", payload);
    try {
        const response = await fetch('http://127.0.0.1:8000/api/metrics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        const response = await fetch('http://127.0.0.1:8000/api/metrics/memory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        const response = await fetch('http://127.0.0.1:8000/api/metrics/flexibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        const response = await fetch('http://127.0.0.1:8000/api/metrics/speed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        const response = await fetch(`http://127.0.0.1:8000/api/profile/${childId}`);
        if (!response.ok) {
            throw new Error(`Profile fetch failed: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error("Failed to fetch profile:", err);
        throw err;
    }
};
