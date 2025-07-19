"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface CameraUploadProps {
  onPhotoUrlChange: (url: string) => void;
  initialUrl?: string;
}

export default function CameraUpload({ onPhotoUrlChange, initialUrl = "" }: CameraUploadProps) {
  const [photoUrl, setPhotoUrl] = useState<string>(initialUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera stream
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error("Erreur d'accès à la caméra:", error);
      toast.error("Impossible d'accéder à la caméra");
    }
  };

  // Close camera stream
  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOpen(false);
    }
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob and upload
        canvas.toBlob((blob) => {
          if (blob) {
            uploadImage(blob);
          }
        }, 'image/jpeg', 0.8);
      }
      
      // Close camera after capture
      closeCamera();
    }
  };

  // Handle file selection from file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const uploadImage = async (file: Blob) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Échec de l\'upload');
      }
      
      const data = await response.json();
      
      // Update state with returned URL
      setPhotoUrl(data.url);
      onPhotoUrlChange(data.url);
      toast.success("Photo uploadée avec succès");
    } catch (error) {
      console.error("Erreur d'upload:", error);
      toast.error("Échec de l'upload de l'image");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Clear the selected photo
  const clearPhoto = () => {
    setPhotoUrl("");
    onPhotoUrlChange("");
  };

  return (
    <div className="space-y-4">
      {/* Input for manual URL entry */}
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="URL de la photo"
          value={photoUrl}
          onChange={(e) => {
            setPhotoUrl(e.target.value);
            onPhotoUrlChange(e.target.value);
          }}
          className="flex-1"
          disabled={isUploading}
        />
        {photoUrl && (
          <Button variant="outline" size="icon" onClick={clearPhoto} disabled={isUploading}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Camera preview and controls */}
      {isCameraOpen ? (
        <div className="space-y-2">
          <div className="relative bg-black rounded-md overflow-hidden aspect-video">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={closeCamera}>
              Annuler
            </Button>
            <Button onClick={capturePhoto}>
              Prendre la photo
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button 
            onClick={openCamera} 
            className="flex-1"
            disabled={isUploading}
          >
            <Camera className="h-4 w-4 mr-2" />
            Prendre une photo
          </Button>
          
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            className="flex-1"
            variant="outline"
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choisir une image
          </Button>
          
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      )}
      
      {/* Hidden canvas for processing captured images */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Show upload progress overlay */}
      {isUploading && (
        <div className="mt-2 rounded-md border border-border bg-muted p-4 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
          <span>Upload en cours...</span>
        </div>
      )}
      
      {/* Show preview if a photo URL exists */}
      {photoUrl && !isUploading && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Prévisualisation :</p>
            <Image 
              src={photoUrl} 
              alt="Aperçu du fichier uploadé" 
              width={500}
              height={256}
              className="w-full h-auto max-h-64 object-contain"
              onError={() => toast.error("Impossible de charger l'image")}
            />
          </div>
      )}
    </div>
  );
}