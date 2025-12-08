import React from 'react';

const MobileMockups = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-sky-400 mb-4">
            📱 PropertyPal Mobile App
          </h1>
          <p className="text-gray-400 text-lg">
            iOS Design Mockups with Sky Blue Branding
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-gray-800 border border-sky-400/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-3xl">ℹ️</div>
            <div>
              <h3 className="text-white font-semibold mb-2">About These Mockups</h3>
              <p className="text-gray-400 mb-3">
                These are design mockups for the PropertyPal mobile application. They showcase the key features
                and user interface design using the new sky blue branding.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-sky-400/10 text-sky-400 rounded-full text-sm">
                  iOS Design
                </span>
                <span className="px-3 py-1 bg-sky-400/10 text-sky-400 rounded-full text-sm">
                  Dark Theme
                </span>
                <span className="px-3 py-1 bg-sky-400/10 text-sky-400 rounded-full text-sm">
                  6 Screens
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mockup Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[
            {
              title: '🏠 Home Dashboard',
              description: 'Welcome card with quick actions and upcoming tasks',
              features: ['Quick Actions Grid', 'Upcoming Tasks', 'Priority Badges']
            },
            {
              title: '🏘️ Properties List',
              description: 'Scrollable property cards with key details',
              features: ['Property Cards', 'Stats Display', 'Add Property Button']
            },
            {
              title: '📍 Property Details',
              description: 'Individual property overview with complete information',
              features: ['Property Image', 'Rent Stats', 'Quick Info Cards']
            },
            {
              title: '🔧 Maintenance Tasks',
              description: 'Organized by urgency levels',
              features: ['Urgency Sorting', 'Status Badges', 'Task Details']
            },
            {
              title: '💰 Finances Overview',
              description: 'Income/expense tracking with transactions',
              features: ['Income Summary', 'Transaction List', 'Monthly Stats']
            },
            {
              title: '👥 Tenants Management',
              description: 'Active tenants with lease status alerts',
              features: ['Tenant Cards', 'Lease Alerts', 'Quick Actions']
            }
          ].map((screen, index) => (
            <div
              key={index}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-sky-400/50 transition-all hover:shadow-lg hover:shadow-sky-400/10"
            >
              <h3 className="text-xl font-semibold text-white mb-3">
                {screen.title}
              </h3>
              <p className="text-gray-400 mb-4 text-sm">
                {screen.description}
              </p>
              <div className="space-y-2">
                <p className="text-sky-400 text-xs font-semibold uppercase tracking-wide">
                  Key Features:
                </p>
                <ul className="space-y-1">
                  {screen.features.map((feature, i) => (
                    <li key={i} className="text-gray-400 text-sm flex items-center gap-2">
                      <span className="text-sky-400">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Mockups Button */}
        <div className="text-center">
          <a
            href="/mobile-mockups/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-sky-400/50 transition-all transform hover:scale-105"
          >
            <span>🚀</span>
            View Full Interactive Mockups
            <span>→</span>
          </a>
          <p className="text-gray-500 text-sm mt-4">
            Opens in a new tab with interactive scrollable mockups
          </p>
        </div>

        {/* Design Specs */}
        <div className="mt-12 bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            🎨 Design Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sky-400 font-semibold mb-3">Color Palette</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-400"></div>
                  <div>
                    <p className="text-white text-sm font-mono">#38bdf8</p>
                    <p className="text-gray-400 text-xs">Primary (Sky Blue)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500"></div>
                  <div>
                    <p className="text-white text-sm font-mono">#3b82f6</p>
                    <p className="text-gray-400 text-xs">Secondary (Blue)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-900"></div>
                  <div>
                    <p className="text-white text-sm font-mono">#0f172a</p>
                    <p className="text-gray-400 text-xs">Background Dark</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sky-400 font-semibold mb-3">Features</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-sky-400">✓</span>
                  iOS-style interface design
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-sky-400">✓</span>
                  Dark mode optimized
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-sky-400">✓</span>
                  Responsive phone frames
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-sky-400">✓</span>
                  Bottom tab navigation
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-sky-400">✓</span>
                  Floating action buttons
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-sky-400">✓</span>
                  Status bar with notch
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-gradient-to-r from-sky-400/10 to-blue-500/10 border border-sky-400/30 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            📋 Next Steps
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-gray-300">
              <span className="text-sky-400 mt-1">1.</span>
              <span>Review and approve the mockup designs</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <span className="text-sky-400 mt-1">2.</span>
              <span>Gather feedback on UI/UX flow and interactions</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <span className="text-sky-400 mt-1">3.</span>
              <span>Begin React Native development using these designs as reference</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <span className="text-sky-400 mt-1">4.</span>
              <span>Integrate with existing PropertyPal backend APIs</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobileMockups;
