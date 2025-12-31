import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Upload, CheckCircle, X, AlertCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { createClient } from "../utils/supabase/client";
import { toast } from "sonner@2.0.3";

interface ResolveDialogProps {
  open: boolean;
  onClose: () => void;
  onResolve: (imageUrl: string) => void;
  complaintTitle: string;
}

export function ResolveDialog({ open, onClose, onResolve, complaintTitle }: ResolveDialogProps) {
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File size must be less than 10MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError("Please select a valid image file");
        return;
      }

      setUploadError("");
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !imagePreview) {
      setUploadError("Please select an image");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const supabase = createClient();
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `resolution_${timestamp}_${randomString}.${fileExt}`;

      // Upload to Supabase Storage "resolution" bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resolution')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resolution')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      console.log('Image uploaded successfully:', urlData.publicUrl);
      toast.success('Image uploaded successfully!');

      // Pass the public URL to parent component
      onResolve(urlData.publicUrl);
      
      // Reset state
      setImagePreview("");
      setSelectedFile(null);
      onClose();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setUploadError(error.message || 'Failed to upload image. Please try again.');
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setImagePreview("");
    setSelectedFile(null);
    setUploadError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Complaint as Resolved</DialogTitle>
          <DialogDescription>
            Upload a photo of the resolved issue for verification and record keeping.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Complaint</Label>
            <p className="text-sm text-gray-600">{complaintTitle}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution-image">Resolution Photo (Required)</Label>
            
            {!imagePreview ? (
              <label
                htmlFor="resolution-image"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
                </div>
                <input
                  id="resolution-image"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            ) : (
              <div className="relative">
                <ImageWithFallback
                  src={imagePreview}
                  alt="Resolution preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setImagePreview("");
                    setSelectedFile(null);
                    setUploadError("");
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {uploading && (
            <div className="text-sm text-blue-600 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Uploading image to storage...
            </div>
          )}

          {uploadError && (
            <div className="text-sm text-red-600 flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!imagePreview || uploading}
            className="bg-green-600 hover:bg-green-700"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Resolved
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
