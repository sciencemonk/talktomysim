import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface DigitalFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  offeringTitle: string;
}

export function DigitalFileModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  offeringTitle,
}: DigitalFileModalProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isVideo = fileUrl.match(/\.(mp4|webm|mov)$/i);
  const isPdf = fileUrl.match(/\.pdf$/i);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Complete! 🎉</DialogTitle>
          <DialogDescription>
            Your purchase of "{offeringTitle}" is now available
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Section */}
          <div className="border rounded-lg p-4 bg-muted/50">
            {isImage && (
              <img 
                src={fileUrl} 
                alt={fileName}
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              />
            )}
            
            {isVideo && (
              <video 
                src={fileUrl} 
                controls 
                className="w-full h-auto max-h-[60vh] rounded-lg"
              />
            )}

            {isPdf && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <ExternalLink className="h-16 w-16 text-muted-foreground" />
                <p className="text-lg font-medium">PDF Document</p>
                <p className="text-sm text-muted-foreground">Click "View File" to open in a new tab</p>
              </div>
            )}

            {!isImage && !isVideo && !isPdf && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Download className="h-16 w-16 text-muted-foreground" />
                <p className="text-lg font-medium">Digital File</p>
                <p className="text-sm text-muted-foreground">Click "Download File" to save to your device</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              className="flex-1"
              style={{ backgroundColor: '#81f4aa', color: '#000' }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download File
            </Button>
            
            <Button
              onClick={handleOpenInNewTab}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View File
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            💡 Tip: Save this file to your device. You can always access it through your purchase history.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
