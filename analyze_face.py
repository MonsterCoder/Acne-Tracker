import sys
import cv2
import mediapipe as mp
import json

def analyze_face(image_path):
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, min_detection_confidence=0.5)

    image = cv2.imread(image_path)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_image)

    if not results.multi_face_landmarks:
        return {"error": "No face detected"}

    face_landmarks = results.multi_face_landmarks[0]
    
    # Analyze acne (this is a simplified example)
    acne_count = 0
    regions = {
        "Forehead": 0,
        "Cheeks": 0,
        "Chin": 0
    }

    for landmark in face_landmarks.landmark:
        x = int(landmark.x * image.shape[1])
        y = int(landmark.y * image.shape[0])
        if image[y, x, 2] > 200 and image[y, x, 1] < 100:  # Red areas
            acne_count += 1
            if y < image.shape[0] * 0.33:
                regions["Forehead"] += 1
            elif y < image.shape[0] * 0.66:
                regions["Cheeks"] += 1
            else:
                regions["Chin"] += 1

    severity = "Low" if acne_count < 5 else "Moderate" if acne_count < 15 else "High"
    
    affected_areas = [region for region, count in regions.items() if count > 0]
    
    return {
        "acneCount": acne_count,
        "severity": severity,
        "locations": affected_areas
    }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Invalid arguments"}))
        sys.exit(1)

    image_path = sys.argv[1]
    result = analyze_face(image_path)
    print(json.dumps(result))

