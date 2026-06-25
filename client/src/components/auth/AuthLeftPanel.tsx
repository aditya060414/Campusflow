import React from 'react';

interface AuthLeftPanelProps {
  description: string;
}

const AuthLeftPanel: React.FC<AuthLeftPanelProps> = ({ description }) => {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-bold text-text">CampusFlow</h1>
      <p className="text-sm text-muted">v1.0</p>
      <p className="mt-6 text-sm text-muted leading-relaxed max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
};

export default AuthLeftPanel;
