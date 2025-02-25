import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { User, createUser, getUserByTelegramId, addMiningReward, registerUserWithReferral } from './user-service';

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

// Kullanıcıyı kaydet (yoksa oluştur)
function ensureUserExists(msg: TelegramBot.Message): User {
  const telegramId = msg.from?.id;
  
  if (!telegramId) {
    throw new Error('Telegram ID alınamadı');
  }
  
  let user = getUserByTelegramId(telegramId);
  
  if (!user) {
    user = createUser({
      telegramId,
      username: msg.from?.username || '',
      firstName: msg.from?.first_name || '',
      lastName: msg.from?.last_name || ''
    });
    console.log(`Yeni kullanıcı kaydedildi: ${telegramId}`);
  }
  
  return user;
}

// Start komutu
bot.onText(/\/start(?:\s+(.+))?/, async (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
  const chatId = msg.chat.id;
  const referralCode = match && match[1] ? match[1] : null;
  
  // Kullanıcı bilgilerini al
  const telegramId = msg.from?.id;
  const firstName = msg.from?.first_name || 'Kullanıcı';
  
  if (!telegramId) {
    return bot.sendMessage(chatId, 'Kullanıcı bilgileriniz alınamadı. Lütfen daha sonra tekrar deneyin.');
  }
  
  try {
    // Referral kodu varsa kaydet
    if (referralCode) {
      console.log(`Kullanıcı ${telegramId} referral kodu ile kaydoldu: ${referralCode}`);
      // Referral ile kullanıcı kaydı
      const userData = {
        username: msg.from?.username || '',
        firstName: msg.from?.first_name || '',
        lastName: msg.from?.last_name || ''
      };
      
      registerUserWithReferral(telegramId, userData, referralCode);
    } else {
      // Normal kullanıcı kaydı
      ensureUserExists(msg);
    }
    
    // Mini App butonu ile karşılama mesajı gönder
    await bot.sendMessage(chatId, `Merhaba ${firstName}! TON Mining uygulamasına hoş geldiniz.`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 TON Mining App\'i Başlat', web_app: { url: appUrl } }]
        ]
      }
    });
  } catch (error) {
    console.error('Kullanıcı kaydedilirken hata oluştu:', error);
    await bot.sendMessage(chatId, 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
});

// Yardım komutu
bot.onText(/\/help/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  
  try {
    // Kullanıcı kaydı
    ensureUserExists(msg);
    
    await bot.sendMessage(chatId, 
      `*TON Mining App Yardım*\n\n` +
      `• */start* - Uygulamayı başlat\n` +
      `• */mine* - Mining işlemini başlat\n` +
      `• */balance* - TON bakiyenizi görüntüleyin\n` +
      `• */stats* - Madencilik istatistiklerinizi görüntüleyin\n` +
      `• */referral* - Referans linkinizi alın\n` +
      `• */help* - Bu yardım mesajını görüntüleyin\n\n` +
      `Daha fazla bilgi için lütfen uygulamayı açın.`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Yardım mesajı gönderilirken hata oluştu:', error);
    await bot.sendMessage(chatId, 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
});

// Mining komutu
bot.onText(/\/mine/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from?.id;
  
  if (!telegramId) {
    return bot.sendMessage(chatId, 'Kullanıcı bilgileriniz alınamadı. Lütfen daha sonra tekrar deneyin.');
  }
  
  try {
    // Kullanıcı kaydı
    ensureUserExists(msg);
    
    // Mining ödülü ekle
    const user = addMiningReward(telegramId, 0.01);
    
    if (user) {
      // Mining başarılı
      await bot.sendMessage(chatId, 
        `⛏ *Mining Başarılı!*\n\n` +
        `Mining gücünüz: *${user.miningPower.toFixed(2)}*\n` +
        `Kazanılan TON: *${(0.01 * user.miningPower).toFixed(3)} TON*\n` +
        `Toplam bakiye: *${user.balance.toFixed(3)} TON*\n\n` +
        `Mining gücünüzü artırmak için arkadaşlarınızı davet edin veya uygulamayı açın.`,
        { 
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '📱 Uygulamayı Aç', web_app: { url: appUrl } }]
            ]
          }
        }
      );
    } else {
      // Mining başarısız veya çok sık denendi
      await bot.sendMessage(chatId, 
        `⏳ Mining işlemi şu anda yapılamıyor.\n\n` +
        `Mining işlemleri arasında 5 dakika beklemeniz gerekmektedir.\n` +
        `Daha fazla bilgi için uygulamayı açın.`,
        { 
          reply_markup: {
            inline_keyboard: [
              [{ text: '📱 Uygulamayı Aç', web_app: { url: appUrl } }]
            ]
          }
        }
      );
    }
  } catch (error) {
    console.error('Mining işlemi sırasında hata oluştu:', error);
    await bot.sendMessage(chatId, 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
});

