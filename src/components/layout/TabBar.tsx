import { memo } from 'react';

export type Tab = 'properties' | 'dashboard' | 'settings';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TabBar = ({ activeTab, onTabChange }: Readonly<TabBarProps>) => {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'properties', label: 'Properties' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'settings', label: 'Settings' },
  ];

  const tabBaseStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    padding: '12px 18px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    marginBottom: '-1px',
  };

  return (
    <div className="lb-tab-bar">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const style = {
          ...tabBaseStyle,
          color: isActive ? '#2F5FE0' : '#6B7280',
          borderBottomColor: isActive ? '#2F5FE0' : 'transparent',
        };
        return (
          <button
            key={tab.id}
            style={style}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default memo(TabBar);
