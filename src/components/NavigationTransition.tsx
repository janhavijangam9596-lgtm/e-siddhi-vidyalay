import { useEffect, useState, ReactNode } from 'react';
import { useEnhancedRouter } from '../utils/enhanced-router';

interface NavigationTransitionProps {
  children: ReactNode;
}

export function NavigationTransition({ children }: NavigationTransitionProps) {
  const { currentRoute } = useEnhancedRouter();
  const [displayContent, setDisplayContent] = useState<ReactNode>(children);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    // Start exit animation
    setAnimationClass('page-exit-active');
    setIsTransitioning(true);
    
    // After exit animation, update content and start enter animation
    const exitTimer = setTimeout(() => {
      setDisplayContent(children);
      setAnimationClass('page-enter');
      
      // Start enter animation
      setTimeout(() => {
        setAnimationClass('page-enter-active');
        setIsTransitioning(false);
      }, 10);
    }, 150);

    return () => clearTimeout(exitTimer);
  }, [currentRoute, children]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className={`
          w-full h-full
          ${animationClass}
          ${!isTransitioning ? 'animate-fade-in' : ''}
        `}
        style={{
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {displayContent}
      </div>
    </div>
  );
}
