import logging
import numpy as np
import pyaudio
import threading
import time
from transformers import pipeline

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

class AudioStream:
    def __init__(self, rate=16000, chunk=1024, channels=1, interval=2.0) -> None:
        """
        Initializes the audio configuration and emotion model.

        :param rate: Sampling rate in hertz (Hz); Wav2Vec2 requires 16000 Hz
        :param chunk: Number of audio frames per buffer
        :param channels: Number of audio channels (1 for mono, 2 for stereo)
        :param interval: Time interval (in seconds) between emotion analyses
        """
        self.rate = rate
        self.chunk = chunk
        self.channels = channels
        self.format = pyaudio.paInt16
        self.interval = interval
        
        # ML integration
        logger.info("Initializing model...")
        self.emotion_classifier = pipeline("audio-classification", model="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition")
        logger.info("Model loaded successfully.")
        
        # PyAudio setup
        self.audio_interface = pyaudio.PyAudio()
        self.stream = None
        self.stream_active = False

        # Buffer
        self.audio_buffer = []
        self.audio_buffer_lock = threading.Lock()
        
    def _audio_callback(self, in_data, frame_count, time_info, status) -> tuple:
        """Routes audio to speakers AND saves a copy to the buffer for the ML model."""
        with self.audio_buffer_lock:
            self.audio_buffer.append(in_data)
            
            max_chunks = int((self.rate / self.chunk) * 3) # 3 seconds worth of audio
            if len(self.audio_buffer) > max_chunks:
                self.audio_buffer.pop(0)

        return (in_data, pyaudio.paContinue)

    def _emotion_worker(self) -> None:
        """Background thread that periodically evaluates the buffer for emotion."""
        while self.stream_active:
            time.sleep(self.interval) # Wait for the specified interval before analyzing
            
            with self.audio_buffer_lock:
                # Ensure we have at least the required number of chunks for the specified interval
                required_chunks = int((self.rate / self.chunk) * self.interval)
                if len(self.audio_buffer) < required_chunks:
                    continue
                # Grabs the most recent audio chunks
                raw_bytes = b''.join(self.audio_buffer[-required_chunks:])
            
            # The model expects a float32 NumPy array normalized between -1.0 and 1.0. 
            # PyAudio gives us 16-bit PCM bytes, so we convert and scale it down.
            audio_array = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            
            # Run inference and print results
            try:
                predictions = self.emotion_classifier(audio_array)
                top_prediction = predictions[0] # Grab the most confident class
                logger.info(f"Detected emotion: {top_prediction['label']} (Confidence: {top_prediction['score']:.2f})")
            except Exception as e:
                logger.error(f"Inference error: {e}")

    def start(self) -> None:
        """Starts the live audio stream and the background ML thread."""
        self.stream_active = True
        
        # Start ML thread as a daemon so it dies when the main program closes
        self.ml_thread = threading.Thread(target=self._emotion_worker, daemon=True)
        self.ml_thread.start()
        
        logger.info("Starting live audio loopback and emotion detection...")
        self.stream = self.audio_interface.open(
            format=self.format,
            channels=self.channels,
            rate=self.rate,
            input=True,
            output=True,
            frames_per_buffer=self.chunk,
            stream_callback=self._audio_callback
        )
        self.stream.start_stream()

    def stop(self):
        """Gracefully stops all threads and streams."""
        logger.info("Stopping streams and threads...")
        self.stream_active = False
        
        if self.stream is not None:
            self.stream.stop_stream()
            self.stream.close()
            
        self.audio_interface.terminate()
        logger.info("Audio stream terminated.")

if __name__ == "__main__":
    live_audio = AudioStream()
    
    try:
        live_audio.start()
        logger.info("Microphone is live. Press Ctrl+C to stop.")
        
        # Keep the main thread alive
        while live_audio.stream_active:
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        pass
    finally:
        live_audio.stop()