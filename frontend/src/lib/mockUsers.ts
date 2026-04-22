export type MockUserProfile = {
  id: string;
  name: string;
  role: 'Engineer' | 'Architect' | 'QS' | 'Contractor' | 'Student' | 'Developer' | 'Project Manager';
  avatar: string;
  verified: boolean;
  company?: string;
};

const AFRICAN_FIRST_NAMES = [
  'Kwame', 'Amara', 'Zainab', 'Jamal', 'Nkosi', 'Fatima', 'David', 'Aisha',
  'Kofi', 'Lerato', 'Hassan', 'Jamila', 'Okonkwo', 'Naledi', 'Ahmed', 'Nia',
  'Tendai', 'Kanako', 'Jabari', 'Zuki', 'Thabo', 'Adeline', 'Kamau', 'Amina',
  'Bongani', 'Chipo', 'Desmond', 'Emelie', 'Farah', 'Geofrey', 'Hafiza', 'Ibrahim',
  'Juma', 'Kamara', 'Laban', 'Maggie', 'Nando', 'Ola', 'Precious', 'Rambo',
  'Samuel', 'Tapiwa', 'Uthman', 'Veronica', 'Winston', 'Xavier', 'Yemi', 'Zara',
];

const AFRICAN_LAST_NAMES = [
  'Okafor', 'Mensah', 'Adeyemi', 'Nkomo', 'Mwangi', 'Diallo', 'Sow', 'Kone',
  'Traore', 'Kanu', 'Oyekunle', 'Mthembu', 'Banda', 'Kipchoge', 'Kamau', 'Patel',
  'Singh', 'Chen', 'Magombo', 'Nkosi', 'Chakrabarti', 'Morcos', 'Hassan', 'Ibrahim',
  'Kabongo', 'Lukele', 'Mpofu', 'Ncube', 'Okoro', 'Petersen', 'Rashid', 'Sanda',
  'Tembe', 'Udeh', 'Vuli', 'Witbooi', 'Xaba', 'Yasmin', 'Zimba', 'Adzu',
];

const COMPANIES = [
  'BuildSmart Solutions',
  'Apex Construction',
  'EcoStructures Ltd',
  'Digital Build Co',
  'Future Foundations',
  'GreenBuild Africa',
  'Horizon Construction',
  'Innovation Builders',
  'JK Engineering',
  'KeyStone Projects',
];

const ROLES: Array<'Engineer' | 'Architect' | 'QS' | 'Contractor' | 'Student' | 'Developer' | 'Project Manager'> = [
  'Engineer',
  'Architect',
  'QS',
  'Contractor',
  'Student',
  'Developer',
  'Project Manager',
];

const AVATAR_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-cyan-500',
];

export const generateMockUser = (index: number): MockUserProfile => {
  const firstName = AFRICAN_FIRST_NAMES[index % AFRICAN_FIRST_NAMES.length];
  const lastName = AFRICAN_LAST_NAMES[Math.floor(Math.random() * AFRICAN_LAST_NAMES.length)];
  const role = ROLES[Math.floor(Math.random() * ROLES.length)];
  const verified = Math.random() > 0.6;
  const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];

  const initials = (firstName[0] + lastName[0]).toUpperCase();
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return {
    id: `demo_user_${index}`,
    name: `${firstName} ${lastName}`,
    role,
    avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=${avatarColor.replace('bg-', '').split('-')[0]}&color=fff`,
    verified,
    company,
  };
};

export const generateMockUsers = (count: number): MockUserProfile[] => {
  return Array.from({ length: count }, (_, i) => generateMockUser(i));
};

export const mockUsers = generateMockUsers(150);