// Bakiye komutu
bot.onText(/\/balance/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from?.id;
  
  if (!telegramId) {
    return bot.sendMessage(chatId, 'Kullanıcı bilgileriniz alınamadı. Lütfen daha sonra tekrar deneyin.');
  }
  
  try {
    // Kullanıcı kaydı
    const user = ensureUserExists(msg);
    
    await bot.sendMessage(chatId, 
      `💰 *Bakiye Bilgileriniz*\n\n` +
      `Kullanıcı ID: \`${user.telegramId}\`\n` +
      `Mevcut TON: *${user.balance.toFixed(3)} TON*\n` +
      `Toplam Kazanılan: *${user.totalEarned.toFixed(3)} TON*\n\n` +
      `Bakiyenizi artırmak için mining yapabilir veya uygulamayı açabilirsiniz.`,
      { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '⛏ Mining Yap', callback_data: 'mine' }],
            [{ text: '🚀 Uygulamayı Aç', web_app: { url: appUrl } }]
          ]
        }
      }
    );
  } catch (error) {
    console.error('Bakiye bilgisi gönderilirken hata oluştu:', error);
    await bot.sendMessage(chatId, 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
});

// İstatistik komutu
bot.onText(/\/stats/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from?.id;
  
  if (!telegramId) {
    return bot.sendMessage(chatId, 'Kullanıcı bilgileriniz alınamadı. Lütfen daha sonra tekrar deneyin.');
  }
  
  try {
    // Kullanıcı kaydı
    const user = ensureUserExists(msg);
    
    await bot.sendMessage(chatId, 
      `📊 *Madencilik İstatistikleriniz*\n\n` +
      `Madencilik Gücü: *${user.miningPower.toFixed(2)}*\n` +
      `Günlük Kazanç: *${(0.01 * user.miningPower * 24).toFixed(3)} TON* (tahmini)\n` +
      `Toplam Kazanç: *${user.totalEarned.toFixed(3)} TON*\n` +
      `Referral Sayısı: *${user.referrals.length}*\n\n` +
      `Daha detaylı istatistikler için uygulamayı açın.`,
      { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '⛏ Mining Yap', callback_data: 'mine' }],
            [{ text: '📱 Uygulamayı Aç', web_app: { url: appUrl } }]
          ]
        }
      }
    );
  } catch (error) {
    console.error('İstatistik bilgisi gönderilirken hata oluştu:', error);
    await bot.sendMessage(chatId, 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
});

// Referral komutu
bot.onText(/\/referral/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from?.id;
  
  if (!telegramId) {
    return bot.sendMessage(chatId, 'Kullanıcı bilgileriniz alınamadı. Lütfen daha sonra tekrar deneyin.');
  }
  
  try {
    // Kullanıcı kaydı
    const user = ensureUserExists(msg);
    
    // Referral link oluştur
    const referralLink = `https://t.me/ton_mining_bot?start=${user.referralCode}`;
    
    await bot.sendMessage(chatId, 
      `🔗 *Referans Linkiniz*\n\n` +
      `Arkadaşlarınızı davet edin ve kazanç sağlayın!\n\n` +
      `Referans linkiniz:\n\`${referralLink}\`\n\n` +
      `Referans Kodunuz: \`${user.referralCode}\`\n\n` +
      `Toplam referral sayınız: *${user.referrals.length}*\n\n` +
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
  } catch (error) {
    console.error('Referral bilgisi gönderilirken hata oluştu:', error);
    await bot.sendMessage(chatId, 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
});

// Callback query handler
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  const chatId = msg?.chat.id;
  const telegramId = callbackQuery.from.id;
  
  if (!chatId) return;
  
  // İlk yanıtı gönder
  await bot.answerCallbackQuery(callbackQuery.id);
  
  if (data === 'mine') {
    try {
      // Mining ödülü ekle
      const user = addMiningReward(telegramId, 0.01);
      
      if (user) {
        // Mining başarılı
        await bot.sendMessage(chatId, 
          `⛏ *Mining Başarılı!*\n\n` +
          `Mining gücünüz: *${user.miningPower.toFixed(2)}*\n` +
          `Kazanılan TON: *${(0.01 * user.miningPower).toFixed(3)} TON*\n` +
          `Toplam bakiye: *${user.balance.toFixed(3)} TON*\n\n` +
          `Mining gücünüzü artırmak için arkadaşlarınızı davet edin veya uygulamayı açın.`,
          { 
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📱 Uygulamayı Aç', web_app: { url: appUrl } }]
              ]
            }
          }
        );
      } else {
        // Mining başarısız veya çok sık denendi
        await bot.sendMessage(chatId, 
          `⏳ Mining işlemi şu anda yapılamıyor.\n\n` +
          `Mining işlemleri arasında 5 dakika beklemeniz gerekmektedir.\n` +
          `Daha fazla bilgi için uygulamayı açın.`,
          { 
            reply_markup: {
              inline_keyboard: [
                [{ text: '📱 Uygulamayı Aç', web_app: { url: appUrl } }]
              ]
            }
          }
        );
      }
    } catch (error) {
      console.error('Mining işlemi sırasında hata oluştu:', error);
      await bot.sendMessage(chatId, 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  }
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