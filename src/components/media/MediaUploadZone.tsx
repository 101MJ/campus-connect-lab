
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage, FileText, Video, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useProjectMedia } from '@/hooks/useProjectMedia';

interface MediaUploadZoneProps {
  projectId: string;
  onUploadSuccess: () => void;
  allowedTypes?: ('image' | 'document' | 'video')[];
  maxFiles?: number;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

const MediaUploadZone: React.FC<MediaUploadZoneProps> = ({
  projectId,
  onUploadSuccess,
  allowedTypes = ['image', 'document', 'video'],
  maxFiles = 10
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const { uploadFile } = useProjectMedia(projectId);

  const getFileType = (file: File): 'image' | 'document' | 'video' | null => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (
      file.type === 'application/pdf' ||
      file.type.includes('document') ||
      file.type === 'text/plain'
    ) return 'document';
    return null;
  };

  const validateFile = (file: File): string | null => {
    const fileType = getFileType(file);
    
    if (!fileType || !allowedTypes.includes(fileType)) {
      return 'File type not allowed';
    }

    // 100MB limit
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return `File too large. Max size is 100MB`;
    }

    return null;
  };

  const handleUpload = async (file: File): Promise<void> => {
    const fileType = getFileType(file);
    if (!fileType) throw new Error('Invalid file type');

    // Update progress to 30%
    setUploadingFiles(prev => prev.map(f => 
      f.file === file ? { ...f, progress: 30 } : f
    ));

    try {
      const success = await uploadFile(file, fileType);
      
      if (success) {
        setUploadingFiles(prev => prev.map(f => 
          f.file === file ? { ...f, progress: 100 } : f
        ));

        // Remove from uploading list after completion
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.file !== file));
          onUploadSuccess();
        }, 1000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      setUploadingFiles(prev => prev.map(f => 
        f.file === file ? { ...f, error: error.message || 'Upload failed' } : f
      ));
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles: File[] = [];
    
    for (const file of acceptedFiles) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Add files to uploading state
    const newUploadingFiles = validFiles.map(file => ({
      file,
      progress: 0
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files
    for (const file of validFiles) {
      try {
        await handleUpload(file);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
  }, [projectId, allowedTypes, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept: {
      'image/*': allowedTypes.includes('image') ? ['.jpeg', '.jpg', '.png', '.gif', '.webp'] : [],
      'video/*': allowedTypes.includes('video') ? ['.mp4', '.webm', '.mov'] : [],
      'application/pdf': allowedTypes.includes('document') ? ['.pdf'] : [],
      'application/msword': allowedTypes.includes('document') ? ['.doc'] : [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': allowedTypes.includes('document') ? ['.docx'] : [],
      'text/plain': allowedTypes.includes('document') ? ['.txt'] : []
    }
  });

  const removeUploadingFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  };

  const getFileIcon = (file: File) => {
    const type = getFileType(file);
    switch (type) {
      case 'image': return <FileImage className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Project media and files will be visible to everyone if this project is made public in the showcase.
        </AlertDescription>
      </Alert>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive 
            ? 'border-collabCorner-purple bg-collabCorner-purple/5' 
            : 'border-gray-300 hover:border-collabCorner-purple hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        
        {isDragActive ? (
          <p className="text-lg text-collabCorner-purple font-medium">
            Drop files here...
          </p>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports: {allowedTypes.join(', ')} • Max {maxFiles} files • 100MB per file
            </p>
          </div>
        )}
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Uploading Files</h3>
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getFileIcon(uploadingFile.file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadingFile.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUploadingFile(uploadingFile.file)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {uploadingFile.error ? (
                <p className="text-sm text-red-600">{uploadingFile.error}</p>
              ) : (
                <div className="space-y-1">
                  <Progress value={uploadingFile.progress} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {uploadingFile.progress}% complete
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploadZone;
