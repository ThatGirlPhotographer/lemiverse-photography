function startHeartbeat(apiUrl, serviceId, token, intervalMs = 30000) {
    const sendPing = async () => {
        try {
            const res = await fetch(`${apiUrl}/heartbeat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id: serviceId })
            });
            
            if (!res.ok) {
                console.warn(`[Uptime Monitor] Heartbeat failed: ${res.statusText}`);
            }
        } catch (err) {
            console.error(`[Uptime Monitor] Error sending heartbeat:`, err);
        }
    };

    sendPing();
    const timer = setInterval(sendPing, intervalMs);
    
    console.log(`[Uptime Monitor] Heartbeat started for Service ID: ${serviceId}`);
    return timer;
}

module.exports = { startHeartbeat };