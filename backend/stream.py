import cv2
from deepface import DeepFace
import socketio
import eventlet

def my_custom_function(data):
    # This is where you 'pipe' your data
    score = data["emotion"]["angry"]
    emo = data["dominant_emotion"]
    print(f"Detected: {score}, {emo}")

def run_camera(sio):
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    count = 0

    while True:
        eventlet.sleep(0)
        # if count % 20 != 0:
        #     count += 1
        #     continue
        ret, frame = cap.read()
        running_anger = 0
        if not ret:
            break

        try:
            # 1. Run analysis on the current frame
            # enforce_detection=False prevents the code from crashing if no face is seen
            results = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)

            # 2. Pipe the results to your function
            for result in results:
                my_custom_function(result)

            for res in results:
                # 2. Get coordinates for the highlight
                region = res["region"]
                x, y, w, h = region['x'], region['y'], region['w'], region['h']
                
                # 3. Extract the Anger weight
                anger_score = res["emotion"]["angry"]
                anger_score_json = float(anger_score)
                
                # 4. Draw the custom "Marker"
                # Green box for the face
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                adjust_anger = 0.1 * running_anger + 0.9 * anger_score
                running_anger = adjust_anger
                # Display Anger Weight
                label = f"Anger: {anger_score:.2f}%"
                cv2.putText(frame, label, (x, y - 10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                sio.emit('message', {'data': anger_score_json})
                print("emitted")

        except Exception as e:
            print(f"Error: {e}")

        # Display (Optional)
        cv2.imshow('Custom Stream', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        count += 1

    cap.release()
    cv2.destroyAllWindows()
    print("done")