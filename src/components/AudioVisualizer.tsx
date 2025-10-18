import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioSrc: string;
}

// Singleton audio controller - ensures only ONE audio plays globally
class AudioController {
  private static instance: AudioController | null = null;
  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying = false;
  
  static getInstance(): AudioController {
    if (!AudioController.instance) {
      AudioController.instance = new AudioController();
    }
    return AudioController.instance;
  }
  
  async initialize(audioElement: HTMLAudioElement): Promise<void> {
    // If already initialized with a different element, stop the old one
    if (this.audio && this.audio !== audioElement) {
      console.log('Stopping previous audio instance');
      this.stop();
    }
    
    if (this.audio === audioElement && this.isPlaying) {
      console.log('Audio already initialized and playing');
      return;
    }
    
    this.audio = audioElement;
    
    // Create audio context and analyser
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaElementSource(audioElement);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      console.log('AudioContext and analyser created');
    }
    
    // Start playback
    try {
      await audioElement.play();
      this.isPlaying = true;
      console.log('Audio started successfully');
    } catch (err) {
      console.error('Failed to play audio:', err);
    }
  }
  
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }
  
  cleanup(): void {
    this.stop();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audio = null;
    this.audioContext = null;
    this.analyser = null;
    AudioController.instance = null;
    console.log('AudioController cleaned up');
  }
  
  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
}

const AudioVisualizer = ({ audioSrc }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const controllerRef = useRef<AudioController | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;
    
    console.log('AudioVisualizer mounted');

    // Get singleton controller
    controllerRef.current = AudioController.getInstance();
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Visualization loop
    const draw = () => {
      const analyser = controllerRef.current?.getAnalyser();
      if (!analyser || !dataArrayRef.current || !ctx || !canvas) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArrayRef.current);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(0.5, '#3b82f6');
      gradient.addColorStop(1, '#a855f7');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArrayRef.current.length) * 3;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const dataValue = dataArrayRef.current[i] || 5;
        const barHeight = Math.max(5, (dataValue / 255) * canvas.height);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };

    // Initialize data array for frequency data
    const analyser = controllerRef.current.getAnalyser();
    if (analyser) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
    
    // Start visualization
    draw();
    
    // Initialize audio with user interaction
    const initAudio = async () => {
      if (controllerRef.current) {
        await controllerRef.current.initialize(audio);
        // Update data array after initialization
        const analyser = controllerRef.current.getAnalyser();
        if (analyser) {
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
      }
    };
    
    // Try to play immediately
    initAudio();
    
    // Also allow user interaction to start
    const handleInteraction = () => {
      initAudio();
    };
    
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });

    // Cleanup
    return () => {
      console.log('Cleaning up AudioVisualizer');
      
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (controllerRef.current) {
        controllerRef.current.cleanup();
      }
    };
  }, [audioSrc]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] h-32 bg-white">
      <audio
        key={audioSrc}
        ref={audioRef}
        src={audioSrc}
        loop
        crossOrigin="anonymous"
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};

export default AudioVisualizer;
