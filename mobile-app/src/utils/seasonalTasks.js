// Seasonal Maintenance Tasks Generator
// Generates recommended maintenance tasks based on current season

const SEASONAL_TASKS = {
  spring: [
    {
      title: 'HVAC System Check',
      description: 'Clean or replace air filters, check AC system before summer',
      priority: 'high',
      category: 'HVAC',
    },
    {
      title: 'Inspect Roof and Gutters',
      description: 'Check for winter damage, clean gutters and downspouts',
      priority: 'high',
      category: 'Exterior',
    },
    {
      title: 'Test Smoke and CO Detectors',
      description: 'Replace batteries and test all detectors',
      priority: 'high',
      category: 'Safety',
    },
    {
      title: 'Lawn Care Start',
      description: 'Fertilize lawn, trim trees and bushes, inspect irrigation system',
      priority: 'medium',
      category: 'Landscaping',
    },
    {
      title: 'Check Exterior Paint',
      description: 'Inspect and touch up exterior paint and siding',
      priority: 'medium',
      category: 'Exterior',
    },
  ],
  summer: [
    {
      title: 'AC Maintenance',
      description: 'Clean condenser coils, check refrigerant levels',
      priority: 'high',
      category: 'HVAC',
    },
    {
      title: 'Check Plumbing',
      description: 'Inspect outdoor faucets, sprinkler systems, and hoses',
      priority: 'medium',
      category: 'Plumbing',
    },
    {
      title: 'Window and Door Seals',
      description: 'Inspect weather stripping and caulking around windows and doors',
      priority: 'medium',
      category: 'Exterior',
    },
    {
      title: 'Deck/Patio Maintenance',
      description: 'Clean, seal, or stain deck/patio surfaces',
      priority: 'medium',
      category: 'Exterior',
    },
    {
      title: 'Pest Control',
      description: 'Schedule professional pest inspection and treatment',
      priority: 'medium',
      category: 'Pest Control',
    },
  ],
  fall: [
    {
      title: 'Heating System Check',
      description: 'Service furnace, replace filters before winter',
      priority: 'high',
      category: 'HVAC',
    },
    {
      title: 'Clean Gutters and Downspouts',
      description: 'Remove leaves and debris, ensure proper drainage',
      priority: 'high',
      category: 'Exterior',
    },
    {
      title: 'Chimney Inspection',
      description: 'Clean and inspect chimney and fireplace',
      priority: 'high',
      category: 'Safety',
    },
    {
      title: 'Winterize Outdoor Systems',
      description: 'Drain and store hoses, shut off exterior water valves',
      priority: 'high',
      category: 'Plumbing',
    },
    {
      title: 'Check Insulation',
      description: 'Inspect attic and basement insulation',
      priority: 'medium',
      category: 'Energy',
    },
  ],
  winter: [
    {
      title: 'Check for Ice Dams',
      description: 'Inspect roof for ice buildup, ensure proper attic ventilation',
      priority: 'high',
      category: 'Exterior',
    },
    {
      title: 'Test Heating System',
      description: 'Monitor furnace performance, replace filters',
      priority: 'high',
      category: 'HVAC',
    },
    {
      title: 'Prevent Frozen Pipes',
      description: 'Insulate exposed pipes, check for drafts near plumbing',
      priority: 'high',
      category: 'Plumbing',
    },
    {
      title: 'Ceiling and Wall Inspection',
      description: 'Check for water stains indicating ice dam or roof leaks',
      priority: 'medium',
      category: 'Interior',
    },
    {
      title: 'Humidifier Maintenance',
      description: 'Clean and maintain whole-house humidifier',
      priority: 'low',
      category: 'HVAC',
    },
  ],
};

/**
 * Gets the current season based on the month
 * @returns {string} 'spring' | 'summer' | 'fall' | 'winter'
 */
export const getCurrentSeason = () => {
  const month = new Date().getMonth(); // 0-11

  if (month >= 2 && month <= 4) return 'spring'; // March, April, May
  if (month >= 5 && month <= 7) return 'summer'; // June, July, August
  if (month >= 8 && month <= 10) return 'fall'; // September, October, November
  return 'winter'; // December, January, February
};

/**
 * Gets seasonal tasks for the current season
 * @returns {Array} Array of seasonal maintenance tasks
 */
export const getSeasonalTasks = () => {
  const season = getCurrentSeason();
  return SEASONAL_TASKS[season] || [];
};

/**
 * Gets seasonal tasks for a specific season
 * @param {string} season - 'spring' | 'summer' | 'fall' | 'winter'
 * @returns {Array} Array of seasonal maintenance tasks
 */
export const getSeasonalTasksForSeason = (season) => {
  return SEASONAL_TASKS[season] || [];
};

/**
 * Gets all seasonal tasks for all seasons
 * @returns {Object} Object with all seasonal tasks organized by season
 */
export const getAllSeasonalTasks = () => {
  return SEASONAL_TASKS;
};

/**
 * Formats a seasonal task for API submission
 * @param {Object} task - Seasonal task object
 * @param {number} propertyId - Property ID to assign the task to
 * @param {Date} dueDate - Optional due date for the task
 * @returns {Object} Formatted task for API
 */
export const formatSeasonalTask = (task, propertyId, dueDate = null) => {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    property_id: propertyId,
    due_date: dueDate || null,
    status: 'pending',
    category: task.category,
  };
};

/**
 * Gets a friendly season name
 * @param {string} season - 'spring' | 'summer' | 'fall' | 'winter'
 * @returns {string} Capitalized season name with emoji
 */
export const getSeasonName = (season) => {
  const seasonNames = {
    spring: '🌸 Spring',
    summer: '☀️ Summer',
    fall: '🍂 Fall',
    winter: '❄️ Winter',
  };
  return seasonNames[season] || season;
};
