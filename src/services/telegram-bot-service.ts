import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config();

// Bot token'ı .env dosyasından al
const token = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.APP_URL;

// Bot token kontrol edilir
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN bulunamadı. Lütfen .env dosyasını kontrol edin.');
  process.exit(1);
}

if (!appUrl) {
  console.error('APP_URL bulunamadı. Lütfen .env dosyasını kontrol edin.');
  process.exit(1);
}

// Telegram bot oluştur
const bot = new TelegramBot(token, { polling: true });

// Bot başlatma mesajı
console.log('Telegram bot başlatıldı!');
bot.getMe().then((me) => {
  console.log(`Bot kullanıcı adı: @${me.username}`);
});

// Start komutu
bot.onText(/\/start(?:\s+(.+))?/, async (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
  const chatId = msg.chat.id;
  const referralCode = match && match[1] ? match[1] : null;
  
  // Kullanıcı bilgilerini al
  const userId = msg.from?.id;
  const firstName = msg.from?.first_name || 'Kullanıcı';
  
  // Referral kodu varsa kaydet
  if (referralCode) {
    console.log(`Kullanıcı ${userId} referral kodu ile kaydoldu: ${referralCode}`);
    // Burada referral kodu veritabanına kaydedilebilir
  }
  
  // Mini App butonu ile karşılama mesajı gönder
  await bot.sendMessage(chatId, `Merhaba ${firstName}! TON Mining uygulamasına hoş geldiniz.`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 TON Mining App\'i Başlat', web_app: { url: appUrl } }]
      ]
    }
  });
});

// Yardım komutu
bot.onText(/\/help/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(chatId, 
    `*TON Mining App Yardım*\n\n` +
    `• */start* - Uygulamayı başlat\n` +
    `• */balance* - TON bakiyenizi görüntüleyin\n` +
    `• */stats* - Madencilik istatistiklerinizi görüntüleyin\n` +
    `• */referral* - Referans linkinizi alın\n` +
    `• */help* - Bu yardım mesajını görüntüleyin\n\n` +
    `Daha fazla bilgi için lütfen uygulamayı açın.`,
    { parse_mode: 'Markdown' }
  );
});

// Bakiye komutu
bot.onText(/\/balance/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  
  // Burada gerçek bakiye verileri API'den alınabilir
  const mockBalance = (Math.random() * 10).toFixed(2);
  
  await bot.sendMessage(chatId, 
    `💰 *Bakiye Bilgileriniz*\n\n` +
    `Kullanıcı ID: \`${userId}\`\n` +
    `Mevcut TON: *${mockBalance} TON*\n\n` +
    `Bakiyenizi artırmak için uygulamayı açabilirsiniz.`,
    { 
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Uygulamayı Aç', web_app: { url: appUrl } }]
        ]
      }
    }
  );
});

// İstatistik komutu
bot.onText(/\/stats/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  
  // Mock istatistikler
  const mockStats = {
    miningPower: (Math.random() * 100).toFixed(0),
    dailyEarning: (Math.random() * 1).toFixed(3),
    totalEarned: (Math.random() * 50).toFixed(2),
    rank: Math.floor(Math.random() * 1000) + 1
  };
  
  await bot.sendMessage(chatId, 
    `📊 *Madencilik İstatistikleriniz*\n\n` +
    `Madencilik Gücü: *${mockStats.miningPower}*\n` +
    `Günlük Kazanç: *${mockStats.dailyEarning} TON*\n` +
    `Toplam Kazanç: *${mockStats.totalEarned} TON*\n` +
    `Global Sıralama: *#${mockStats.rank}*\n\n` +
    `Daha detaylı istatistikler için uygulamayı açın.`,
    { 
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📱 Uygulamayı Aç', web_app: { url: appUrl } }]
        ]
      }
    }
  );
});

// Referral komutu
bot.onText(/\/referral/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  
  // Referral link oluştur
  const referralLink = `https://t.me/ton_mining_bot?start=ref${userId}`;
  
  await bot.sendMessage(chatId, 
    `🔗 *Referans Linkiniz*\n\n` +
    `Arkadaşlarınızı davet edin ve kazanç sağlayın!\n\n` +
    `Referans linkiniz:\n\`${referralLink}\`\n\n` +
    `Her davet ettiğiniz arkadaşınızın kazancından %5 pay alacaksınız.`,
    { 
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📱 Uygulamayı Aç', web_app: { url: appUrl } }]
        ]
      }
    }
  );
});

// Bot API'yi dışa aktar
export default bot;

// Bot başlatma fonksiyonu
export function startBot() {
  console.log('Telegram bot başlatılıyor...');
  return bot;
}

// Bot durdurma fonksiyonu
export function stopBot() {
  console.log('Telegram bot durduruluyor...');
  bot.stopPolling();
}

// Webhook ile çalışması için (Vercel deployment için)
export async function setupWebhook(url: string) {
  await bot.setWebHook(`${url}/api/telegram-webhook`);
  console.log(`Webhook ayarlandı: ${url}/api/telegram-webhook`);
} 