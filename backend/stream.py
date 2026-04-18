import cv2
from deepface import DeepFace

def my_custom_function(data):
    # This is where you 'pipe' your data
    print(f"Detected: {data}")

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    try:
        # 1. Run analysis on the current frame
        # enforce_detection=False prevents the code from crashing if no face is seen
        results = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)

        # 2. Pipe the results to your function
        for result in results:
            my_custom_function(result)

    except Exception as e:
        print(f"Error: {e}")

    # Display (Optional)
    cv2.imshow('Custom Stream', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()