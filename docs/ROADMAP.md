# 🗺️ GyroMaze Geliştirme Yol Haritası ve Mühendislik Planı

Bu belge, **GyroMaze** projesinin tamamlanan aşamalarını, performans/gecikme optimizasyon kararlarını, harita tasarım standartlarını ve sıradaki geliştirme hedeflerini içerir.

---

## ✅ Tamamlanan Aşamalar

### Faz 1: Mimari Temel ve Monorepo Kurulumu
- [x] NPM Workspaces tabanlı Monorepo (`apps/client`, `apps/server`, `packages/shared`) kurulumu.
- [x] Katı Git kimliği (`Eren Kadiroğlu`) ve Türkçe Conventional Commits standartları.
- [x] Temel mimari ve katkı dokümantasyonlarının (`README.md`, `CONTRIBUTING.md`, `docs/ARCHITECTURE.md`) oluşturulması.

### Faz 2: Çekirdek Oyun Motoru ve Gerçek Zamanlı Telemetri
- [x] NestJS + Socket.io (`GyroGateway`, `RoomService`) ile bellek içi `O(1)` oda yönetimi.
- [x] QR kod ile mobil-masaüstü anlık eşleşme sistemi.
- [x] HTML5 Device Orientation API entegrasyonu, sıfır noktası kalibrasyonu (tare) ve iOS 13+ izin akışı.
- [x] React Three Fiber + Rapier 3B labirent sahnesi ve Zustand `transientGyro` (sıfır React re-render) mimarisi.

### Faz 3: Fizik Düzeltmeleri, Tünel Mimarisi ve Oyun İçi Zenginleştirmeler
- [x] **Sıfır Zıplamalı (Zero-Bounce) Küre Fiziği:** Tahta-yerel sabit çarpıştırıcılar + eğimli yerçekimi vektörü mimarisiyle hızlı eğimlerde zeminin bilyeyi havaya fırlatması tamamen engellendi.
- [x] **Sıfır Gecikmeli (`TCP_NODELAY`) WebSocket Upgrade Proxy (`server.mjs`):** Next.js HTTP rewrite kaynaklı `polling` gecikmesi kaldırılarak, `ngrok` HTTPS tüneli üzerinden bile %100 saf WebSocket (`wss://`) bağlantısı sağlandı.
- [x] **3B Tepkisellik ve GPU Optimizasyonu:** `Quaternion.slerp` katsayısı `32` seviyesine çıkarıldı, tekil (singleton) materyal paylaşımı ve `1024x1024` gölge haritası ile sabit 60 FPS garanti altına alındı.
- [x] **Matematiksel Doğrulanmış 5 Bölüm (`mazeLevels.ts`):** Bilye çapına ($0.68\text{ birim}$) uygun en az $2.40\text{–}3.60\text{ birim}$ koridor genişlikleri, kesişmeyen duvarlar ve kapı ağızlarını kapatmayan köşe tuzak delikleri (`voidHoles`).
- [x] **Web Audio API Ses Motoru & Mobil Haptic Titreşim:** Harici ses dosyası gerektirmeyen prosedürel ses sentezleyici ve çarpışma/delik/zafer anında mobil titreşim.

---

## 📏 Harita ve Bölüm Tasarım Kuralları (Level Design Constraints)

Yeni eklenecek tüm haritalarda aşağıdaki mühendislik kuralları zorunludur:

1. **Minimum Geçit Genişliği:** Bilye çapı $0.68\text{ birim}$ olduğundan, iki duvar arası veya kapı açıklığı **asla $2.20\text{ birimden}$ dar olamaz**.
2. **Duvar Kesişim Yasağı:** Yatay ve dikey iç duvarlar birbiriyle üst üste binmemeli (Z-fighting önlenmeli), köşe birleşimlerinde duvar kalınlığı ($0.36\text{ birim}$) hesaba katılmalıdır.
3. **Tuzak Deliği (Void Hole) Konumlandırma Kuralı:**
   - Tuzak delikleri **asla** dar bir kapı ağzının tam önüne veya tek geçiş koridorunun ortasına yerleştirilemez.
   - Her tuzak deliğinin yanından en az **$1.50\text{ birim}$** güvenli geçiş koridoru bulunmalı veya delikler yalnızca dönüşlerdeki dış köşe ceplerine yerleştirilmelidir.
   - Fiziksel delik sensör yarıçapı, görsel delik yarıçapının `%68`'i olmalıdır (bilyenin sadece kenarı değdiğinde değil, ağırlık merkezi deliğe girdiğinde düşmesi için).

---

## ✅ Faz 4: Oyun Mekaniği Derinliği ve Görsel Efektler (Tamamlandı)

- [x] **Periyodik Lazer Kapılar (`laserGates`):** Belirli periyotlarla açılıp kapanan enerji bariyerleri ve elektro-darbe ses/titreşim geri bildirimi.
- [x] **Toplanabilir Enerji Kristalleri (`crystals`) ve Portal Kilidi:** Hedef portalını kehribar (kilitli) durumdan zümrüt yeşili (açık) duruma geçiren kristal toplama mekaniği.
- [x] **Bilye Neon Hareket İzi (`Motion Trail`):** Sıfır GC maliyetli, halka tampon (ring-buffer) tabanlı akıcı neon zemin izi.

## ✅ Faz 5: İleri Seviye Sistemler (Tamamlandı)

- [x] **Özel Harita Editörü (`LevelEditorModal.tsx`):** Kullanıcının tarayıcı üzerinden kendi duvar, kristal, lazer ve tuzaklarını 8×8 görsel ızgara üzerinde yerleştirip anında 3B sahnede oynayabilmesi ve JSON olarak dışa aktarabilmesi.
- [x] **Küresel Skor Tablosu (`Leaderboard`):** Bölüm rekorlarının NestJS sunucusu üzerinde gerçek zamanlı olarak tutulması ve tüm bağlı istemcilere canlı yayınlanması.

