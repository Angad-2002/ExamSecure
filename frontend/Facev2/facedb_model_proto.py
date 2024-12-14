from facedb import FaceDB
import cv2

# Initialize the FaceDB instance
db = FaceDB(path="facedata")

# Initialize the webcam
video_capture = cv2.VideoCapture(0)

# Check if the webcam opened successfully
if not video_capture.isOpened():
    print("Error: Could not open video stream")
    exit()

# Load the pre-trained face detection Haar cascade model
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Define the font for displaying text
font = cv2.FONT_HERSHEY_SIMPLEX

# Start real-time face detection and recognition
while True:
    # Capture frame-by-frame
    ret, frame = video_capture.read()

    if not ret:
        print("Failed to capture frame. Exiting...")
        break

    # Convert the frame to grayscale for face detection
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces in the frame
    faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    # Process each detected face
    for (x, y, w, h) in faces:
        # Crop the face region from the frame
        face_img = frame[y:y + h, x:x + w]

        # Save the cropped face image temporarily for recognition
        temp_image_path = "temp_face.jpg"
        cv2.imwrite(temp_image_path, face_img)

        # Recognize the face using FaceDB
        result = db.recognize(img=temp_image_path)

        # Display recognition result on top of the face rectangle
        print (result)
        if result:
            label = result.id.split('-')[0]
        else:
            label = "Unrecognized"

        # Draw a rectangle around the face and put the label text above it
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
        cv2.putText(frame, label, (x, y - 10), font, 0.5, (0, 255, 0), 2)

    # Display the frame with face tracking and recognition results
    cv2.imshow("Real-Time Face Recognition", frame)

    # Break the loop on 'q' key press
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the webcam and close the window
video_capture.release()
cv2.destroyAllWindows()
