import * as faceapi from "@vladmandic/face-api";

let modelsLoaded = false;
let modelLoadingPromise = null;

export async function loadFaceModels() {
  if (modelsLoaded) return true;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    try {
      console.log("Loading face-api neural network models...");
      const MODEL_URL = "/models";

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      ]);

      modelsLoaded = true;
      console.log("Face-api models loaded successfully.");
      return true;
    } catch (err) {
      console.warn("Could not load local face-api models:", err.message);
      // Fallback: try loading tinyFaceDetector if full failed
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models");
        modelsLoaded = true;
        return true;
      } catch (e) {
        console.error("Critical model load error:", e);
        return false;
      }
    }
  })();

  return modelLoadingPromise;
}

/**
 * Detect face and extract 128-d descriptor from an image element, video element, or canvas
 */
export async function extractFaceDescriptor(inputElement) {
  await loadFaceModels();

  try {
    // Try SSD MobileNet first for highest accuracy
    let detection = await faceapi
      .detectSingleFace(inputElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    // Fallback to TinyFaceDetector if not detected
    if (!detection) {
      detection = await faceapi
        .detectSingleFace(inputElement, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
    }

    if (!detection) {
      return {
        detected: false,
        error: "No face detected in viewfinder. Please ensure good lighting and face camera directly.",
      };
    }

    return {
      detected: true,
      detection,
      box: detection.detection.box,
      descriptor: Array.from(detection.descriptor),
    };
  } catch (err) {
    console.error("Face detection error:", err);
    return {
      detected: false,
      error: err.message,
    };
  }
}

/**
 * Calculate Euclidean distance between two 128-d vectors
 */
export function euclideanDistance(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return 1.0;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Compare live face descriptor against registered descriptor
 * Standard threshold for face-api is ~ 0.5
 */
export function verifyFaceBiometrics(registeredDescriptor, liveDescriptor, threshold = 0.5) {
  if (!registeredDescriptor || !liveDescriptor) {
    return {
      match: false,
      confidence: 0,
      distance: 1.0,
      reason: "Missing facial descriptor vector",
    };
  }

  const distance = euclideanDistance(registeredDescriptor, liveDescriptor);
  const match = distance <= threshold;

  // Confidence % formula: distance 0 -> 100%, distance threshold -> 65%, distance > 1 -> 0%
  const confidence = Math.max(0, Math.min(100, Math.round((1 - distance / threshold) * 35 + 65)));

  return {
    match,
    confidence,
    distance: Number(distance.toFixed(4)),
    reason: match
      ? "Biometric identity verified successfully."
      : "Facial features do not match registered voter records. Impersonation detected.",
  };
}
