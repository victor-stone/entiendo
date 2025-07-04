import React from 'react';

export default function TabButtons({ activeTab, setActiveTab, tabs }) {
    return (
        <div className="flex border-b mb-4">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    className={`px-4 py-2 focus:outline-none ${activeTab === tab.key ? 'border-b-2 border-blue-500 font-bold' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}