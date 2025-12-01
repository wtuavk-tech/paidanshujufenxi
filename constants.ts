import { DispatcherStats } from './types';

export const PROJECT_CATEGORIES = ['全部', '家庭维修', '家电安装', '日常保养', '紧急管道维修', '暖通空调'];

const NAMES = [
  '张伟', '李强', '王芳', '赵敏', '刘洋', 
  '陈杰', '杨光', '黄婷', '吴刚', '孙丽'
];

// Helper to generate random data
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateMockData = (): DispatcherStats[] => {
  const data: DispatcherStats[] = [];
  
  // Generate data for the last 7 days to enable meaningful time filtering
  const now = new Date();
  
  NAMES.forEach((name, index) => {
    // Each person has a "base" performance to keep consistency
    const baseSuccess = getRandomInt(60, 90);
    const baseDispatch = getRandomInt(70, 95);
    
    // Create multiple records for different categories
    PROJECT_CATEGORIES.slice(1).forEach(cat => {
        // Random date within last 7 days
        const itemDate = new Date(now);
        itemDate.setDate(now.getDate() - getRandomInt(0, 7));
        // Random time between 08:00 and 20:00 (working hours)
        itemDate.setHours(getRandomInt(8, 20));
        itemDate.setMinutes(getRandomInt(0, 59));

        data.push({
            id: `${index}-${cat}-${itemDate.getTime()}`,
            name: name,
            successRate: Math.min(100, Math.max(0, baseSuccess + getRandomInt(-10, 10))),
            dispatchRate: Math.min(100, Math.max(0, baseDispatch + getRandomInt(-10, 10))),
            avgRevenue: getRandomInt(150, 500),
            dispatch30MinRate: getRandomInt(50, 95),
            totalOrders: getRandomInt(20, 150),
            projectCategory: cat,
            date: itemDate.toISOString() // Stores full datetime
        });
    });
  });

  return data;
};

export const INITIAL_DATA = generateMockData();