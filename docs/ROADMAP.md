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

## ✅ Faz 5: İleri Seviye Sistemler ve Mobil Performans Mimarisi (Tamamlandı)

- [x] **Özel Harita Editörü (`LevelEditorModal.tsx`):** Kullanıcının tarayıcı üzerinden kendi duvar, kristal, lazer ve tuzaklarını 8×8 görsel ızgara üzerinde yerleştirip anında 3B sahnede oynayabilmesi ve JSON olarak dışa aktarabilmesi.
- [x] **Küresel Skor Tablosu (`Leaderboard`):** Bölüm rekorlarının NestJS sunucusu üzerinde gerçek zamanlı olarak tutulması ve tüm bağlı istemcilere canlı yayınlanması.
- [x] **Mobil GPU ve Sensör Döngüsü Optimizasyonu (`controller/page.tsx`, `useDeviceOrientation.ts`, `useSocket.ts`):**
  - Mobil tarayıcılarda GPU overdraw yaratan tüm `backdrop-blur` ve ağır gölge katmanları kaldırıldı; yalnızca `will-change-transform` ve saf `translate3d` kompozit katmanı bırakıldı.
  - 120–240Hz frekansında tetiklenen `deviceorientation` ve `pointermove` olayları doğrudan DOM manipülasyonundan ayrıştırıldı; tek bir `requestAnimationFrame` döngüsü ve 8Hz metin seyreltmesi (throttling) ile ana iş parçacığı (Main Thread) darboğazı sıfırlandı.
  - Soket bağlantısını koparmadan çalışan 6 haneli **Oda Kodu (`joinRoomByCode`)** geçiş sistemi ve `0.1°` açısal delta filtresi eklendi.

## ✅ Faz 6: Otomatik Test Paketi ve Üretim (Production) Hazırlığı (Tamamlandı)

- [x] **Sunucu Birim ve Entegrasyon Testleri (`apps/server/test/room.service.test.mjs`):** 6 haneli oda üretimi, küçük/büyük harf duyarsız oda kodu eşleşmesi, sekme yenilendiğinde soket devralma, oda değiştirme ve küresel skor sıralaması testleri.
- [x] **Harita Geometrisi ve Fizik Doğrulama Testleri (`apps/client/test/mazeLevels.test.mjs`):** 5 bölümün tamamında başlangıç/hedef noktası, iç duvarlar, enerji kristalleri ve tuzak delikleri arasında çarpışma veya sıkışma olmadığını doğrulayan matematiksel test paketi.
- [x] **Ortam Şablonu (`.env.example`) ve Kök Test Komutu (`npm test`):** Tek komutla tüm çalışma alanlarının doğrulanması.

## ✅ Faz 7: Çift Yönlü Mobil Oyun Kumandası, Hızlandırma Rampaları ve Kamera Modları (Tamamlandı)

- [x] **Çift Yönlü Mobil Konsol Deneyimi (`GAME_CHANGE_LEVEL` & `GAME_STATE_CHANGE`):** Masaüstündeki aktif bölüm, kristal ilerlemesi (`2/3`) ve bölüm zafer durumu gerçek zamanlı olarak telefon ekranına yansıtıldı; oyuncu masaüstü faresine dokunmadan doğrudan telefondan **Önceki / Sonraki Bölüm** geçişi yapabilir.
- [x] **Kinetik Hızlandırma Rampaları (`boostPads`):** Koridorlara yerleştirilen yönlü neon hızlandırma rampaları, `playBoostPad` ses sentezleyicisi ve mobil titreşim (`boost`) geri bildirimi.
- [x] **3 Kamera Bakış Açısı Modu (`İzometrik`, `Üstten`, `Takip`):** Üst HUD üzerinden tek tıkla klasik izometrik açı, tam dikey speedrun açısı veya bilyeyi dinamik takip eden sinematik kamera arasında geçiş.
- [x] **3 Yıldızlı Performans Sistemi (`starThresholds`):** Bölüm tamamlama süresine göre 1–3 yıldız derecelendirmesi.

## ✅ Faz 8: Kuantum Işınlanma Portalları, 3B Görsel Atmosfer Temaları ve Editör Genişletmesi (Tamamlandı)

- [x] **Çift Yönlü Kuantum Işınlanma Portalları (`teleporters`):** Bölüm 3, 4 ve 5'e yerleştirilen solucan deliği portalları; bilyenin momentumunu koruyarak iki nokta arasında anında ışınlanması, `playTeleport` ses sentezleyicisi ve `teleport` mobil titreşim deseni.
- [x] **3B Görsel Atmosfer Temaları (`Zümrüt`, `Siberpunk`, `Kızıl Kor`):** Üst HUD üzerinden gerçek zamanlı değiştirilebilen zemin, iç/dış duvar ve neon bilye izi renk paletleri.
- [x] **Harita Editörü Hız Rampası Desteği (`LevelEditorModal.tsx`):** Özel harita tasarımcısına hızlandırma rampası (`▲`) yerleştirme aracı eklendi.

