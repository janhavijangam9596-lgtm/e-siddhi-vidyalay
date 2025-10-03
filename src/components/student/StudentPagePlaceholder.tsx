import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigation } from '../../hooks/useNavigation';
import { ChevronLeft, Construction } from 'lucide-react';

interface StudentPagePlaceholderProps {
  title: string;
  description?: string;
}

export function StudentPagePlaceholder({ title, description }: StudentPagePlaceholderProps) {
  const { navigate } = useNavigation();

  return (
    <div className="p-6 space-y-6">
      <Button 
        variant="outline" 
        onClick={() => navigate('dashboard')}
        className="mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Construction className="h-6 w-6 text-orange-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Construction className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{title} - Coming Soon!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {description || `The ${title} page is currently under development. Please check back later.`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


