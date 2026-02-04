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
    private breathVolumeScalar = 1.0;

    constructor() { }

    async load(url: string) {
        this.trackUrl = url;
        if (!this.ctx) this.init();
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            if (this.ctx) {
                this.trackBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            }
        } catch (e) {
            console.error("Failed to load audio:", e);
        }
    }

    private createPinkNoise() {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * 4; // 4 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Pink Noise Algorithm
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
            data[i] *= 0.11; // Compensate for gain
            b6 = white * 0.115926;
        }
        return buffer;
    }

    init() {
        if (this.isInitialized) return;

        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        this.ctx = new AudioContextClass();

        // 1. Master Chain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.ctx.destination);

        // 2. Track Filter
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 20000;
        this.filter.Q.value = 0;
        this.filter.connect(this.masterGain);

        // 3. Breath SFX Setup
        this.noiseBuffer = this.createPinkNoise();

        this.breathFilter = this.ctx.createBiquadFilter();
        this.breathFilter.type = 'bandpass';
        this.breathFilter.frequency.value = 400; // Base breath freq
        this.breathFilter.Q.value = 1;

        this.breathGain = this.ctx.createGain();
        this.breathGain.gain.value = 0; // Silent by default

        this.breathFilter.connect(this.breathGain);
        this.breathGain.connect(this.masterGain);

        this.isInitialized = true;
    }

    start() {
        if (!this.isInitialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (this.trackBuffer && !this.trackNode) {
            this.playTrack();
        }

        // Start Breath Loop
        if (this.noiseBuffer && !this.breathNode) {
            this.breathNode = this.ctx!.createBufferSource();
            this.breathNode.buffer = this.noiseBuffer;
            this.breathNode.loop = true;
            if (this.breathFilter) this.breathNode.connect(this.breathFilter);
            this.breathNode.start();
        }
    }

    private playTrack() {
        if (!this.ctx || !this.trackBuffer) return;

        if (this.trackNode) {
            try { this.trackNode.stop(); } catch (e) { }
        }

        this.trackNode = this.ctx.createBufferSource();
        this.trackNode.buffer = this.trackBuffer;
        this.trackNode.loop = true;

        if (this.filter) {
            this.trackNode.connect(this.filter);
        }
        this.trackNode.start();
    }

    stop() {
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

    setBreathVolume(val: number) {
        this.breathVolumeScalar = val;
    }

    update(stage: string, progress: number) {
        if (!this.ctx || !this.isInitialized) return;

        const t = this.ctx.currentTime;

        // Track Logic: Subtle Filter
        let targetFilterFreq = 20000;
        if (this.filter) {
            if (stage === 'exhale') targetFilterFreq = 8000;
            else if (stage === 'holdEmpty') targetFilterFreq = 6000;
            this.filter.frequency.setTargetAtTime(targetFilterFreq, t, 0.5);
        }

        // Breath SFX Logic (Inhale/Exhale Swells)
        let targetBreathGain = 0;
        let targetBreathFreq = 400;

        // Softer, more gradual curve
        if (stage === 'inhale') {
            // Rush in: 400Hz -> 700Hz, Gain 0 -> 0.15
            // Use smoother curve (easeQuad)
            targetBreathGain = 0.15 * Math.pow(Math.sin(progress * Math.PI / 2), 2);
            targetBreathFreq = 400 + (progress * 300);
        } else if (stage === 'exhale') {
            // Rush out: 500Hz -> 400Hz, Gain 0.12 -> 0
            targetBreathGain = 0.12 * Math.pow(Math.sin((1 - progress) * Math.PI / 2), 2);
            targetBreathFreq = 500 - (progress * 100);
        } else if (stage === 'holdFull') {
            // Let it ring slightly then fade
            targetBreathGain = 0;
        } else { // holdEmpty
            targetBreathGain = 0;
        }

        // Apply Golden Number Scalar
        targetBreathGain *= this.breathVolumeScalar;

        if (this.breathGain) {
            // Slower time constant (0.3) for very gradual changes
            this.breathGain.gain.setTargetAtTime(targetBreathGain, t, 0.3);
        }
        if (this.breathFilter) {
            this.breathFilter.frequency.setTargetAtTime(targetBreathFreq, t, 0.3);
        }
    }
}
