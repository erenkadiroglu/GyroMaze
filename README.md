<div align="center">

# 🌀 GyroMaze

**Sıfır Gecikmeli, Çapraz Cihaz (Mobil Jiroskop → Masaüstü WebGL) 3B Fizik Tabanlı Labirent Deneyimi**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://docs.pmnd.rs/react-three-fiber)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📖 Proje Hakkında

**GyroMaze**, akıllı telefonunuzun donanımsal jiroskop sensörlerini (**HTML5 Device Orientation API**) gerçek zamanlı bir oyun kumandasına dönüştüren, masaüstü tarayıcınızda ise **React Three Fiber (Three.js)** ve **Rapier 3B Fizik Motoru** ile 60 FPS akıcılığında çalışan modern bir web oyunudur.

Masaüstü ekranda oluşturulan benzersiz oda kodunu telefonunuzla **QR Kod** üzerinden taratarak saniyeler içinde eşleşebilir; telefonunuzu eğerek 3B labirent düzlemini milimetrik hassasiyetle kontrol edebilirsiniz.

---

## ✨ Temel Özellikler

- **⚡ Ultra Düşük Gecikmeli Senkronizasyon (<10ms):** NestJS ve Socket.io WebSocket altyapısı ile mobil sensör verilerinin masaüstü sahneye kesintisiz aktarımı.
- **📱 QR Kod ile Anında Eşleşme:** Uygulama indirmeden veya hesap açmadan, yalnızca mobil tarayıcı ile QR kodu okutarak odaya bağlanma.
- **🎮 Fizik Tabanlı 3B Simülasyon:** `@react-three/rapier` ile gerçekçi yerçekimi, sürtünme, momentum ve küre-duvar çarpışma fiziği.
- **🧈 60 FPS Pürüzsüz Hareket (Lerp / Slerp):** Sensör gürültüsünü (jitter) filtreleyen matematiksel açısal enterpolasyon ve Framer Motion destekli arayüz animasyonları.
- **🎨 Minimalist Bağımsız Stüdyo Estetiği:** TailwindCSS ile tasarlanmış piksel-mükemmel, modern ve karanlık mod odaklı kullanıcı arayüzü.
- **🧩 Tip Güvenli Monorepo Mimarisi:** İstemci (`apps/client`) ve sunucu (`apps/server`) arasında `packages/shared` paketiyle paylaşılan uçtan uca TypeScript veri sözleşmeleri.

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji | Kullanım Amacı |
| :--- | :--- | :--- |
| **Monorepo** | NPM Workspaces | Çoklu paket ve bağımlılık orkestrasyonu |
| **Önyüz (Client)** | Next.js (App Router), React 19, TypeScript | Masaüstü 3B sahne ve mobil kontrolcü arayüzü |
| **3B Grafik & Fizik** | Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier` | WebGL 3B render hattı ve gerçek zamanlı fizik motoru |
| **Stil & Animasyon** | TailwindCSS, Framer Motion | Piksel-mükemmel UI tasarımı ve 60 FPS DOM geçişleri |
| **Durum Yönetimi** | Zustand | Düşük maliyetli, reaktif oyun ve bağlantı durumu yönetimi |
| **Arka Uç (Server)** | NestJS, TypeScript, Socket.io | Oda yönetimi, cihaz eşleştirme ve gerçek zamanlı telemetri aktarımı |
| **Donanım API** | HTML5 Device Orientation API | Mobil cihazın `alpha`, `beta`, `gamma` eğim açılarının okunması |

---

## 📂 Monorepo Klasör Yapısı

```text
GyroMaze/
├── .clinerules                  # Proje standartları ve tasarım kuralları
├── package.json                 # NPM Workspaces kök yapılandırması
├── README.md                    # Proje genel bakış ve kurulum kılavuzu
├── CONTRIBUTING.md              # Katkı sağlama ve kodlama standartları
├── docs/
│   └── ARCHITECTURE.md          # Detaylı sistem ve gerçek zamanlı iletişim mimarisi
├── apps/
│   ├── client/                  # Next.js 15 + React 19 + R3F İstemci Uygulaması
│   └── server/                  # NestJS + Socket.io WebSocket Sunucusu
└── packages/
    └── shared/                  # Paylaşılan TypeScript arayüzleri (GyroData, RoomEvents vb.)
```

---

## 🚀 Kurulum ve Çalıştırma

### Ön Gereksinimler

- **Node.js:** `v20.0.0` veya üzeri
- **NPM:** `v10.0.0` veya üzeri
- Aynı yerel ağa (Wi-Fi) bağlı bir **Masaüstü Bilgisayar** ve **Akıllı Telefon** (veya HTTPS tüneli).

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/erenkadiroglu/GyroMaze.git
cd GyroMaze
```

### 2. Bağımlılıkları Yükleyin

Kök dizinde çalıştıracağınız tek komut tüm çalışma alanlarını (`client`, `server`, `shared`) kuracaktır:

```bash
npm install
```

### 3. Ortak Tipleri Derleyin

```bash
npm run build --workspace=@gyromaze/shared
```

### 4. Geliştirme Sunucularını Başlatın

Hem Next.js istemcisini hem de NestJS WebSocket sunucusunu paralel olarak başlatmak için:

```bash
npm run dev
```

veya servisleri ayrı terminallerde çalıştırmak için:

```bash
# Sadece WebSocket Sunucusu (Varsayılan port: 4000)
npm run dev:server

# Sadece Next.js İstemcisi (Varsayılan port: 3000)
npm run dev:client
```

> **Not (iOS / Safari İzinleri):** Modern mobil tarayıcılarda `DeviceOrientationEvent.requestPermission()` API'sinin çalışabilmesi için yerel ağ testlerinde HTTPS bağlantısı veya güvenli tünel (örn. `ngrok` / `cloudflared` ya da yerel SSL sertifikası) kullanılması önerilir.

---

## 📐 Mimari Dokümantasyon

Oda yaşam döngüsü, QR tabanlı el sıkışma (handshake) protokolü ve Three.js `useFrame` render hattı hakkında kapsamlı teknik detaylar için [**Mimari Dokümantasyon (`docs/ARCHITECTURE.md`)**](./docs/ARCHITECTURE.md) dosyasına göz atabilirsiniz.

---

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmadan önce lütfen [**Katkı Rehberi (`CONTRIBUTING.md`)**](./CONTRIBUTING.md) içerisindeki kodlama standartlarını ve Türkçe **Conventional Commits** kurallarını inceleyin.

---

## 👤 Geliştirici

**Eren Kadiroğlu**
- GitHub: [@erenkadiroglu](https://github.com/erenkadiroglu)

