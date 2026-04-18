import socketio
import eventlet
import stream

sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)
data = 0

@sio.event
def connect(sid, environ):
    print(f"Client connected: {sid}")

if __name__ == '__main__':
    eventlet.spawn(stream.run_camera, sio)
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)
