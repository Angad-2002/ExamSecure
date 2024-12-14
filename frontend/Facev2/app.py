from flask import Flask, request, jsonify
from facedb import FaceDB
import base64
import cv2
import numpy as np
import uuid
import os
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Initialize the FaceDB instance
db = FaceDB(path="facedata")

# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

@app.route('/save-face', methods=['POST'])
def save_face():
    try:
        # Get the uploaded file from the request
        file = request.files.get('image')
        name = request.form.get('name')
        reg_no = request.form.get('reg_no')

        print (name, reg_no)

        if not file:
            return jsonify({'error': 'No image file uploaded'}), 400
        if not name or not reg_no:
            return jsonify({'error': 'Name or registration number is missing'}), 400
        
        # Save the uploaded image
        file_path = os.path.join("captured_face.jpg")

        # Save the file to the specified path
        file.save(file_path)

        face_id = f"{reg_no}_{name}"

        result = db.recognize(img="captured_face.jpg")
        print (result)
        if result:
            new_reg_no, new_name = result.id.split("_", 1)
            print(f"Face recognized:\nID: {new_reg_no}, Name: {new_name}, Confidence: {result.confidence}")
        else:
            print("Face not recognized. Adding to database...")

            face_id = db.add(img= "captured_face.jpg", id=face_id, name = name)
            print(f"Added face with ID: {reg_no} and Name: {name} to the database.")

            # Test if the image is now recognized
            print("Retesting face recognition...")
            new_result = db.recognize(img= "captured_face.jpg")

            new_reg_no, new_name = new_result.id.split("_", 1)
            if new_result:
                print(
                    f"Face recognized after adding to database:\nID: {new_reg_no}, Name: {new_name}, Confidence: {new_result.confidence}")
            else:
                print("Failed to recognize face even after adding to the database.")


        return jsonify({'message': 'Face saved successfully'}), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to save face data.",
            "details": str(e)
        }), 500

@app.route('/recognize-face', methods=['POST'])
def recognize_face():
    try:
        # Get the uploaded image from the request
        file = request.files.get('frame')  # "frame" is the name from the frontend form
        classname = request.form.get('classroomId')
        print (request.files)
        print (1)
        print (classname)
        if not file:
            return jsonify({'error': 'No image file uploaded'}), 400
        
        # Save the uploaded image
        file_path = os.path.join("captured_face.jpg")

        # Save the file to the specified path
        file.save(file_path)

        result = db.recognize(img="captured_face.jpg")
        print (result.id)
        reg_no, name = result.id.split("_", 1)
        # If no faces are detected, return a message indicating that
        if not result:
            return jsonify({
                "message": "No faces detected in the image."
            }), 400
        arr = [name, reg_no]
        print (arr)
        return jsonify({
            "message": "Face recognition completed.",
            "faces": arr
        }), 200


    except Exception as e:
        return jsonify({
            "error": "Failed to recognize face.",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