## ✅ Faz 9: 3B Hayalet Yarışçı (Ghost Replay), Mobil Hassasiyet Ayarı ve JSON Harita İçe Aktarma (Tamamlandı)

- [x] **3B Hayalet Yarışçı Sistemi (`Ghost Replay`):** Oyuncunun her bölümde kırdığı en iyi kişisel rekorun (Personal Best) 10Hz yörünge kaydı `localStorage` üzerinde saklanır; sonraki denemelerde yarı saydam zümrüt bir **Hayalet Küre** 60 FPS enterpolasyonla sahnede canlı olarak yarışır.
- [x] **3 Kademeli Mobil Jiroskop Hassasiyet Seçici (`Hassas 0.75x`, `Standart 1.0x`, `Pro 1.35x`):** Mobil kontrolcü ekranından eğim çarpanını anında değiştirme imkanı.
- [x] **Harita Editörü Panodan JSON İçe Aktarma (`JSON Yükle`):** Paylaşılan özel harita JSON verilerini tek tıkla içe aktarıp 3B sahnede oynama özelliği.

## ✅ Faz 10: Sonsuz Prosedürel Bölüm Motoru (Bölüm 1..∞), Tam Kapsamlı Aydınlık / Karanlık Mod ve Hareketli Engeller (Tamamlandı)

- [x] **Sonsuz Prosedürel Bölüm Motoru (`generateProceduralLevel` & `getMazeLevel`):** Oyun artık 5 bölümle sınırlı değildir (`Bölüm 01 .. ∞`). `Bölüm 06` ve sonrasında Mulberry32 deterministik tohumlu Spanning-Tree (DFS + Braided Loops) algoritmasıyla %100 çözülebilir, $2.64\text{ birim}$ koridor genişlikli, sıfır çakışmalı sonsuz labirentler otomatik üretilir.
- [x] **Tam Kapsamlı Aydınlık ve Karanlık Mod (`colorScheme: 'light' | 'dark'` & `daylight`):** Masaüstü 3B WebGL sahnesi (beyaz mermer zemin, arduvaz duvarlar, koyu obsidyen krom bilye ve aydınlık atmosfer sisi), Masaüstü HUD panelleri ve Mobil Kontrolcü arayüzü için tek tıkla (`Sun` / `Moon` veya `L` kısayolu) çalışan Aydınlık / Karanlık mod eklendi.
- [x] **Hareketli Kinetik Devriye Engelleri (`movingObstacles`):** Koridorlarda sinüzoidal olarak devriye gezen ve çarptığında bilyeye fiziksel saptırma darbesi uygulayan dinamik engeller eklendi.
- [x] **Etkileşimli Sahne Bildirimleri (`hudNotification`) ve Klavye Kısayolları:** Kristaller tamamlanmadan kilitli portala dokunulduğunda sesli (`playLockedPortal`) ve görsel uyarı, son kristal alındığında portal açılış bildirimi ve hızlı klavye kısayolları (`R`, `C`, `M`, `L`) eklendi.

## ✅ Faz 11: Canlı 2B Radar (Mini-Harita), Anlık Hız Sayacı, Gelişmiş Harita Editörü ve Dokümantasyon Güncellemesi (Tamamlandı)

- [x] **60 FPS Canlı 2B Radar (Mini-Harita) ve Anlık Bilye Hızı (`m/s`):** Alt telemetri paneline React re-render tetiklemeden (`transientGyro.ballX`, `ballZ`, `ballSpeed`) çalışan canlı 2B mini-harita radarı (bilye konumu, kalan kristaller ve hedef portalı) ile anlık hız göstergesi eklendi.
- [x] **Harita Editörü Geliştirmeleri (`LevelEditorModal.tsx`):** Özel harita tasarımcısına **Hareketli Devriye Engeli (`↔`)** yerleştirme aracı ve tek tıkla 8×8 ızgarayı dengeli engellerle dolduran **Rastgele (`Shuffle`)** harita üretici eklendi.
- [x] **Mimari ve Proje Dokümantasyonu (`README.md`, `docs/ARCHITECTURE.md`):** Sonsuz prosedürel bölüm motoru, aydınlık/karanlık mod, sıfır zıplamalı fizik mimarisi ve klavye kısayolları tüm proje belgelerine işlendi.

## ✅ Faz 12: Oyun & Fizik Ayarları Modalı ve Çok Oyunculu (2 Oyuncu — 1v1 & Co-op) Modu (Tamamlandı)

