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

- **⚡ Ultra Düşük Gecikmeli Senkronizasyon (<10ms):** NestJS, Socket.io ve özel `TCP_NODELAY` WebSocket Proxy (`server.mjs`) altyapısı ile mobil sensör verilerinin masaüstü sahneye kesintisiz aktarımı.
- **📱 QR Kod veya 6 Haneli Oda Kodu ile Çift Yönlü Eşleşme:** Uygulama indirmeden, mobil tarayıcıdan QR kodu okutarak veya 6 haneli Oda Kodunu girerek saniyeler içinde bağlanma; telefon üzerinden doğrudan **Önceki / Sonraki Bölüm** geçişi ve **3 kademeli hassasiyet (`0.75x`, `1.0x`, `1.35x`)** kontrolü.
- **♾️ Sonsuz Prosedürel Bölüm Motoru (`Bölüm 01 .. ∞`):** İlk 5 el yapımı bölümün ardından *Mulberry32* deterministik tohumlu **Spanning-Tree (DFS + Braided Loops)** algoritmasıyla sıfır çakışmalı, %100 çözülebilir sonsuz labirent üretimi.
- **🧭 Kokpit HUD & Yapay Ufuk Göstergesi:** Karmaşadan arındırılmış iki kapsüllü üst çubuk, 60 FPS doğrudan DOM transformlu **Yapay Ufuk (Attitude Indicator)** + 2B canlı radar, sağdan açılan birleşik **Ayarlar Çekmecesi**, kalıcı kullanıcı tercihleri, **Süreye Karşı (Time Attack)** modu, **2 Oyunculu (1v1 & Co-op)** modu ve 4 farklı **Bilye Kaplaması** (*Krom*, *Zümrüt*, *Plazma*, *Kızıl*).
- **☀️ Tam Kapsamlı Gece & Gündüz Modu (`Light / Dark Mode`):** Masaüstü 3B WebGL sahnesi, HUD panelleri ve mobil kontrolcü arayüzü için tek tıkla (`Sun` / `Moon` veya `L` kısayolu) çalışan Gece Mavisi / Sis Grisi renk şemaları ve 4 farklı 3B atmosfer teması (*Zümrüt*, *Siberpunk*, *Kızıl Kor*, *Gün Işığı*).
- **🎮 Sıfır Zıplamalı (Zero-Bounce) 3B Küre Fiziği ve Zengin Engeller:** `@react-three/rapier` tabanlı sabit çarpıştırıcılar, **Enerji Kristalleri ve Portal Kilidi**, periyodik **Lazer Kapılar**, **Kinetik Hızlandırma Rampaları**, çift yönlü **Kuantum Işınlanma Portalları** ve **Hareketli Devriye Engelleri**.
- **👻 3B Hayalet Yarışçı (`Ghost Replay`) & Canlı 2B Radar:** Her bölümdeki en iyi kişisel rekorunuzun 10Hz yörüngesini kaydedip sonraki denemelerde 60 FPS yarı saydam hologram olarak oynatan Hayalet Küre, 3 yıldızlı derecelendirme, anlık bilye hızı (`m/s`) ve canlı 2B mini-harita radarı.
- **🛠️ Dahili 8×8 Harita Editörü & Küresel Skor Tablosu:** Tarayıcı üzerinden duvar, delik, kristal, lazer, hız rampası ve devriye engel yerleştirme, rastgele harita üretme, panodan JSON içe/dışa aktarma ve bölüm bazlı gerçek zamanlı liderlik tablosu.
- **🔊 Prosedürel Web Audio Ses Motoru & Haptic Titreşim:** Harici ses dosyası gerektirmeyen gerçek zamanlı ses sentezleyici ve çarpışma, kristal, lazer, hız rampası, ışınlanma ve zafer anında mobil titreşim geri bildirimi.
- **🧩 Tip Güvenli Monorepo ve Otomatik Test Paketi:** `packages/shared`, `apps/server` ve `apps/client` genelinde uçtan uca TypeScript doğrulaması ve `node --test` birim/geometri testleri.

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
│   ├── ARCHITECTURE.md          # Detaylı sistem, WebSocket proxy ve 3B fizik mimarisi
│   ├── DESIGN.md                # Kokpit arayüz tasarım sistemi, renk ve tipografi belirteçleri
│   └── ROADMAP.md               # Tamamlanan geliştirme fazları ve harita tasarım kuralları
├── apps/
│   ├── client/                  # Next.js 15 + React 19 + R3F İstemci & TCP_NODELAY Proxy
│   └── server/                  # NestJS + Socket.io WebSocket Sunucusu
├── packages/
│   └── shared/                  # Paylaşılan TypeScript arayüzleri (GyroData, RoomEvents vb.)
└── scripts/                     # Paralel geliştirme başlatıcısı ve statik kod denetimi
```

---

## ⌨️ Masaüstü Klavye Kısayolları

Telefon bağlı olmadığında veya masaüstü üzerinden hızlı kontrol sağlamak istediğinizde aşağıdaki kısayolları kullanabilirsiniz:

| Tuş | İşlev |
| :--- | :--- |
| **`W` `A` `S` `D` / `Yön Tuşları`** | Tek oyunculu modda labirente masaüstünden eğim verir (2 oyunculuda `WASD` 1. oyuncuyu, `Yön Tuşları` 2. oyuncuyu kontrol eder) |
| **`R`** | Topu başlangıç noktasına sıfırlar |
| **`L`** | Aydınlık / Karanlık modu değiştirir |
| **`C`** | Kamera bakış açısını değiştirir (*İzometrik*, *Üstten*, *Takip*) |
| **`M`** | Prosedürel ses motorunu açar / kapatır |
| **`Tab`** *(Pencere içinde)* | Açık pencere / çekmece içindeki etkileşimli kontroller arasında odak taşır |

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

### 3. Geliştirme Sunucularını Başlatın

Hem ortak `@gyromaze/shared` paketini derlemek hem de Next.js istemcisini + NestJS WebSocket sunucusunu paralel başlatmak için:

```bash
npm run dev
```

veya üretim (production) derlemesinden sonra servisleri başlatmak / ayrı terminallerde çalıştırmak için:

```bash
# Tüm çalışma alanlarını derleyip üretim sunucularını başlatır
npm run build && npm run start

# Sadece Ortak Tipleri Derle
npm run build:shared

# Sadece WebSocket Sunucusu (Varsayılan port: 4000)
npm run dev:server

# Sadece Next.js İstemcisi (Varsayılan port: 3000)
npm run dev:client
```

### 4. Tip Kontrolü, Testler ve Statik Denetim

```bash
npm run typecheck
npm test
npm run lint
```

> **Not (iOS / Safari ve Yerel Ağ İzinleri):** Modern mobil tarayıcılarda `DeviceOrientationEvent.requestPermission()` API'sinin çalışabilmesi için HTTPS bağlantısı önerilir. Masaüstünden QR kod tararken tünel aktif değilse uygulama otomatik olarak yerel ağ IPv4 adresinize yönlendirir; HTTP üzerinden açıldığında ise ekrandaki sanal eğim halkası dokunmatik kontrolle anında kullanılabilir.

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

