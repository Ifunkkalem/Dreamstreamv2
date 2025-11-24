// stream_adapter.js (mock + fallback)
class SDSStreamAdapter {
  constructor({ wallet, onPoints, onEvent, onError, useMock = true }) {
    this.wallet = wallet;
    this.onPoints = onPoints;
    this.onEvent = onEvent;
    this.onError = onError;
    this.interval = null;
    this.currentPoints = 0;
    this.isMockMode = useMock || (typeof window.SomniaSDK === 'undefined');
  }
  connect() {
    if (this.isMockMode) {
      this.onEvent && this.onEvent("Stream connected (Mock)");
      this._startMock();
    } else {
      this._connectSDK();
    }
  }
  disconnect() {
    if (this.interval) clearInterval(this.interval);
    this.onEvent && this.onEvent("Stream disconnected");
  }
  _startMock() {
    this.interval = setInterval(() => {
      const add = Math.floor(Math.random() * 5) + 1;
      this.currentPoints += add;
      this.onPoints && this.onPoints(this.wallet, this.currentPoints);
      this.onEvent && this.onEvent(`Mock +${add} pts`);
    }, 2000);
  }
  _connectSDK() {
    this.onEvent && this.onEvent("SDK connection not found — using mock");
    this._startMock();
  }
}
window.SDSStreamAdapter = SDSStreamAdapter;