- [x] **Oyun, Fizik ve Görsel Ayarlar Modalı (`SettingsModal.tsx`):** Masaüstü HUD üzerinden bilye yerçekimi ivmesini (`gravityScale`: `0.5x – 1.8x`), tabla eğim tepki hızını (`tiltResponsiveness`: `0.5x – 1.8x`), Web Audio ses efekti seviyesini (`soundVolume`: `0% – 100%`) ve görsel katmanları (`Bilye Kuyruk İzi`, `3B Hayalet Yarışçı`, `2B Canlı Radar`) anlık olarak özelleştirme imkanı.
- [x] **Çok Oyunculu (2 Oyuncu — 1v1 & Co-op) Modu (`playerSlot: 1 | 2`):** Aynı 6 haneli oda koduna 2 farklı telefonun (`Oyuncu 1 - Ana Bilye` ve `Oyuncu 2 - Altın Bilye`) veya masaüstünde `WASD` (1. Oyuncu) + `Yön Tuşları` (2. Oyuncu) kombinasyonunun aynı anda bağlanarak kristalleri ortaklaşa toplaması ve hedef portala yarışması.

## ✅ Faz 13: Kokpit Arayüz Tasarım Sistemi, Süreye Karşı Mod ve Bilye Kaplamaları (Tamamlandı)

- [x] **Birleşik Tasarım Sistemi (`docs/DESIGN.md`, `globals.css`, `primitives.tsx`):** `Barlow` + `Barlow Condensed` (`tabular-nums`) tipografisi, Gece Mavisi / Sis Grisi & Pirinç Vurgu renk belirteçleri (`data-scheme`), `localStorage` kalıcı tercih senkronizasyonu (`useAppPreferences`), `Esc` ve odak yönetimli erişilebilir `Modal` / `Drawer` / `Segmented` / `SwitchRow` / `IconButton` bileşenleri.
- [x] **Sadeleştirilmiş Kokpit HUD ve Yapay Ufuk Göstergesi (`AttitudeGauge.tsx`, `DesktopHUD.tsx`):** Kalabalığı ortadan kaldıran iki kapsüllü üst çubuk (bölüm açılır menüsü + en fazla iki ana eylem), sol altta 60 FPS doğrudan DOM transformlarıyla çalışan **Yapay Ufuk Göstergesi (Attitude Indicator)** + kompakt 2B radar ve sağ altta klavye kısayollu hızlı araç çubuğu.
- [x] **Süreye Karşı (`time_attack`) Modu ve 4 Bilye Kaplaması (`BallSkin`):** Ayarlar çekmecesi üzerinden geri sayımlı **Süreye Karşı** oyun akışı (`won` / `lost` durumları) ve 1. oyuncu bilyesi için *Krom*, *Zümrüt*, *Plazma* ve *Kızıl* materyal kaplamaları eklendi.

## ✅ Faz 14: Sistem Denetimi, Çok Oyunculu Fizik Paritesi, Gerçek RTT Ölçümü ve Zamanlayıcı Düzeltmeleri (Tamamlandı)

- [x] **Süre Sıfırlama ve Overlay Duraklatma (`DesktopHUD.tsx`, `MazeScene.tsx`):** Deliğe düşüldüğünde veya `R` ile sıfırlandığında `resetCount` tepkisiyle bölüm sayacı sıfırdan başlatıldı; Eşleştirme, Ayarlar, Editör veya Skor Tablosu açıkken hem 3B Rapier fizik simülasyonu hem de `Time Attack` sayacı güvenle duraklatılır.
- [x] **2. Oyuncu Tam Etkileşim Paritesi ve Adil Sıfırlama (`MazeScene.tsx`):** Paylaşılan `processBallInteractions` yardımcısı sayesinde çok oyunculu modda 2. oyuncu bilyesi de hızlandırma rampaları, ışınlanma portalları, periyodik lazerler ve hareketli engellerle 1. oyuncuyla birebir aynı kurallarda etkileşir; çok oyunculu modda yalnızca tuzağa düşen bilye başlangıca döner.
- [x] **60 FPS Tekrar Tetiklenme Koruması & Re-Render Optimizasyonu:** Kristal toplama ve hedef portalı kontrolleri senkron `useGameStore.getState()` korumasıyla aynı karede çift ses/titreşim üretimini ve 10Hz sayaç kaynaklı gereksiz 3B sahne yeniden renderlarını önler.
- [x] **Saat Sapmasız Gerçek RTT Ping ve Senkronizasyon İyileştirmeleri (`ROOM_PING`, `useSocket.ts`, `controller/page.tsx`):** Telefon–masaüstü sistem saati farkından etkilenen yapay ping yerine WebSocket onaylı (`room:ping`) gerçek ağ gidiş-dönüş gecikmesi (`RTT ms`) ölçümü eklendi; ayrılan oyuncu yuvasına göre izole jiroskop sıfırlama (`resetTransientGyro(slot)`), `ROOM_PAIRED` anında durum snapshot gönderimi ve mobil manuel bağlantıda çift `ROOM_JOIN` tekrarı giderildi.








