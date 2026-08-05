import cv2
import sys

def crop_face(image_path, output_path):
    img = cv2.imread(image_path)
    if img is None:
        print("Could not read the image")
        sys.exit(1)
        
    # use face_recognition library or just use dnn detector
    net = cv2.dnn.readNetFromCaffe(
        "/tmp/deploy.prototxt",
        "/tmp/res10_300x300_ssd_iter_140000.caffemodel"
    )
    
    h, w = img.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(img, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))
    net.setInput(blob)
    faces = net.forward()
    
    best_confidence = 0
    best_box = None
    for i in range(faces.shape[2]):
        confidence = faces[0, 0, i, 2]
        if confidence > 0.5:
            if confidence > best_confidence:
                best_confidence = confidence
                box = faces[0, 0, i, 3:7] * [w, h, w, h]
                best_box = box.astype("int")
                
    if best_box is None:
        print("No faces found")
        sys.exit(1)
        
    x1, y1, x2, y2 = best_box
    
    face_w = x2 - x1
    face_h = y2 - y1
    
    padding_x = int(face_w * 0.4)
    padding_y = int(face_h * 0.5)
    
    start_y = max(0, y1 - padding_y)
    end_y = min(img.shape[0], y2 + padding_y)
    start_x = max(0, x1 - padding_x)
    end_x = min(img.shape[1], x2 + padding_x)
    
    face_img = img[start_y:end_y, start_x:end_x]
    
    cv2.imwrite(output_path, face_img)
    print(f"Face cropped and saved to {output_path}")

crop_face('/Users/hananphashim/.gemini/antigravity/brain/339d7753-3ffd-42d0-8664-df4b3d41d729/media__1784615854608.png', 'frontend/src/assets/resource_person.png')
