import cv2
import sys

def crop_face(image_path, output_path):
    # Load the pre-trained Haar Cascade classifier for face detection
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Read the image
    img = cv2.imread(image_path)
    if img is None:
        print("Could not read the image")
        sys.exit(1)
        
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Detect faces
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) == 0:
        print("No faces found")
        sys.exit(1)
        
    # Find the largest face
    largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
    x, y, w, h = largest_face
    
    # Add some padding
    padding_x = int(w * 0.4)
    padding_y = int(h * 0.5)
    
    start_y = max(0, y - padding_y)
    end_y = min(img.shape[0], y + h + padding_y)
    start_x = max(0, x - padding_x)
    end_x = min(img.shape[1], x + w + padding_x)
    
    # Crop the face
    face_img = img[start_y:end_y, start_x:end_x]
    
    # Save the cropped face
    cv2.imwrite(output_path, face_img)
    print(f"Face cropped and saved to {output_path}")

crop_face('/Users/hananphashim/.gemini/antigravity/brain/339d7753-3ffd-42d0-8664-df4b3d41d729/media__1784615854608.png', 'frontend/src/assets/resource_person.png')
