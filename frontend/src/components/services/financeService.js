// src/services/financeService.js
import { apiHelpers } from './api';

/**
 * Service for handling expense-related API calls
 */
const expenseService = {
  /**
   * Get all expenses for the current user
   * @param {number} propertyId - Property ID to filter expenses
   * @param {string} startDate - Start date for filtering expenses
   * @param {string} endDate - End date for filtering expenses
   * @param {string} category - Category for filtering expenses
   * @returns {Promise<Array>} Expenses array
   */
  getExpenses: async (propertyId, startDate, endDate, category) => {
    try {
      // Build query parameters
      let url = 'finances/expenses';
      const params = {};
      
      if (propertyId) params.property_id = propertyId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (category) params.category = category;
      
      return await apiHelpers.get(url, params);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },
  
  /**
   * Create a new expense
   * @param {Object} expenseData - Expense data
   * @returns {Promise<Object>} Created expense
   */
  createExpense: async (expenseData) => {
    try {
      return await apiHelpers.post('finances/expenses', expenseData);
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing expense
   * @param {number} id - Expense ID
   * @param {Object} expenseData - Updated expense data
   * @returns {Promise<Object>} Updated expense
   */
  updateExpense: async (id, expenseData) => {
    try {
      return await apiHelpers.put(`finances/expenses/${id}`, expenseData);
    } catch (error) {
      console.error(`Error updating expense ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete an expense
   * @param {number} id - Expense ID
   * @returns {Promise<Object>} Response object
   */
  deleteExpense: async (id) => {
    try {
      return await apiHelpers.delete(`finances/expenses/${id}`);
    } catch (error) {
      console.error(`Error deleting expense ${id}:`, error);
      throw error;
    }
  }
};

/**
 * Service for handling budget-related API calls
 */
const budgetService = {
  /**
   * Get all budgets for the current user
   * @param {number} propertyId - Property ID to filter budgets
   * @param {number} year - Year for filtering budgets
   * @param {number} month - Month for filtering budgets
   * @returns {Promise<Array>} Budgets array
   */
  getBudgets: async (propertyId, year, month) => {
    try {
      // Build query parameters
      let url = 'finances/budgets';
      const params = {};
      
      if (propertyId) params.property_id = propertyId;
      if (year) params.year = year;
      if (month) params.month = month;
      
      return await apiHelpers.get(url, params);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  },
  
  /**
   * Create a new budget
   * @param {Object} budgetData - Budget data
   * @returns {Promise<Object>} Created budget
   */
  createBudget: async (budgetData) => {
    try {
      return await apiHelpers.post('finances/budgets', budgetData);
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing budget
   * @param {number} id - Budget ID
   * @param {Object} budgetData - Updated budget data
   * @returns {Promise<Object>} Updated budget
   */
  updateBudget: async (id, budgetData) => {
    try {
      return await apiHelpers.put(`finances/budgets/${id}`, budgetData);
    } catch (error) {
      console.error(`Error updating budget ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a budget
   * @param {number} id - Budget ID
   * @returns {Promise<Object>} Response object
   */
  deleteBudget: async (id) => {
    try {
      return await apiHelpers.delete(`finances/budgets/${id}`);
    } catch (error) {
      console.error(`Error deleting budget ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get monthly summary report
   * @param {number} propertyId - Property ID
   * @param {number} year - Year
   * @param {number} month - Month
   * @returns {Promise<Object>} Monthly summary report
   */
  getMonthlySummary: async (propertyId, year, month) => {
    try {
      const params = {
        property_id: propertyId,
        year: year,
        month: month
      };
      
      return await apiHelpers.get('finances/reports/monthly-summary', params);
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      throw error;
    }
  },
  
  /**
   * Get yearly summary report
   * @param {number} propertyId - Property ID
   * @param {number} year - Year
   * @returns {Promise<Object>} Yearly summary report
   */
  getYearlySummary: async (propertyId, year) => {
    try {
      const params = {
        property_id: propertyId,
        year: year
      };
      
      return await apiHelpers.get('finances/reports/yearly-summary', params);
    } catch (error) {
      console.error('Error fetching yearly summary:', error);
      throw error;
    }
  }
};

export { expenseService, budgetService };