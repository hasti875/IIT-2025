import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Users, CreditCard, Bell, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import { useCurrency } from '../context/CurrencyContext';

const Settings = () => {
  const { currency, currencies, updateCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('general');
  const [companyInfo, setCompanyInfo] = useState({
    companyName: 'OneFlow Inc.',
    companyEmail: 'info@oneflow.com',
    phone: '+1 234 567 8900',
    currency: currency
  });
  
  const [preferences, setPreferences] = useState({
    automaticBackups: true,
    emailNotifications: true,
    defaultHourlyRate: '150'
  });

  const [billingSettings, setBillingSettings] = useState({
    defaultTaxRate: '10',
    defaultPaymentTerms: '30',
    invoiceNumberPrefix: 'INV-'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    projectUpdates: true,
    taskAssignments: true,
    invoiceReminders: true,
    expenseApprovals: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: true,
    newPassword: '',
    confirmPassword: ''
  });

  const handleCompanyInfoChange = (field, value) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleBillingChange = (field, value) => {
    setBillingSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field, value) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdatePassword = () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Updating password...');
    // Password update logic here
  };

  const handleSaveChanges = () => {
    // Update currency in context
    updateCurrency(companyInfo.currency);
    
    // Save other company info to localStorage or backend
    localStorage.setItem('companyInfo', JSON.stringify({
      companyName: companyInfo.companyName,
      companyEmail: companyInfo.companyEmail,
      phone: companyInfo.phone
    }));
    
    alert('Settings saved successfully!');
    console.log('Saving changes...', companyInfo, preferences);
  };

  // Load saved company info on mount
  useEffect(() => {
    const saved = localStorage.getItem('companyInfo');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCompanyInfo(prev => ({ ...prev, ...parsed, currency }));
    } else {
      setCompanyInfo(prev => ({ ...prev, currency }));
    }
  }, [currency]);

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your system configuration and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex gap-0">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'general' && (
              <div className="space-y-8">
                {/* Company Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Company Information</h2>
                  <p className="text-sm text-gray-500 mb-6">Update your company details and branding</p>

                  <div className="space-y-6 max-w-2xl">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyInfo.companyName}
                        onChange={(e) => handleCompanyInfoChange('companyName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Email
                      </label>
                      <input
                        type="email"
                        value={companyInfo.companyEmail}
                        onChange={(e) => handleCompanyInfoChange('companyEmail', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={companyInfo.phone}
                          onChange={(e) => handleCompanyInfoChange('phone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          value={companyInfo.currency}
                          onChange={(e) => handleCompanyInfoChange('currency', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.values(currencies).map((curr) => (
                            <option key={curr.code} value={curr.code}>
                              {curr.code} ({curr.symbol}) - {curr.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          This will update currency display across the entire application
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveChanges}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* System Preferences */}
                <div className="pt-8 border-t border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">System Preferences</h2>
                  <p className="text-sm text-gray-500 mb-6">Configure system-wide settings</p>

                  <div className="space-y-6 max-w-2xl">
                    {/* Automatic Backups */}
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium text-gray-900">Automatic Backups</p>
                        <p className="text-sm text-gray-500">Enable daily automatic backups</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.automaticBackups}
                          onChange={(e) => handlePreferenceChange('automaticBackups', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive email updates for important events</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Default Hourly Rate */}
                    <div className="py-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Hourly Rate
                      </label>
                      <input
                        type="number"
                        value={preferences.defaultHourlyRate}
                        onChange={(e) => handlePreferenceChange('defaultHourlyRate', e.target.value)}
                        className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-8">
                {/* User Management */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">User Management</h2>
                  <p className="text-sm text-gray-500 mb-6">Manage user accounts and permissions</p>

                  <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors mb-4">
                    Add New User
                  </button>

                  <p className="text-sm text-gray-500">User management features coming soon...</p>
                </div>

                {/* Role Configuration */}
                <div className="pt-8 border-t border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Role Configuration</h2>
                  <p className="text-sm text-gray-500 mb-6">Define roles and access permissions</p>

                  <div className="space-y-4">
                    {/* Admin Role */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-1">Admin</h3>
                      <p className="text-sm text-gray-500">Full system access</p>
                    </div>

                    {/* Project Manager Role */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-1">Project Manager</h3>
                      <p className="text-sm text-gray-500">Manage projects, tasks, and team</p>
                    </div>

                    {/* Team Member Role */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-1">Team Member</h3>
                      <p className="text-sm text-gray-500">View tasks and log time</p>
                    </div>

                    {/* Sales/Finance Role */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-1">Sales/Finance</h3>
                      <p className="text-sm text-gray-500">Manage financial documents</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Billing Configuration</h2>
                <p className="text-sm text-gray-500 mb-6">Configure invoicing and payment settings</p>

                <div className="space-y-6 max-w-2xl">
                  {/* Default Tax Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={billingSettings.defaultTaxRate}
                      onChange={(e) => handleBillingChange('defaultTaxRate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10"
                    />
                  </div>

                  {/* Default Payment Terms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Payment Terms (days)
                    </label>
                    <input
                      type="number"
                      value={billingSettings.defaultPaymentTerms}
                      onChange={(e) => handleBillingChange('defaultPaymentTerms', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>

                  {/* Invoice Number Prefix */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Number Prefix
                    </label>
                    <input
                      type="text"
                      value={billingSettings.invoiceNumberPrefix}
                      onChange={(e) => handleBillingChange('invoiceNumberPrefix', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="INV-"
                    />
                  </div>

                  <button
                    onClick={handleSaveChanges}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save Billing Settings
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h2>
                <p className="text-sm text-gray-500 mb-6">Choose what notifications you want to receive</p>

                <div className="space-y-0 max-w-3xl">
                  {/* Project Updates */}
                  <div className="flex items-center justify-between py-6 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Project Updates</p>
                      <p className="text-sm text-gray-500">Get notified about project status changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.projectUpdates}
                        onChange={(e) => handleNotificationChange('projectUpdates', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Task Assignments */}
                  <div className="flex items-center justify-between py-6 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Task Assignments</p>
                      <p className="text-sm text-gray-500">Receive alerts when tasks are assigned to you</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.taskAssignments}
                        onChange={(e) => handleNotificationChange('taskAssignments', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Invoice Reminders */}
                  <div className="flex items-center justify-between py-6 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Invoice Reminders</p>
                      <p className="text-sm text-gray-500">Get reminders for unpaid invoices</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.invoiceReminders}
                        onChange={(e) => handleNotificationChange('invoiceReminders', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Expense Approvals */}
                  <div className="flex items-center justify-between py-6">
                    <div>
                      <p className="font-medium text-gray-900">Expense Approvals</p>
                      <p className="text-sm text-gray-500">Notifications for expense approval requests</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.expenseApprovals}
                        onChange={(e) => handleNotificationChange('expenseApprovals', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Security Settings</h2>
                <p className="text-sm text-gray-500 mb-6">Manage security and authentication options</p>

                <div className="space-y-6 max-w-3xl">
                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorAuth}
                        onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Session Timeout */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Session Timeout</p>
                      <p className="text-sm text-gray-500">Auto-logout after 30 minutes of inactivity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.sessionTimeout}
                        onChange={(e) => handleSecurityChange('sessionTimeout', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Change Password */}
                  <div className="pt-4">
                    <p className="font-medium text-gray-900 mb-4">Change Password</p>
                    <div className="space-y-4">
                      <div>
                        <input
                          type="password"
                          value={securitySettings.newPassword}
                          onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                          placeholder="New password"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          value={securitySettings.confirmPassword}
                          onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={handleUpdatePassword}
                        className="w-full bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
