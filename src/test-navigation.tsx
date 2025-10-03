import React from 'react';
import { useNavigation } from './hooks/useNavigation';

export function TestNavigation() {
  const { currentRoute, navigate } = useNavigation();

  const testRoutes = [
    'dashboard',
    'students', 
    'staff',
    'admission',
    'fees',
    'exam',
    'library',
    'classes',
    'management',
    'reports'
  ];

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px' }}>
      <h3>Navigation Test Component</h3>
      <p>Current Route: <strong>{currentRoute}</strong></p>
      <p>Current URL: <strong>{window.location.pathname}</strong></p>
      
      <div style={{ marginTop: '20px' }}>
        <h4>Test Navigation:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {testRoutes.map(route => (
            <button
              key={route}
              onClick={() => {
                console.log(`Navigating to: ${route}`);
                navigate(route as any);
              }}
              style={{
                padding: '8px 16px',
                background: currentRoute === route ? '#4CAF50' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {route}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h4>Debug Info:</h4>
        <pre style={{ background: 'white', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify({ 
            currentRoute, 
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}