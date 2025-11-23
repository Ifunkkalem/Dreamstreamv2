// stream_adapter.js — FINAL Somnia Competition Edition
// Hybrid: Real Somnia Stream (future-ready) + Mock mode (stable)

class SomniaStreamAdapter {
    constructor({ wallet, onPoints, onEvent, onMission, useMock = false }) {
        this.wallet = wallet;
        this.onPoints = onPoints;
        this.onEvent = onEvent;
        this.onMission = onMission;
        this.useMock = useMock;
        this.connected = false;
        this.interval = null;
        this.points = 0;
    }

    connect() {
        this.connected = true;

        if (this.useMock) {
            this._startMock();
            return;
        }

        // future Somnia SDK here:
        try {
            this.onEvent("Somnia SDK mode not available, switching to Mock…");
            this._startMock();
        } catch (e) {
            console.warn("SDK failed:", e);
            this._startMock();
        }
    }

    disconnect() {
        this.connected = false;
        if (this.interval) clearInterval(this.interval);
        this.onEvent("Stream disconnected");
    }

    _startMock() {
        this.onEvent("Mock Stream started");
        let tick = 0;

        this.interval = setInterval(() => {
            if (!this.connected) return;

            const gain = Math.floor(Math.random() * 5) + 1;
            this.points += gain;

            if (this.onPoints) {
                this.onPoints(this.wallet, this.points);
            }

            if (tick % 10 === 0 && this.onMission) {
                this.onMission(this.wallet, {
                    name: "Activity Burst",
                    time: new Date().toISOString()
                });
            }

            tick++;
        }, 1200);
    }
}

// Expose globally
window.SomniaStreamAdapter = SomniaStreamAdapter;
