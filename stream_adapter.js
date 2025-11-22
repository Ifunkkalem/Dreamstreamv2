// stream_adapter.js
const SOMNIA_RPC = window.SOMNIA_CONFIG.rpc;
const SOMNIA_WS = 'wss://stream-testnet.somnia.network';

class SDSStreamAdapter {
  constructor({ wallet, onPoints, onEvent, onError, useMock=false }) {
    this.wallet = wallet;
    this.onPoints = onPoints;
    this.onEvent = onEvent;
    this.onError = onError;
    this.useMock = useMock || (typeof window.SomniaSDK === 'undefined' && typeof WebSocket === 'undefined');
    this.points = 0;
    this.ws = null;
    this.mockInterval = null;
  }

  connect(){
    if(this.useMock) return this._startMock();
    if(typeof window.SomniaSDK !== 'undefined') return this._connectSDK();
    if(typeof WebSocket !== 'undefined') return this._connectWS();
    return this._startMock();
  }

  disconnect(){
    if(this.ws){ try{ this.ws.close(); }catch(e){} this.ws=null; }
    if(this.mockInterval) clearInterval(this.mockInterval);
    this.onEvent && this.onEvent('Stream disconnected', false);
  }

  _connectSDK(){
    try{
      this.onEvent && this.onEvent('Connecting via Somnia SDK...', false);
      const conn = window.SomniaSDK.connectStream({ wallet: this.wallet, rpcUrl: SOMNIA_RPC });
      conn.on('open', ()=>this.onEvent && this.onEvent('SDK connected', true));
      conn.on('data', data=>{
        if(data?.points!==undefined){ this.points = data.points; this.onPoints && this.onPoints(this.wallet, this.points); this.onEvent && this.onEvent('SDK points update'); }
        if(data?.missionCompleted && window.onMissionUpdate) window.onMissionUpdate(this.wallet, { name: data.missionCompleted });
      });
      conn.on('error', err=>{
        this.onError && this.onError(err); this.onEvent && this.onEvent('SDK error fallback', false); this._connectWS();
      });
      this.conn = conn;
    }catch(e){ this.onError && this.onError(e); this._connectWS(); }
  }

  _connectWS(){
    try {
      this.onEvent && this.onEvent('Connecting to Somnia WS...', false);
      const url = SOMNIA_WS + '?wallet=' + encodeURIComponent(this.wallet);
      this.ws = new WebSocket(url);
      this.ws.onopen = ()=> this.onEvent && this.onEvent('WS connected', true);
      this.ws.onmessage = (m)=>{
        try {
          const data = JSON.parse(m.data);
          if(data?.points!==undefined){ this.points = data.points; this.onPoints && this.onPoints(this.wallet, this.points); this.onEvent && this.onEvent('WS points update'); }
          if(data?.missionCompleted && window.onMissionUpdate) window.onMissionUpdate(this.wallet, { name: data.missionCompleted });
        } catch(e){}
      };
      this.ws.onerror = (e)=> { this.onError && this.onError(e); this.onEvent && this.onEvent('WS error->mock', false); this._startMock(); };
      this.ws.onclose = ()=> this.onEvent && this.onEvent('WS closed', false);
    } catch(e){ this.onError && this.onError(e); this._startMock(); }
  }

  _startMock(){
    this.onEvent && this.onEvent('Mock stream started', true);
    if(this.mockInterval) clearInterval(this.mockInterval);
    this.mockInterval = setInterval(()=>{
      const plus = 1 + Math.floor(Math.random()*4);
      this.points += plus;
      this.onPoints && this.onPoints(this.wallet, this.points);
      this.onEvent && this.onEvent('Mock +'+plus);
      if(Math.random()<0.08 && window.onMissionUpdate) window.onMissionUpdate(this.wallet, { name: 'Mock Mission #' + Math.floor(Math.random()*100) });
    }, 1500);
  }
}
window.SDSStreamAdapter = SDSStreamAdapter;
