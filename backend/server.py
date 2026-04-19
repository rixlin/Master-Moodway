import socketio
import eventlet
import audio
import stream

sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)
data = 0

@sio.event
def connect(sid, environ):
    print(f"Client connected: {sid}")

if __name__ == '__main__':
    eventlet.spawn(stream.run_camera, sio)
    eventlet.spawn(audio.run_audio, sio)
    eventlet.wsgi.server(eventlet.listen(('', 6000)), app)
