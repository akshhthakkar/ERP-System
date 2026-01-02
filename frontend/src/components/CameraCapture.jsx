import React, { useState, useRef, useCallback } from "react";
import { BsCamera, BsX, BsArrowRepeat, BsCheck } from "react-icons/bs";

/**
 * CameraCapture Component
 * Uses browser Media APIs to capture images from camera
 * Returns base64 encoded image to parent component
 */
const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera permissions.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Failed to access camera. Please try again.");
      }
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  // Capture image from video
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const base64Image = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(base64Image);
      stopCamera();
    }
  }, [stopCamera]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Confirm and send to parent
  const confirmCapture = useCallback(() => {
    if (capturedImage && onCapture) {
      onCapture(capturedImage);
    }
    if (onClose) {
      onClose();
    }
  }, [capturedImage, onCapture, onClose]);

  // Handle close
  const handleClose = useCallback(() => {
    stopCamera();
    if (onClose) {
      onClose();
    }
  }, [stopCamera, onClose]);

  // Start camera on mount
  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {capturedImage ? "Preview" : "Capture Image"}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <BsX size={24} />
          </button>
        </div>

        {/* Camera/Preview Area */}
        <div className="relative bg-gray-900 aspect-video">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
              <div>
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
          )}

          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-4 flex justify-center gap-4">
          {!error && !capturedImage && isCameraActive && (
            <button
              onClick={captureImage}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              <BsCamera size={20} />
              Capture
            </button>
          )}

          {capturedImage && (
            <>
              <button
                onClick={retakePhoto}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <BsArrowRepeat size={20} />
                Retake
              </button>
              <button
                onClick={confirmCapture}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <BsCheck size={20} />
                Use This Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
