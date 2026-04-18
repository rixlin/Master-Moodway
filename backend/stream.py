import cv2
from deepface import DeepFace

def my_custom_function(data):
    # This is where you 'pipe' your data
    print(f"Detected: {data}")

cap = cv2.VideoCapture(0)

while True:
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
            
            # 4. Draw the custom "Marker"
            # Green box for the face
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            adjust_anger = 0.8 * running_anger + 0.2 * anger_score
            running_anger = adjust_anger
            # Display Anger Weight
            label = f"Anger: {running_anger:.2f}%"
            cv2.putText(frame, label, (x, y - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

    except Exception as e:
        print(f"Error: {e}")

    # Display (Optional)
    cv2.imshow('Custom Stream', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("done")