import { DispatcherStats, UserTarget } from './types';

export const PROJECT_CATEGORIES = ['全部', '家庭维修', '家电安装', '日常保养', '紧急管道维修', '暖通空调'];

export const GROUPS = [
  '一组', '二组', '三组', '四组', '五组', '六组', 
  '七组', '八组', '九组', '十组', '十一组'
];

const SURNAMES = ['赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '褚', '卫', '蒋', '沈', '韩', '杨'];
const NAMES_CHAR = ['伟', '芳', '娜', '敏', '静', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀', '刚', '平'];

// Helper to generate random name
const generateName = () => {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const name = NAMES_CHAR[Math.floor(Math.random() * NAMES_CHAR.length)];
  return surname + name;
};

// Helper to generate random data
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateMockData = (): { data: DispatcherStats[], defaultTargets: UserTarget[] } => {
  const data: DispatcherStats[] = [];
  const uniqueUsers = new Set<string>();
  const userTargets: UserTarget[] = [];
  
  const now = new Date();

  // Create users for each group
  GROUPS.forEach(group => {
      // 3 to 10 people per group
      const peopleCount = getRandomInt(3, 10);
      for (let i = 0; i < peopleCount; i++) {
          let name = generateName();
          // Ensure unique names for simplicity in this mock
          let retries = 0;
          while (uniqueUsers.has(name) && retries < 10) {
              name = generateName();
              retries++;
          }
          uniqueUsers.add(name);

          // Generate default target for this user
          userTargets.push({
              id: name, // Using name as ID for target mapping in this mock
              name: name,
              targetSuccessRate: 80, // Default standards
              targetDispatchRate: 85,
              targetDispatch30Rate: 75
          });

          const baseSuccess = getRandomInt(60, 95);
          const baseDispatch = getRandomInt(70, 98);

          // Create multiple records per user (different categories/times)
          PROJECT_CATEGORIES.slice(1).forEach(cat => {
            const itemDate = new Date(now);
            itemDate.setDate(now.getDate() - getRandomInt(0, 7));
            itemDate.setHours(getRandomInt(8, 20));
            itemDate.setMinutes(getRandomInt(0, 59));

            data.push({
                id: `${name}-${group}-${cat}-${itemDate.getTime()}`,
                name: name,
                group: group,
                successRate: Math.min(100, Math.max(0, baseSuccess + getRandomInt(-10, 10))),
                dispatchRate: Math.min(100, Math.max(0, baseDispatch + getRandomInt(-10, 10))),
                avgRevenue: getRandomInt(150, 600),
                dispatch30MinRate: getRandomInt(40, 98),
                totalOrders: getRandomInt(20, 150),
                projectCategory: cat,
                date: itemDate.toISOString()
            });
          });
      }
  });

  return { data, defaultTargets: userTargets };
};

const mockResult = generateMockData();
export const INITIAL_DATA = mockResult.data;
export const INITIAL_TARGETS = mockResult.defaultTargets;