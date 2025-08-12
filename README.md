# Çevre Değişkenleri

Bu proje hem Node bot süreci hem de Vite tabanlı istemci içerir. Güvenlik için `.env` dosyası repoya eklenmez.

1) Sunucu (Node) tarafı değişkenleri:

```
TELEGRAM_BOT_TOKEN=...
APP_URL=https://your-deploy-url
```

2) İstemci (Vite) tarafı değişkenleri (sadece `VITE_` ile başlayanlar bundle edilir):

```
VITE_TON_WALLET_ADDRESS=...
VITE_TON_MANIFEST_URL=https://your-site/tonconnect-manifest.json
```

Örnek için `.env` dosyasındaki açıklamalara bakın ve kendi ortamınızda doldurun.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
