import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { toast } from 'sonner';
import { api } from '../../../utils/api';
import { Upload, Download, AlertCircle, RefreshCw } from 'lucide-react';

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentsImported: () => void;
}

export function BulkUploadDialog({ open, onOpenChange, onStudentsImported }: BulkUploadDialogProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx?)$/i)) {
        toast.error('Please upload a CSV or Excel file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setUploadedFile(file);
      toast.success(`File "${file.name}" selected successfully`);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    try {
      const result = await api.importStudents?.({ students: [], fileName: uploadedFile.name });
      if (result?.success) {
        toast.success(`Successfully imported ${result.imported} students`);
        onOpenChange(false);
        setUploadedFile(null);
        onStudentsImported();
      } else {
        toast.error(result?.message || 'Failed to import students');
      }
    } catch (error) {
      toast.error('Failed to import students. Please check your file format.');
      console.error('Bulk import error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const csvContent = await api.getImportTemplate?.();
      const blob = new Blob([csvContent || ''], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student_import_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
      console.error('Template download error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open: boolean) => {
      if (!open) {
        setUploadedFile(null);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Students</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import multiple students at once.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => document.getElementById('file-upload')?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files[0];
              if (file) {
                const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                handleFileSelect(event);
              }
            }}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
            />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {uploadedFile ? (
              <div>
                <p className="text-lg font-medium text-green-600 mb-2">File Selected!</p>
                <p className="text-sm text-gray-600">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">({(uploadedFile.size / 1024).toFixed(2)} KB)</p>
              </div>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">Drop your file here</p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <Button variant="outline" onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  document.getElementById('file-upload')?.click();
                }}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Import Guidelines:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Supported formats: CSV, Excel (.xlsx, .xls)</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Required columns: First Name, Last Name, Class, Section, Roll Number</li>
              <li>• Optional columns: Date of Birth, Gender, Parent Name, Parent Phone, Email, Address</li>
              <li>• Download sample template for reference</li>
            </ul>
          </div>

          {uploadedFile && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ready to import from: <strong>{uploadedFile.name}</strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkUpload}
                disabled={!uploadedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Students
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}