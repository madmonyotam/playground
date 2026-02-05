export class BreathingAudio {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private filter: BiquadFilterNode | null = null;

    // Track
    private trackBuffer: AudioBuffer | null = null;
    private trackNode: AudioBufferSourceNode | null = null;
    private trackUrl: string | null = null;

    // Breath SFX
    private noiseBuffer: AudioBuffer | null = null;
    private breathNode: AudioBufferSourceNode | null = null;
    private breathFilter: BiquadFilterNode | null = null;
    private breathGain: GainNode | null = null;

    private isInitialized = false;
    private isMuted = false;
    private volume = 0.5;
    private trackVolume = 0.7; // Dedicated music volume
    private breathVolumeScalar = 1.0;
    private pingVolumeScalar = 0.4;
    private _isPlaying = false;

    private trackGain: GainNode | null = null;

    constructor() { }

    async load(url: string) {
        if (this.trackUrl === url) return;

        this.trackUrl = url;
        if (!this.ctx) this.init();

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            if (this.ctx) {
                const newBuffer = await this.ctx.decodeAudioData(arrayBuffer);
                this.trackBuffer = newBuffer;

                if (this._isPlaying) {
                    this.playTrack();
                }
            }
        } catch (e) {
            console.error("Failed to load audio:", e);
        }
    }

    private createPinkNoise() {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * 4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            data[i] *= 0.11;
            b6 = white * 0.115926;
        }
        return buffer;
    }

    init() {
        if (this.isInitialized) return;

        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        this.ctx = new AudioContextClass();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.ctx.destination);

        this.trackGain = this.ctx.createGain();
        this.trackGain.gain.value = this.trackVolume;
        this.trackGain.connect(this.masterGain);

        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 20000;
        this.filter.Q.value = 0;
        this.filter.connect(this.trackGain);

        this.noiseBuffer = this.createPinkNoise();

        this.breathFilter = this.ctx.createBiquadFilter();
        this.breathFilter.type = 'bandpass';
        this.breathFilter.frequency.value = 400;
        this.breathFilter.Q.value = 1;

        this.breathGain = this.ctx.createGain();
        this.breathGain.gain.value = 0;

        this.breathFilter.connect(this.breathGain);
        this.breathGain.connect(this.masterGain);

        this.isInitialized = true;
    }

    start() {
        this._isPlaying = true;
        if (!this.isInitialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (this.trackBuffer && !this.trackNode) {
            this.playTrack();
        }

        if (this.noiseBuffer && !this.breathNode) {
            this.breathNode = this.ctx!.createBufferSource();
            this.breathNode.buffer = this.noiseBuffer;
            this.breathNode.loop = true;
            if (this.breathFilter) this.breathNode.connect(this.breathFilter);
            this.breathNode.start();
        }
    }

    private playTrack() {
        if (!this.ctx || !this.trackBuffer || !this.trackGain) return;

        if (this.trackNode) {
            try {
                this.trackNode.stop();
                this.trackNode.disconnect();
            } catch (e) { }
        }

        this.trackNode = this.ctx.createBufferSource();
        this.trackNode.buffer = this.trackBuffer;
        this.trackNode.loop = true;

        // Ensure the track volume is synced when starting
        this.trackGain.gain.setValueAtTime(this.trackVolume, this.ctx.currentTime);

        if (this.filter) {
            this.trackNode.connect(this.filter);
        } else {
            // Fallback if filter not initialized (safety)
            this.trackNode.connect(this.trackGain);
        }

        this.trackNode.start();
    }

    stop() {
        this._isPlaying = false;
        if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend();
        }
    }

    setVolume(val: number) {
        this.volume = val;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.1);
        }
    }

    setMute(muted: boolean) {
        this.isMuted = muted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.1);
        }
    }

    setTrackVolume(val: number) {
        this.trackVolume = val;
        if (this.trackGain && this.ctx) {
            this.trackGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
        }
    }

    setBreathVolume(val: number) {
        this.breathVolumeScalar = val;
    }

    setPingVolume(val: number) {
        this.pingVolumeScalar = val;
    }

    playPing(stage: string) {
        if (!this.ctx || !this.isInitialized || this.isMuted) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        let freq = 440;
        if (stage === 'inhale') freq = 880;
        else if (stage === 'exhale') freq = 330;
        else if (stage === 'holdFull' || stage === 'holdEmpty') freq = 554;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        // Boost exhale ping specifically as requested
        let stageVolumeBoost = 1.0;
        if (stage === 'exhale') stageVolumeBoost = 2;

        const peakGain = 0.3 * this.pingVolumeScalar * this.volume * stageVolumeBoost;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(peakGain, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(t);
        osc.stop(t + 0.7);

        setTimeout(() => {
            gain.disconnect();
            osc.disconnect();
        }, 800);
    }

    update(stage: string, progress: number) {
        if (!this.ctx || !this.isInitialized) return;

        const t = this.ctx.currentTime;

        let targetFilterFreq = 20000;
        if (this.filter) {
            if (stage === 'exhale') targetFilterFreq = 8000;
            else if (stage === 'holdEmpty') targetFilterFreq = 6000;
            this.filter.frequency.setTargetAtTime(targetFilterFreq, t, 0.5);
        }

        let targetBreathGain = 0;
        let targetBreathFreq = 400;

        if (stage === 'inhale') {
            targetBreathGain = 0.15 * Math.pow(Math.sin(progress * Math.PI / 2), 2);
            targetBreathFreq = 400 + (progress * 300);
        } else if (stage === 'exhale') {
            targetBreathGain = 0.12 * Math.pow(Math.sin((1 - progress) * Math.PI / 2), 2);
            targetBreathFreq = 500 - (progress * 100);
        } else {
            targetBreathGain = 0;
        }

        targetBreathGain *= this.breathVolumeScalar;

        if (this.breathGain) {
            this.breathGain.gain.setTargetAtTime(targetBreathGain, t, 0.3);
        }
        if (this.breathFilter) {
            this.breathFilter.frequency.setTargetAtTime(targetBreathFreq, t, 0.3);
        }
    }
}
