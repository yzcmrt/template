import dotenv from 'dotenv';
import { startBot } from './services/telegram-bot-service';

// .env dosyasını yükle
dotenv.config();

// Botu başlat
console.log('TON Mining Bot başlatılıyor...');
const bot = startBot();

// Process sonlandırma işlemleri
process.on('SIGINT', () => {
  console.log('Bot kapatılıyor...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Bot kapatılıyor...');
  bot.stopPolling();
  process.exit(0);
});

console.log('Bot çalışıyor, Ctrl+C ile durdurun.'); 