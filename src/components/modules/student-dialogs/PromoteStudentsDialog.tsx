import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { toast } from 'sonner';
import { api } from '../../../utils/api';
import { AlertCircle, GraduationCap } from 'lucide-react';

interface PromoteStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onStudentsPromoted: () => void;
}

export function PromoteStudentsDialog({
  open,
  onOpenChange,
  selectedCount,
  onStudentsPromoted
}: PromoteStudentsDialogProps) {
  const handlePromoteStudents = async () => {
    try {
      await api.promoteStudents?.([]);
      toast.success(`${selectedCount} students promoted successfully`);
      onOpenChange(false);
      onStudentsPromoted();
    } catch (error) {
      toast.error('Failed to promote students');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote Students</DialogTitle>
          <DialogDescription>
            Promote {selectedCount} selected students to the next class.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action will move students to the next academic level. This cannot be undone.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handlePromoteStudents}>
              <GraduationCap className="h-4 w-4 mr-2" />
              Confirm Promotion
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}