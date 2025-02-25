import * as fs from 'fs';
import * as path from 'path';

// Kullanıcı verilerinin saklanacağı dosya
const USER_DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

// Kullanıcı tipi tanımı
export interface User {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  miningPower: number;
  balance: number;
  lastMiningTime?: number;
  totalEarned: number;
  referralCode: string;
  referredBy?: string;
  referrals: number[];
  createdAt: number;
  updatedAt: number;
}

// Veri klasörünü kontrol et ve oluştur
function ensureDataDirectoryExists() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(USER_DATA_FILE)) {
    fs.writeFileSync(USER_DATA_FILE, JSON.stringify({ users: {} }, null, 2));
  }
}

// Tüm kullanıcı verilerini getir
export function getAllUsers(): Record<string, User> {
  ensureDataDirectoryExists();
  
  try {
    const data = fs.readFileSync(USER_DATA_FILE, 'utf8');
    const parsedData = JSON.parse(data);
    return parsedData.users || {};
  } catch (error) {
    console.error('Kullanıcı verileri okunamadı:', error);
    return {};
  }
}

// Kullanıcıyı telegram ID'sine göre bul veya oluştur
export function getUserByTelegramId(telegramId: number): User | null {
  const users = getAllUsers();
  const userKey = telegramId.toString();
  
  if (users[userKey]) {
    return users[userKey];
  }
  
  return null;
}

// Yeni kullanıcı oluştur
export function createUser(userData: Partial<User> & { telegramId: number }): User {
  const users = getAllUsers();
  const userKey = userData.telegramId.toString();
  
  // Kullanıcı daha önceden var mı?
  if (users[userKey]) {
    return users[userKey];
  }
  
  // Referral kodu oluştur
  const referralCode = `REF${userData.telegramId}${Math.floor(Math.random() * 1000)}`;
  
  // Yeni kullanıcı oluştur
  const newUser: User = {
    telegramId: userData.telegramId,
    username: userData.username || '',
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    miningPower: 1, // Başlangıç mining gücü
    balance: 0,
    totalEarned: 0,
    referralCode,
    referrals: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  // Kullanıcıyı kaydet
  users[userKey] = newUser;
  saveUsers(users);
  
  return newUser;
}

// Kullanıcı güncelle
export function updateUser(user: User): User {
  const users = getAllUsers();
  const userKey = user.telegramId.toString();
  
  // Güncelleme zamanını ayarla
  user.updatedAt = Date.now();
  
  // Kullanıcıyı güncelle
  users[userKey] = user;
  saveUsers(users);
  
  return user;
}

// Kullanıcıya mining ödülü ekle
export function addMiningReward(telegramId: number, amount: number): User | null {
  const user = getUserByTelegramId(telegramId);
  if (!user) return null;
  
  // Son mining zamanını kontrol et
  const now = Date.now();
  const lastMiningTime = user.lastMiningTime || 0;
  const timeDiff = now - lastMiningTime;
  
  // Her 5 dakikada bir mining yapılabilir
  const MIN_MINING_INTERVAL = 5 * 60 * 1000; // 5 dakika
  
  if (timeDiff < MIN_MINING_INTERVAL) {
    console.log(`Kullanıcı ${telegramId} çok sık mining yapmaya çalışıyor`);
    return user;
  }
  
  // Mining power'a göre ödül hesapla
  const reward = (amount || 0.01) * user.miningPower;
  
  // Kullanıcı verisini güncelle
  user.balance += reward;
  user.totalEarned += reward;
  user.lastMiningTime = now;
  
  // Referral ödülü
  if (user.referredBy) {
    const referrer = getUserByTelegramId(parseInt(user.referredBy));
    if (referrer) {
      const referralBonus = reward * 0.05; // %5 referral bonus
      referrer.balance += referralBonus;
      referrer.totalEarned += referralBonus;
      updateUser(referrer);
    }
  }
  
  return updateUser(user);
}

// Referral ile kullanıcı kaydı
export function registerUserWithReferral(telegramId: number, userData: Partial<User>, referralCode: string): User {
  let user = getUserByTelegramId(telegramId);
  
  // Kullanıcı yoksa oluştur
  if (!user) {
    user = createUser({
      telegramId,
      ...userData
    });
  }
  
  // Kullanıcı zaten referral ile kaydedilmiş mi?
  if (user.referredBy) {
    return user;
  }
  
  // Referral kodu geçerli mi?
  const users = getAllUsers();
  let referrerId = null;
  
  for (const key in users) {
    if (users[key].referralCode === referralCode) {
      referrerId = users[key].telegramId;
      break;
    }
  }
  
  // Referrer bulunamadı veya kullanıcı kendisini referral gösterdi
  if (!referrerId || referrerId === telegramId) {
    return user;
  }
  
  // Referrer kullanıcısını güncelle
  const referrer = getUserByTelegramId(referrerId);
  if (referrer) {
    if (!referrer.referrals.includes(telegramId)) {
      referrer.referrals.push(telegramId);
      referrer.miningPower += 0.1; // Her referral için mining gücü artışı
      updateUser(referrer);
    }
  }
  
  // Kullanıcıyı güncelle
  user.referredBy = referrerId.toString();
  user.miningPower += 0.2; // Referral ile kaydolduğu için bonus mining gücü
  
  return updateUser(user);
}

// Tüm kullanıcıları kaydet
function saveUsers(users: Record<string, User>) {
  ensureDataDirectoryExists();
  
  try {
    fs.writeFileSync(USER_DATA_FILE, JSON.stringify({ users }, null, 2));
  } catch (error) {
    console.error('Kullanıcı verileri kaydedilemedi:', error);
  }
} 