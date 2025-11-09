import { useState, useEffect } from 'react';
import { Search, Plus, FileText, CheckCircle, XCircle, Download, Image } from 'lucide-react';
import { financeService, projectService, authService } from '../services';
import { Link } from 'react-router-dom';
import RoleBasedLayout from '../components/RoleBasedLayout';
import { useCurrency } from '../context/CurrencyContext';

const Expenses = () => {
  const { formatAmount } = useCurrency();
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'Admin';
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    projectId: '',
    billable: false
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => {
    fetchExpenses();
    fetchActiveProjects();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await financeService.getExpenses();
      // Backend returns { success: true, count: number, data: array }
      setExpenses(response.data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveProjects = async () => {
    try {
      const response = await projectService.getAll();
      let availableProjects = (response.data || []).filter(p => 
        p.status === 'Active' || p.status === 'Completed'
      );

      // For team members, only show projects where they are a team member
      if (currentUser?.role === 'TeamMember') {
        availableProjects = availableProjects.filter(project => 
          project.teamMembers?.some(member => member.id === currentUser.id)
        );
      }

      setProjects(availableProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  // Calculate summary metrics
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const billableExpenses = expenses
    .filter(exp => exp.billable)
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const pendingApproval = expenses
    .filter(exp => exp.status?.toLowerCase() === 'pending')
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.expenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All Categories' || expense.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || expense.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSubmitExpense = async () => {
    try {
      if (!newExpense.category || !newExpense.amount || !newExpense.projectId) {
        alert('Please fill in all required fields');
        return;
      }

      // If category is Other and no custom category entered, alert
      if (newExpense.category === 'Other' && !customCategory.trim()) {
        alert('Please enter a custom category');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      // Use custom category if "Other" is selected, otherwise use selected category
      const finalCategory = newExpense.category === 'Other' ? customCategory : newExpense.category;
      formData.append('category', finalCategory);
      formData.append('amount', parseFloat(newExpense.amount));
      formData.append('expenseDate', newExpense.expenseDate);
      formData.append('description', newExpense.description);
      formData.append('projectId', newExpense.projectId);
      formData.append('billable', newExpense.billable);
      
      // Append file if selected
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      await financeService.createExpense(formData);

      setShowSubmitModal(false);
      setNewExpense({
        category: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        description: '',
        projectId: '',
        billable: false
      });
      setReceiptFile(null);
      setCustomCategory('');
      fetchExpenses();
      alert('Expense submitted successfully! Waiting for admin approval.');
    } catch (error) {
      console.error('Failed to submit expense:', error);
      alert('Failed to submit expense. Please try again.');
    }
  };

  const handleApproveExpense = async (expenseId) => {
    try {
      await financeService.approveExpense(expenseId, 'Approved');
      fetchExpenses();
      alert('Expense approved successfully');
    } catch (error) {
      console.error('Failed to approve expense:', error);
      alert('Failed to approve expense');
    }
  };

  const handleRejectExpense = async (expenseId) => {
    try {
      await financeService.approveExpense(expenseId, 'Rejected');
      fetchExpenses();
      alert('Expense rejected');
    } catch (error) {
      console.error('Failed to reject expense:', error);
      alert('Failed to reject expense');
    }
  };

  const handleDownloadReceipt = async (expenseId, expenseNumber) => {
    try {
      const blob = await financeService.downloadExpenseReceipt(expenseId);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expense-receipt-${expenseNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const handleViewReceipt = (receiptPath) => {
    if (receiptPath) {
      // Construct full URL for the receipt
      const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      setSelectedReceipt(`${baseURL}${receiptPath}`);
      setShowReceiptModal(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reimbursed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBillableBadge = (billable) => {
    if (billable) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">Yes</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500 text-white">No</span>;
  };

  if (loading) {
    return (
      <RoleBasedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading expenses...</div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 mt-1">Track and manage project expenses</p>
        </div>
        <button 
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Submit Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-2">Total Expenses</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatAmount(totalExpenses)}
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-2">Billable</p>
          <p className="text-3xl font-bold text-green-600">
            {formatAmount(billableExpenses)}
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-2">Pending Approval</p>
          <p className="text-3xl font-bold text-orange-600">
            {formatAmount(pendingApproval)}
          </p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">All Expenses</h2>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All Categories</option>
                <option>Travel</option>
                <option>Software</option>
                <option>Meals</option>
                <option>Equipment</option>
                <option>Salary</option>
                <option>Marketing</option>
                <option>Other</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Reimbursed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{expense.expenseNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : new Date(expense.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.project?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.creator?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatAmount(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.receipt ? (
                        <button
                          onClick={() => handleViewReceipt(expense.receipt)}
                          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                          title="View Receipt"
                        >
                          <Image size={18} />
                          <span className="text-xs">View</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">No receipt</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {isAdmin && expense.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveExpense(expense.id)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleRejectExpense(expense.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={20} />
                            </button>
                          </>
                        ) : null}
                        <button
                          onClick={() => handleDownloadReceipt(expense.id, expense.expenseNumber)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Download Receipt"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Submit Expense Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Submit Expense</h2>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6">
              <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => {
                    setNewExpense({...newExpense, category: e.target.value});
                    if (e.target.value !== 'Other') {
                      setCustomCategory('');
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="Travel">Travel</option>
                  <option value="Meals">Meals</option>
                  <option value="Software">Software</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Salary">Salary</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Custom Category Input - shown when "Other" is selected */}
              {newExpense.category === 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Category *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter custom category name"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={newExpense.expenseDate}
                  onChange={(e) => setNewExpense({...newExpense, expenseDate: e.target.value})}
                  max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project *
                </label>
                <select
                  value={newExpense.projectId}
                  onChange={(e) => setNewExpense({...newExpense, projectId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Active and completed projects are shown</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter expense description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="billable"
                  checked={newExpense.billable}
                  onChange={(e) => setNewExpense({...newExpense, billable: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <div className="ml-2">
                  <label htmlFor="billable" className="text-sm font-medium text-gray-700">
                    Billable to client
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Check this if the expense should be charged to the client
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt / Bill Photo
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {receiptFile && (
                  <p className="text-xs text-gray-600 mt-2">
                    Selected: {receiptFile.name} ({(receiptFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Upload a photo or PDF of your receipt/bill (max 5MB)
                </p>
              </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitExpense}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
                disabled={!newExpense.category || !newExpense.amount || !newExpense.projectId}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Viewing Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Receipt / Bill</h2>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedReceipt(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-4">
              {selectedReceipt && (
                selectedReceipt.endsWith('.pdf') ? (
                  <iframe
                    src={selectedReceipt}
                    className="w-full h-[70vh] border rounded"
                    title="Receipt PDF"
                  />
                ) : (
                  <img
                    src={selectedReceipt}
                    alt="Receipt"
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                )
              )}
            </div>
          </div>
        </div>
      )}
    </RoleBasedLayout>
  );
};

export default Expenses;
