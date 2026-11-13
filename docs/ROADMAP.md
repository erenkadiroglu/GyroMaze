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

## ✅ Faz 15: Hedefli Haptik Yönlendirme, Sensör Kalibrasyon İyileştirmesi ve Editör Doğrulama (Tamamlandı)

- [x] **Oyuncu Bazlı Hedefli Mobil Titreşim (`HapticPayload.playerSlot`, `gyro.gateway.ts`):** Çok oyunculu modda duvar, delik, lazer, hız rampası ve ışınlanma titreşimleri yalnızca ilgili oyuncunun telefonuna (`playerSlot: 1 | 2`) iletilir; kristal toplama ve zafer titreşimi her iki cihaza ortak gönderilir.
- [x] **Anlık Jiroskop Kalibrasyon Sıfırlama & Klavye Takılma Koruması (`useDeviceOrientation.ts`, `useKeyboardFallback.ts`):** Kalibrasyon anında EMA yumuşatma tamponu sıfırlanarak anında merkeze dönüş sağlandı (`±180°` açı sarma korumalı); overlay modalları açıkken veya pencere odağı kaybolduğunda (`blur`) basılı kalan klavye eksenleri otomatik sıfırlandı.
- [x] **Mobil Süre Doldu Kartı, Dinamik Radar Ölçeği ve Çözülebilir Editör Haritası:** Mobil kontrolcüye `Time Attack` kaybı için **Süre doldu / Tekrar dene** kartı eklendi ve pasif ekranlardaki alt butonlar temizlendi; `AttitudeGauge.tsx` radarı tahta boyutuna göre dinamik ölçeklendi; `LevelEditorModal.tsx` rastgele üreticisi BFS çözülebilirlik doğrulaması ve güvenli JSON içe aktarma doğrulaması kazandı.

## ✅ Faz 16: Akıllı LAN QR Yönlendirmesi, Mobil Ekran Kilidi (Wake Lock) ve Hedefli Portal Haptiği (Tamamlandı)

- [x] **Yerel Ağ (LAN) QR Geri Dönüşü ve Akıllı Yuva Seçimi (`DesktopHUD.tsx`):** `ngrok` HTTPS tüneli olmadığında `localhost` / `127.0.0.1` QR bağlantısı sunucunun tespit ettiği `lanIp` adresine yönlendirilir, modalda aktif bağlantı yolu (HTTPS tüneli veya yerel Wi-Fi) belirtilir ve çok oyunculu modda 1. oyuncu bağlıyken modal açıldığında otomatik olarak 2. oyuncu yuvası seçilir.
- [x] **Mobil Wake Lock, HTTP Güvenli Bağlam Uyarısı ve Yuva Değişimi Sıfırlaması (`controller/page.tsx`):** Aktif kontrol sırasında ekranın kararmasını önleyen `navigator.wakeLock` desteği (`visibilitychange` ile otomatik yenileme) eklendi; HTTP üzerinde açıldığında sensör kısıtlaması ve dokunmatik gimbal rehberi gösterilir; çok oyunculu yuva değişiminde artık eğim `0, 0` olarak temizlenir.
- [x] **Kilitli Portal Haptik Hedeflemesi & Web Audio Güvenli Devam Etme (`MazeScene.tsx`, `soundEngine.ts`):** Kristaller toplanmadan hedefe çarpan ilgili oyuncuya özel `wall` titreşimi yönlendirildi ve tarayıcı otomatik oynatma kısıtlarında `AudioContext.resume()` hatalarının sessizce yakalanması sağlandı.

## ✅ Faz 17: Yetkili Oturum Devralma, Simetrik 1v1 Fizik Paritesi ve Skor Doğrulaması (Tamamlandı)

- [x] **Sekme Devralma Koruması & Yuva Bazlı Kalibrasyon (`gyro.gateway.ts`, `useSocket.ts`, `@gyromaze/shared`):** Aynı yuvaya yeni bir telefon veya sekme katıldığında eski soket odadan çıkarılarak `SESSION_REPLACED` hatasıyla bilgilendirilir ve yetkisiz/eski kontrolcü jiroskop paketleri ağ geçidinde reddedilir; `GYRO_CALIBRATE` artık `playerSlot` bilgisini taşıyarak çok oyunculu modda yalnızca kalibre eden oyuncunun tamponunu sıfırlar ve yuva değişiminde terk edilen yuva temizlenir.
- [x] **Simetrik 1v1 Portal Paritesi & 2. Oyuncu Hayalet İzi (`MazeScene.tsx`):** Çok oyunculu modda 2. oyuncunun haksız geniş bitiş yarıçapı (`0.48` -> simetrik `0.46` / `0.2116`) 1. oyuncuyla eşitlendi, her iki oyuncunun portal üstünde beklerken son kristalin toplanmasıyla anında kazanabilmesi sağlandı, `runPathP2Ref` ile kazanan 2. oyuncunun da Hayalet Yarışçı izi kaydedildi ve sağ kenara yakın özel haritalar için güvenli `p2SpawnOffsetX` koruması eklendi.
- [x] **Sunucu Skor Doğrulaması & Kokpit / Mobil Akış Düzeltmeleri (`room.service.ts`, `DesktopHUD.tsx`, `globals.css`, `controller/page.tsx`):** `submitScore` geçersiz süre/bölüm (`NaN`, `<=0`, `levelId: 99`) girişlerini reddeder; Skor Tablosu açıldığında oynanan aktif bölüme odaklanır; bölüm seçicide prosedürel aktif seviye vurgulanır; `globals.css` mobil kontrolcüde dikey kaydırmayı engellemeyecek şekilde `overflow-x: hidden` olarak düzenlendi ve mobilde 1. bölümde "Önceki" düğmesi devre dışı bırakıldı.

## ✅ Faz 18: Zamanlayıcı Başlatma Güvenliği, Dinamik Editör Doğrulaması ve Tema Kontrastı (Tamamlandı)

- [x] **Sıfır-Saniye Oyun Açığı Koruması (`DesktopHUD.tsx`, `MazeScene.tsx`):** QR eşleştirme penceresi `Esc`, kapatma düğmesi veya arka plan tıklamasıyla kapatıldığında da (`handleClosePairingModal`) `waiting` durumu `playing` olarak başlatılır; 3B fizik döngüsü ve delik sensörü artık yalnızca aktif `playing` durumunda çalışır; 1. oyuncu telefondan bağlıyken 2. oyuncu klavye kısayol ipucu korunur ve büyük tahtalar için dinamik gölge alanı (`shadowMargin`) uygulanır.
- [x] **Dinamik Başlangıçlı BFS & Katı JSON İçe Aktarma (`LevelEditorModal.tsx`):** `hasSolvableGridPath` sabit `[0, 0]` yerine ızgaradaki gerçek `'start'` konumunu bulur ve **"3B sahnede oyna"** öncesinde erişilebilirlik doğrulaması uygular; panodan içe aktarılan JSON dizileri öğe bazlı şema/tip doğrulamasından geçirilerek Rapier/Three.js çökme riskleri ortadan kaldırılır.
- [x] **Gündüz Modu Kartela Kontrastı (`SettingsModal.tsx`):** Bilye kaplama kartelasında (`BALL_SKIN_SWATCHES`) açık gri `Krom` örneğinin Gündüz modunda kaybolmaması için halka kenarlığı tema belirtecine (`ring-line`) geçirildi.

## ✅ Faz 19: Donanım Sensör Sinyali Algılama, Erişilebilir Odak Döngüsü ve Ses Motoru Optimizasyonu (Tamamlandı)

- [x] **Mobil Donanım Sensör Sinyali İzleyicisi (`useDeviceOrientation.ts`, `controller/page.tsx`):** `event.beta` ve `event.gamma` değerleri `null` gelen boş tarayıcı olayları elendi; sensör izni sonrası 1.5 saniye içinde gerçek donanım verisi gelmezse kullanıcıya daireyi parmağıyla sürükleyebileceğini bildiren zarif uyarı (`hasSensorSignal` / `sensorSignalTimedOut`) eklendi.
- [x] **Sıkı Klavye Aktiflik Koruması & Yön Tuşu Kaydırma Engeli (`useKeyboardFallback.ts`):** Klavye girişleri yalnızca aktif `gameStatus === 'playing'` durumunda işlenerek `AttitudeGauge` önizlemesinin oyun öncesi kayması önlendi ve ok tuşlarıyla oynarken sayfa kaydırma olayları (`e.preventDefault()`) engellendi.
- [x] **WAI-ARIA Odak Döngüsü, Ses Düğümü Temizliği & Genişletilmiş Harita Testleri (`primitives.tsx`, `soundEngine.ts`, `mazeLevels.test.mjs`):** `Modal` ve `Drawer` içine `Tab` / `Shift+Tab` odak hapsi ve `Segmented` radyo gruplarına yön tuşu gezintisi eklendi; `SoundEngine` ortak `createVoice` yardımcısı üzerinden biten osilatör/kazanç düğümlerini (`onended`) anında serbest bırakır hale getirildi ve prosedürel harita doğrulama testleri `Bölüm 06..50` aralığına genişletildi.

## ✅ Faz 20: Tema Seçim Simetrisi, SSR Hidrasyon Güvenliği ve Çalışma Alanı Orkestrasyonu (Tamamlandı)

- [x] **Karanlık 3B Tahta Teması Seçim Simetrisi (`useGameStore.ts`):** Aydınlık moddayken (`colorScheme === 'light'`) `Zümrüt`, `Siberpunk` veya `Kızıl Kor` tahta temalarından biri seçildiğinde `colorScheme` değerinin otomatik olarak `'dark'` konumuna dönmesi sağlandı (`setBoardTheme` ve `cycleBoardTheme`).
- [x] **SSR Uyumlu Rekor Hidrasyonu (`useGameStore.ts`, `useAppPreferences.ts`):** `bestTimes` ve `ghostPaths` alanlarının ilk render'da `{}` olarak başlatılıp istemci `useEffect` fazında şema doğrulamalı (`hydrateLocalRecords`) yüklenmesiyle React 19 SSR hidrasyon uyumsuzluğu önlendi.
- [x] **Çalışma Alanı Geliştirme ve Statik Denetim Betikleri (`scripts/dev.mjs`, `scripts/lint.mjs`, `package.json`, `README.md`):** Kök dizine `npm run dev` ve `npm run start` paralel başlatıcıları (`@gyromaze/shared` otomatik derleme + temiz süreç kapatma) eklendi; etkileşimli hata veren `next lint` yerine tüm çalışma alanları için sıfır bağımlılıklı statik tip ve kural denetimi (`npm run lint`) yapılandırıldı.

## ✅ Faz 21: Oyuncu Yuvası İzolasyonu, Ağ Güvenliği, Dairesel Dokunmatik Gimbal ve Radyo Erişilebilirliği (Tamamlandı)

- [x] **1./2. Oyuncu Yuva İzolasyonu (`useGameStore.ts`, `useSocket.ts`, `DesktopHUD.tsx`):** Çok oyunculu modda yalnızca 2. oyuncu telefonla katıldığında 1. oyuncunun `isControllerPaired` bayrağının yanlışlıkla `true` sayılması ve masaüstü `WASD` kontrolünün kilitlenmesi düzeltildi; durum geçişleri (`resolvePairingGameStatus`) ve alt klavye ipuçları yuva bazında ayrıştırıldı.
- [x] **Ağ Geçidi Yetki Doğrulaması & Çevrimdışı Skor Koruması (`gyro.gateway.ts`, `useSocket.ts`, `room.service.test.mjs`):** `GAME_HAPTIC`, `GAME_STATE_CHANGE` ve `GAME_CHANGE_LEVEL` olayları yalnız doğrulanmış oda rolü (`host` / `controller`) için izinli kılındı; `GAME_STATE_CHANGE` sunucu yankısı kesilerek yalnız odadaki kontrolcülere yönlendirildi ve `pendingScoreSubmission` bağlantının aktif olmasını bekler hale getirildi.
- [x] **Dairesel Gimbal Sınırlandırması, P1/P2 Rozeti & Ortak WAI-ARIA Radyo Gezintisi (`controller/page.tsx`, `primitives.tsx`, `SettingsModal.tsx`, `DesktopHUD.tsx`):** Dokunmatik gimbal çapraz sürüklemeleri daire yarıçapı içine normalize edildi; mobil başlığa aktif `P1`/`P2` yuva rozeti ile eşleşme bekleme bildirimi eklendi; tüm radyo gruplarında ortak `handleRadioGroupKeyDown` (Ok / Home / End + gezen `tabIndex`) sağlandı.

## ✅ Faz 22: Çarpışmasız P2 Doğuşu, Özel Harita Fizik Anahtarları ve WebGL Kurtarma Kalkanı (Tamamlandı)

- [x] **Duvar/Delik Korumalı P2 Doğuşu (`mazeLevels.ts`, `MazeScene.tsx`, `mazeLevels.test.mjs`):** Çok oyunculu 2. bilyenin doğuş noktası sabit X sapması yerine Öklid duvar/delik ve tahta sınırı denetimi yapan `findSafeP2SpawnOffset` yardımcısına bağlandı; sıfırlama sırasında `transientGyro` / `transientGyroP2` mini-harita konumları da anında senkronize ediliyor.
- [x] **Özel Harita Fizik Yenilemesi & Aktif Portal Koruması (`mazeLevels.ts`, `MazeScene.tsx`):** Editörden art arda kaydedilen özel haritaların (`id === 99`) Rapier çarpıştırıcılarını temiz güncellemesi için `getLevelRevisionKey` uygulanıp portal sensörü `handleReachGoal` girişinde `gameStatus === 'playing'` şartıyla korundu.
- [x] **WebGL Bağlam Kaybı & Hata Sınırı Kurtarması (`MazeScene.tsx`):** `<Canvas>` etrafına `SceneErrorBoundary` ve `webglcontextlost`/`webglcontextrestored` dinleyicileri eklenerek grafik bağlamı koptuğunda tek tıkla sahneyi yeniden başlatan Türkçe kurtarma yüzeyi sağlandı.

## ✅ Faz 23: Kalıcı Özel Harita Hidrasyonu, Erişilebilir 8×8 Editör & Akıllı LAN Adaptör Seçimi (Tamamlandı)

- [x] **Ortak Özel Harita Şeması & SSR Uyumlu Kalıcılık (`mazeLevels.ts`, `useGameStore.ts`, `mazeLevels.test.mjs`):** Dışa/içe aktarılan JSON haritaları ve `localStorage` (`gyromaze_custom_level_v1`) kayıtları ortak `parseCustomMazeLevel` doğrulayıcısına taşındı; `customLevel` artık `hydrateLocalRecords` ile sayfayı yeniledikten sonra bile kaybolmuyor.
- [x] **Editör Izgara Senkronizasyonu & WAI-ARIA Klavye Gezintisi (`LevelEditorModal.tsx`):** Harita editörü açıldığında mevcut/içe aktarılmış özel haritayı (`worldToGrid` / `levelDefinitionToGrid`) başlık ve 8×8 ızgaraya geri yansıtır hale getirildi; 8×8 `role="grid"` içine ok tuşları ve `Home`/`End` odak gezintisi eklendi.
- [x] **Akıllı LAN IP Seçimi & Saniye Altı Skor Hassasiyeti (`room.service.ts`, `room.service.test.mjs`):** `selectPreferredLanIp` ile WSL/Hyper-V/Docker/VPN sanal adaptörleri ve `169.254.*` link-local adresler yerine fiziksel LAN IPv4 adresi önceliklendirildi; `submitScore` 1 saniyenin altındaki gerçek süreleri (`0.8 sn`) `Math.max(0.1, ...)` ile korur hale getirildi.

## ✅ Faz 24: Deterministik Engel Saati, Özel Harita Hayalet Temizliği ve Skor Güvenliği (Tamamlandı)

- [x] **Duraklatma Duyarlı Engel Saati & Tam Geometri Anahtarı (`MazeScene.tsx`, `mazeLevels.ts`, `mazeLevels.test.mjs`):** Lazer kapıları ve hareketli devriye engelleri küresel WebGL saati yerine yalnızca aktif oyun (`isInteractive`) sırasında ilerleyen `hazardElapsedRef` saatine bağlanıp her sıfırlamada başlangıç fazına alındı; `getLevelRevisionKey` tüm kristal, rampa, portal, lazer ve devriye engel koordinatlarını kapsayacak şekilde genişletildi.
- [x] **Özel Harita Rekor & Hayalet Geçersizleştirme (`useGameStore.ts`):** Editörden yeni veya değiştirilmiş bir özel harita (`id: 99`) yüklendiğinde eski haritaya ait bayat `bestTimes[99]` rekoru ve duvarlardan geçen eski `ghostPaths[99]` hayalet kaydı hem bellekten hem `localStorage` üzerinden temizlenir hale getirildi.
- [x] **Mobil Yuva Eşitleme & Jiroskop Delta Sıfırlaması (`controller/page.tsx`, `useSocket.ts`):** URL `?slot=2` sorgu parametresi canlı olarak senkronize edildi, dokunmatik gimbal yüzeyine WAI-ARIA etiketi eklendi ve yuva/oda değişimlerinde ilk sensör paketinin delta filtresine takılmaması için `lastSentBetaRef`/`lastSentGammaRef` tamponları sıfırlandı.
- [x] **Ev Sahibi Yetkili Skor Gönderimi (`gyro.gateway.ts`, `room.service.ts`, `useSocket.ts`, `room.service.test.mjs`):** `LEADERBOARD_SUBMIT` olayı yalnızca doğrulanmış oda sahibi (`host`) soketlerine izin verecek ve `> 3600 sn` uç değerleri reddedecek şekilde sıkılaştırıldı; istemci skor gönderimi aktif `roomId` hazır olana dek bekletildi.

## ✅ Faz 25: İlk Örnek Sıfır-Gecikmeli Kalibrasyon, Proxy Yaşam Döngüsü ve Oda Bellek Temizliği (Tamamlandı)

- [x] **Yarışsız İlk Donanım Sensörü Kalibrasyonu (`useDeviceOrientation.ts`, `controller/page.tsx`):** İzin onayından sonraki `120 ms` zamanlayıcı yarışı yerine `pendingAutoCalibrateRef` ile ilk gerçek donanım `deviceorientation` olayı yakalandığı anda tutuş açısı otomatik sıfır referansı olarak kaydedilir hale getirildi; `wrapDelta` çift modül sarımı ile sertleştirildi.
- [x] **WebSocket/HTTP Proxy Yaşam Döngüsü (`apps/client/server.mjs`):** İstemci veya arka uç bağlantıyı erken kestiğinde yarı açık soket sızıntısını önlemek için `close`/`aborted` temizlik dinleyicileri eklendi, `/socket.io` yol eşleşmesi sınırlandırıldı ve `SIGINT`/`SIGTERM` temiz sunucu kapanışı sağlandı.
- [x] **Eylem Odaklı Modal Koruması & Oyuncu Adı Kalıcılığı (`primitives.tsx`, `DesktopHUD.tsx`):** Zafer ve süre doldu (`hideClose`) modallarında yanlışlıkla dış boşluğa tıklayarak turu sıfırlama riski kapatıldı; skor gönderim alanı nötr `'Oyuncu'` varsayılanı ve kalıcı `localStorage` (`gyromaze_player_name_v1`) desteğiyle güncellendi.
- [x] **Zaman Aşımlı Oda Temizliği (`room.service.ts`, `room.service.test.mjs`):** Uzun süre açık kalan sunucularda terk edilmiş odaların bellek birikmesini önlemek için `pruneExpiredRooms` eklendi ve birim testiyle doğrulandı.

## ✅ Faz 26: Akıllı Düzenleyici Engel Yerleşimi, Bildirim Kimlik Güvenliği ve IPv6 Loopback QR Desteği (Tamamlandı)

- [x] **Akıllı Düzenleyici Boost Yönü ve Çarpışmasız Hareketli Engel (`mazeLevels.ts`, `LevelEditorModal.tsx`, `mazeLevels.test.mjs`):** Özel harita üreticisi `buildLevelDefinition()` içindeki sabit `[0, 1]` boost yönü ve sabit `0.9` salınım genliği yerine `computeEditorBoostDirection` ve `computeEditorMovingConfig` eklendi; alt sınırdaki veya duvar önündeki hızlandırıcılar açık koridora/hedefe yönelir hale getirildi, hareketli engeller açık eksene göre `0.72` (dar alanda `0.34`) güvenli genlik seçer oldu ve Node birim testleriyle doğrulandı.
- [x] **Çakışmasız HUD Bildirim Kimliği ve Tur Sıfırlama Yardımcısı (`useGameStore.ts`):** Aynı milisaniye içinde peş peşe tetiklenen bildirimlerin aynı `Date.now()` kimliği yüzünden birbirinin `2800 ms` zamanlayıcısını iptal etmesini önlemek için monotonik `nextHudNotificationId` sayacına geçildi ve tekrarlayan 7 tur sıfırlama bloğu `resetRunFields` yardımcısında birleştirildi.
- [x] **IPv6 Loopback LAN QR Algılama (`DesktopHUD.tsx`):** Tarayıcı `::1` veya `[::1]` yerel adresi üzerinden açıldığında da telefonla taranabilir yerel ağ QR bağlantısı oluşturulması için `isLocalLoopback` denetimi genişletildi.

## ✅ Faz 27: Jiroskop NaN Koruması, Çok Oyunculu Doğma Paritesi ve Giriş Dayanıklılığı (Tamamlandı)

- [x] **Jiroskop `NaN`/Sınır Koruması (`gyro.gateway.ts`, `useDeviceOrientation.ts`, `room.service.test.mjs`):** WebSocket ağ geçidinde `NaN`/`Infinity` veya sayı dışı `beta`/`gamma` değerlerinin 3B Rapier fizik motorunu bozmasını önlemek için sonluluk kontrolü ve `[-45, 45]` derece sınırlaması eklendi; cihaz tarafında da `Number.isFinite` koruması sağlandı ve ağ geçidi birim testiyle doğrulandı.
- [x] **Çok Oyunculu Yeniden Doğma ve Hayalet Örnekleme Paritesi (`MazeScene.tsx`):** `resetSingleBall` içine yuva bazlı rampa/portal/lazer/hareketli engel bekleme sürelerinin sıfırlanması taşınarak tek oyunculu ve 2 oyunculu yeniden doğma davranışları eşitlendi; 10 Hz hayalet kaydında kare hızına bağlı kümülatif zaman kayması giderildi.
- [x] **Klavye Tekrar Koruması, 6 Haneli Kod Doğrulama ve IPv6 Soket Yönlendirme (`DesktopHUD.tsx`, `controller/page.tsx`, `useSocket.ts`):** `R`/`C`/`M`/`L` kısayollarında tuş basılı tutma (`e.repeat`) ve `contentEditable` alan çakışmaları engellendi; mobil kontrolcü formunda tam 6 karakterlik oda kodu zorunluluğu sağlandı ve `resolveSocketServerUrl` IPv6 loopback adresleriyle uyumlu hale getirildi.

## ✅ Faz 28: Duvar/Boşluk Korumalı Prosedürel Boost Yönü ve Radar Çerçeve Hassasiyeti (Tamamlandı)

- [x] **Duvar ve Boşluktan Kaçınan Prosedürel Boost Rampaları (`mazeLevels.ts`, `mazeLevels.test.mjs`):** `generateProceduralLevel` içindeki kör yön seçimi yerine `hWalls`/`vWalls` kenar duvarlarını ve komşu tuzak deliklerini denetleyerek açık koridora/hedefe yönelen `pickBestOpenDirection` ortak yardımcısı devreye alındı (`computeEditorBoostDirection` ile paylaşıldı) ve `06..50` arası tüm prosedürel bölümlerde doğrulandı.
- [x] **2B Radar Nokta Konumlandırma Hassasiyeti (`AttitudeGauge.tsx`):** 1. ve 2. oyuncu bilyelerinin tekrarlanan piksel hesabı `updateRadarDot` yardımcısında birleştirildi ve 42 px iç alan sınırlarında kenar taşması önlendi.

## ✅ Faz 29: Çapraz Platform Üretim Başlangıcı, Kesintisiz Proxy Kapanışı ve Web Audio Koruması (Tamamlandı)

- [x] **Windows Uyumlu Üretim Başlangıcı ve Temiz Proxy Kapanışı (`apps/client/package.json`, `apps/client/server.mjs`):** Yalnızca POSIX kabuklarında çalışan `NODE_ENV=production node server.mjs` komutu platform bağımsız `node server.mjs --prod` bayrağına geçirildi; kullanımdan kalkan `req.on('aborted')` yerine `req.on('error')` dinleyicisi eklendi ve açık WebSocket/keep-alive soketlerinin `SIGINT`/`SIGTERM` kapanışını askıda bırakmasını önlemek için `server.closeAllConnections()` ile zaman aşımı koruması eklendi.
- [x] **Kısıtlı Tarayıcı Web Audio Koruması (`soundEngine.ts`):** Ses bağlamı oluşturulmasını yasaklayan tarayıcı veya gizlilik politikalarında `new AudioCtx()` çağrısının fizik olaylarını kesintiye uğratmaması için `try/catch` koruması eklendi.

## ✅ Faz 30: Kontrolcü Kopması Sonrası Duraklatma Kurtarma Akışı (Tamamlandı)

- [x] **Kilitlenen `'paused'` Durumundan Çıkış & Kurtarma Çubuğu (`DesktopHUD.tsx`):** Telefon bağlantısı koptuğunda oyunun `'paused'` durumuna geçip `Sahneye geç` düğmesiyle bile tekrar `'playing'` durumuna dönememesi sorunu giderildi (`handleClosePairingModal` içinde `'waiting'` ile birlikte `'paused'` durumu da sahneye dönünce devam edecek şekilde güncellendi); ayrıca üst sahnede tek tıkla klavyeyle sürdürme (`Devam et`) veya QR ile yeniden bağlama (`Bağla`) seçenekleri sunan duraklatma kurtarma çubuğu eklendi.

## ✅ Faz 31: Kontrolcü Eğim Sıfırlama, Editör Lazer Ekseni ve Modal Kısayol Koruması (Tamamlandı)

- [x] **Kontrolcü Oda Düzenleyici & Bağlantı Sağlamlığı (`controller/page.tsx`):** Oda kodu düzenleyici açılırken aktif sensör/dokunmatik eğim açısının `(0, 0)` noktasına sıfırlanması sağlandı (masaüstünde takılı eğimle yuvarlanma önlendi); `Yeni kod` düğmesinin mevcut oda kodunu girdi alanıyla eşitlemesi ve WebSocket bağlantısı yokken aynı odaya yeniden bağlanma denemesinin sessizce kapanmak yerine uyarı göstermesi sağlandı.
- [x] **Editör Lazer Kapısı Koridor Yönelimi (`mazeLevels.ts`, `LevelEditorModal.tsx`, `mazeLevels.test.mjs`):** `detectCorridorOrientation` ortak yardımcısı üzerinden `computeEditorLaserAxis` eklendi; harita editöründe yerleştirilen lazer kapılarının her zaman `'x'` ekseninde kalması yerine komşu duvarlara göre koridoru dik kesecek (`'x'` veya `'z'`) yönde üretilmesi sağlandı.
- [x] **Oyun Sonu Modalında Kısayol Koruması (`DesktopHUD.tsx`):** Zafer (`'won'`) ve süre doldu (`'lost'`) modalları açıkken arka planda `R`/`C`/`M`/`L` kısayollarının istemeden sahneyi sıfırlaması veya kamera/tema değiştirmesi engellendi.

## ✅ Faz 32: WebSocket Yük Güvenliği, Tünel Yenileme ve Klavye/Proxy Sağlamlığı (Tamamlandı)

- [x] **Metin Dışı Oda Kodu Yük Koruması (`room.service.ts`, `gyro.gateway.ts`, `room.service.test.mjs`):** `RoomService.joinRoom` ve `GyroGateway.handleJoinRoom` içinde metin olmayan `roomId` yükleri için tip denetimi ve `INVALID_PAYLOAD` yanıtı eklenerek `.trim()` kaynaklı çalışma zamanı istisnası engellendi.
- [x] **Güncel Tünel ve LAN Adresi Eşitleme (`useSocket.ts`):** `ROOM_CREATED` ve `ROOM_PAIRED` olaylarında `lanIp` ve `tunnelUrl` değerleri eski değerde takılı kalmayacak biçimde güncellenerek kapanan tünel sonrası QR kodunun geçersiz HTTPS adresinde kalması önlendi.
- [x] **Klavye Yedek Kontrolü & Proxy Akış Güvenliği (`useKeyboardFallback.ts`, `apps/client/server.mjs`):** `Ctrl`/`Meta`/`Alt` kısayol kombinasyonları ile `contentEditable` alanları filtrelendi, sekme gizlendiğinde (`visibilitychange`) takılı yön tuşlarının sıfırlanması sağlandı ve `/socket.io` HTTP proxy yanıt akışına `proxyRes.on('error')` koruması eklendi.

### Faz 33: Haptik Yardımcı Birleştirmesi ve Gateway Yük Doğrulaması (Tamamlandı)
- [x] **Merkezi Titreşim Yardımcısı (`useSocket.ts`):** `ROOM_PAIRED` ve `GAME_HAPTIC` olaylarındaki yinelenen `navigator.vibrate` kontrolleri, `HAPTIC_PATTERNS` haritası ve `try/catch` korumalı `triggerDeviceVibrate` yardımcısında birleştirildi (`typeof navigator.vibrate === 'function'` kontrolü eklendi).
- [x] **Ağ Geçidi İleti Doğrulaması (`gyro.gateway.ts`):** `handleGameHaptic`, `handleGameStateChange` ve `handleChangeLevel` işleyicilerinde metin dışı `roomId` değerleri (`matchesOptionalRoomId`), geçersiz `HapticType` türleri ve geçersiz `GameStatus` değerleri ek yayın yapılmadan güvenli şekilde elendi (`room.service.test.mjs` birim testiyle doğrulandı).

### Faz 34: Arka Plan Sekme Zamanlayıcısı, Pano Zaman Aşımı ve Oda Formu Doğrulama İzolasyonu (Tamamlandı)
- [x] **Sekme Görünürlüğüne Duyarlı Oyun Saati (`DesktopHUD.tsx`):** `visibilitychange` olayına bağlı `isPageHidden` durumu eklenerek tarayıcı sekmesi gizlendiğinde 3B fizikle eşzamanlı olarak `elapsedSeconds` ve *Süreye Karşı* sayacı donduruldu; sekmeye dönüldüğünde duvar saati sıçraması önlendi.
- [x] **Pano Kopyalama Zamanlayıcı Temizliği (`DesktopHUD.tsx`, `LevelEditorModal.tsx`):** Ardışık kopyalama tıklamalarında `"Kopyalandı"` durumunun erken sıfırlanmasını ve bileşen kapanışında sarkan zamanlayıcıları önlemek için `copiedLinkTimerRef`, `copiedRoomCodeTimerRef` ve `copiedJsonTimerRef` korumaları eklendi.
- [x] **Oda Kodu Form Hatası İzolasyonu (`controller/page.tsx`):** Oda kodu biçim doğrulama uyarıları (`roomFormError`) küresel soket `errorMessage` durumundan ayrılarak düzenleyici açılıp kapatıldığında veya yeni kod yazıldığında takılı hata bildirimi kalması engellendi.








### Faz 35: Soket Kopma Senkronizasyonu, Devralınan Sekme Koruması ve Tünel Zamanlayıcı Temizliği (Tamamlandı)
- [x] **Masaüstü Soket Kopma Temizliği (`useSocket.ts`, `DesktopHUD.tsx`):** Masaüstü (host) WebSocket bağlantısı kesildiğinde `isControllerPaired`, `isSecondControllerPaired`, geçici jiroskop eksenleri ve `latencyMs` sıfırlandı; `isAnyControllerPaired` bayrağı `isSocketConnected` ile bağlanarak çevrimdışı durumda sahte yeşil/gecikme göstergesi görünmesi önlendi.
- [x] **Devralınan Oturum Re-Hijack Koruması (`useSocket.ts`):** `SESSION_REPLACED` hatası alan eski kontrolcü sekmesinin arka planda otomatik Socket.IO yeniden bağlanmalarında aktif oyuncunun yuvasını geri devralması `sessionReplacedRef` bayrağıyla engellendi.
- [x] **Tünel Denetim Zamanlayıcı Temizliği (`room.service.ts`):** `detectActiveTunnelUrl` içinde `clearTimeout(timeout)` çağrısı `finally` bloğuna alınarak başarısız ngrok yerel sorgularında zamanlayıcı sızıntısı önlendi.

### Faz 36: Web Audio Askıda Osilatör Koruması ve Diyalog Odak Güvencesi (Tamamlandı)
- [x] **Web Audio Askıda Bağlam Koruması (`soundEngine.ts`):** Tarayıcı kullanıcı etkileşimi olmadan açılan `suspended` durumundaki `AudioContext` üzerinde osilatör/kazanç düğümü birikimini önlemek için `getContext` yalnız `running` durumunda düğüm oluşturacak şekilde güncellendi, `setVolume` için `Number.isFinite` kontrolü ve ilk `pointerdown`/`keydown` etkileşiminde otomatik ses kilidi açma (`attachGestureUnlock`) eklendi.
- [x] **Diyalog Odak Geri Yükleme Koruması (`primitives.tsx`):** `useDialogBehavior` kapanış temizliğinde yalnızca DOM'a hâlâ bağlı (`isConnected`) önceki odak öğelerine dönüş yapılması sağlandı.

### Faz 37: Motor Seviyesinde Sessiz Mod Senkronizasyonu ve Kontrolcü Sıfırlama Koruması (Tamamlandı)
- [x] **Sessiz Mod Motor Senkronizasyonu (`useAppPreferences.ts`):** `soundEngine.setVolume` çağrısı `isSoundMuted` durumuna bağlanarak (`isSoundMuted ? 0 : soundVolume`) sessiz mod aktifken Web Audio bağlamı başlatılması ve istenmeyen ses üretimi motor seviyesinde engellendi.
- [x] **Kontrolcü Top Sıfırlama Durum Koruması (`controller/page.tsx`):** Alt eylem çubuğundaki *Topu sıfırla* düğmesi, oda eşleşmesi yokken veya soket kopukken (`!isControllerPaired || !isSocketConnected`) devre dışı bırakılarak boşa basım yanılsaması önlendi.

### Faz 38: Özel Harita Sınır/Rampa Doğrulaması ve Ortak Lazer Faz Hesabı (Tamamlandı)
- [x] **Özel Harita Şema Sertleştirmesi (`mazeLevels.ts`, `mazeLevels.test.mjs`):** `parseCustomMazeLevel` içinde tahta dışı `startPosition`/`goalPosition` koordinatları güvenli iç sınıra çekildi ve sıfır uzunluklu hızlandırma vektörleri elenerek diğer yön vektörleri birim vektöre normalize edildi (`mazeLevels.test.mjs` ile doğrulandı).
- [x] **Ortak Lazer Faz Yardımcısı & Bölüm İleti Koruması (`MazeScene.tsx`, `useSocket.ts`):** Fizik çarpışma kontrolü ile görsel ışın görünürlüğündeki yinelenen lazer periyot hesabı `isLaserGateActive` yardımcısında birleştirildi (negatif `phaseOffset` modülo hatası giderildi); `GAME_CHANGE_LEVEL` istemci dinleyicisinde tam sayı ve pozitif bölüm sınırı kontrolü eklendi.

### Faz 39: Jiroskop Idle Trafiği, Klavye Takılma Koruması ve Ev Sahibi Soket Güvenliği (Tamamlandı)
- [x] **Sıfır Geçişli Jiroskop Filtresi (`useSocket.ts`):** `emitGyroUpdate` içinde `(0, 0)` değerinin her sensör karesinde gecikme ve delta filtresini bypass ederek 60Hz ağ trafiği üretmesi engellendi; yalnızca sıfır dışı açıdan `(0, 0)` konumuna geçişte (`isZeroTransition`) anında yayın yapılıp sonraki boş `(0, 0)` kareleri elendi.
- [x] **Klavye Eksen Temizliği & 2P Sıfırlama (`useKeyboardFallback.ts`, `useGameStore.ts`):** `useKeyboardFallback` `useEffect` temizleme adımında `resetKeyboardAxes()` çağrılarak kontrolcü eşleşmesi/çok oyunculu durum değişimlerinde veya ayrılmada basılı tuş eğimlerinin takılı kalması önlendi; `useGameStore.ts` içinde ortak `zeroTransientGyro` yardımcısı çıkarılıp `toggleMultiplayer()` sırasında 2. oyuncu geçici eğimi sıfırlandı.
- [x] **Ev Sahibi Soket Öz-Katılım Koruması (`room.service.ts`, `room.service.test.mjs`):** `RoomService.joinRoom` metodunda `role === 'host'` kimliğine sahip bir soketin kendi veya başka bir odaya kontrolcü olarak katılıp odayı silmesi/bozması `INVALID_PAYLOAD` hatasıyla engellendi ve sunucu birim testi ile doğrulandı.

### Faz 40: Alt-Saniye Skor Tutarsızlığı ve Arka Plan Sekme Fizik Eşitlemesi (Tamamlandı)
- [x] **Minimum Skor ve Rekor Sınırı (`useGameStore.ts`, `DesktopHUD.tsx`):** Çok hızlı bölüm tamamlamalarında `elapsedSeconds === 0` nedeniyle yerel rekorun `0.0` yazılması ve sunucunun `timeSeconds <= 0` kontrolü yüzünden skor gönderimini sessizce düşürmesi, `Math.max(0.1, ...)` alt sınırı ile önlendi.
- [x] **3B Sahne Sekme Gizliliği Koruması (`MazeScene.tsx`):** `useFrame` içindeki `isInteractive` bayrağına `document.hidden` denetimi eklenerek tarayıcı sekmesi arka plandayken fizik, lazer kapıları ve hayalet zamanlayıcısının HUD saatiyle eşzamanlı duraklaması sağlandı.

### Faz 41: Çoklu Dokunma Gimbal Koruması, Yeniden Oda Açılışı ve Durum Doğrulaması (Tamamlandı)
- [x] **Çoklu Dokunma Gimbal İzolasyonu (`controller/page.tsx`):** Dokunmatik gimbal üzerinde `activePointerIdRef` takibi eklenerek aktif sürükleme sırasında ekrana değip çekilen ikinci bir parmağın ana kontrolü kesip eğimi `(0, 0)` konumuna düşürmesi engellendi.
- [x] **Aynı Sokette Oda Yenileme Bildirimi (`gyro.gateway.ts`, `room.service.test.mjs`):** `handleCreateRoom` içinde aynı host soketinin mevcut odası varken yeni oda oluşturması durumunda önceki odadan ayrılıp bağlı kontrolcülere `ROOM_HOST_DISCONNECTED` olayı yayınlaması sağlandı ve birim testiyle doğrulandı.
- [x] **İstemci Oyun Durumu Şema Koruması (`useSocket.ts`):** `GAME_STATE_CHANGE` dinleyicisine `VALID_GAME_STATUSES` kontrolü eklenerek bozuk veya bilinmeyen durum paketlerinin istemci durumunu bozması engellendi.

### Faz 42: Editör Uç Nokta Takası ve Özel Harita Öğe Sınır Doğrulaması (Tamamlandı)
- [x] **Editör Başlangıç/Hedef Silme Koruması (`LevelEditorModal.tsx`):** 8×8 editörde `Başlangıç` aracını doğrudan `Hedef` hücresine (veya tersini) yerleştirirken diğer zorunlu noktanın ızgaradan silinmesi yerine iki uç noktanın güvenli şekilde yer değiştirmesi sağlandı.
- [x] **Tam Özel Harita Öğe Sınırlandırması (`mazeLevels.ts`, `mazeLevels.test.mjs`):** `parseCustomMazeLevel` içinde `voidHoles`, `crystals`, `laserGates`, `boostPads`, `teleporters` ve `movingObstacles` konum, boyut ve zamanlama değerleri aktif tahta sınırlarına kırpılarak dışa aktarılan/bozuk JSON verilerinin bilyeyi tahta dışına ışınlaması engellendi.

### Faz 43: Mobil Gimbal Odak Kaybı Kurtarma, Oda Geçişi ve Arka Plan Sensör Koruması (Tamamlandı)
- [x] **Dokunmatik Gimbal Odak ve Yakalama Kurtarma (`controller/page.tsx`):** Sanal gimbal sürüklenirken tarayıcı sekmesi gizlendiğinde, pencere odağı kaybolduğunda veya işaretçi yakalaması (`onLostPointerCapture`) düştüğünde aktif sürükleme kilidinin ve eğim açısının `(0, 0)` noktasına sıfırlanması sağlandı.
- [x] **Kontrolcü Oda/Yuva Geçişinde Bayat Eşleşme Temizliği (`useSocket.ts`):** Mobil kontrolcü yeni oda koduna veya farklı oyuncu yuvasına geçerken `setControllerPaired(false)` ve gönderim tamponu sıfırlaması uygulanarak yanıt gelene kadar eski odaya ait bayat `Bağlı` bilgisinin görünmesi önlendi.
- [x] **Arka Plan Sensör Koruması ve Zafer Süresi Tutarsızlığı (`MazeScene.tsx`, `DesktopHUD.tsx`):** `MazeScene` içindeki delik ve hedef sensör tetikleyicileri `document.hidden` durumunda engellenerek arka planda istenmeyen çarpışma tetiklenmesi önlendi; zafer modalındaki süre gösterimi `Math.max(0.1, elapsedSeconds)` alt sınırıyla rekor kaydıyla eşitlendi.

### Faz 44: Özel Harita Duvar/Yükseklik Normalizasyonu ve Editör Çakışma Koruması (Tamamlandı)
- [x] **Özel Harita Başlangıç/Hedef Y Eksen ve Duvar Sınır Normalizasyonu (`mazeLevels.ts`, `mazeLevels.test.mjs`):** `parseCustomMazeLevel` içinde `startPosition[1]` (`0.34`), `goalPosition[1]` (`0.35`) ve `innerWalls` konum/boyutları aktif tahta ve zemin yüksekliğine göre normalize edilerek dışa aktarılan veya elle düzenlenen JSON haritalarında havada kalan/zemin altına düşen hedef sensörü ve taşan duvarlar önlendi.
- [x] **Editör Yüklemede Başlangıç/Hedef Hücre Çakışma Koruması (`LevelEditorModal.tsx`):** `levelDefinitionToGrid` içinde aynı 8×8 ızgara hücresine denk gelen `startPosition` ve `goalPosition` koordinatlarının `'goal'` işaretini silmesi önlenerek komşu boş hücreye güvenli yerleştirme eklendi.

### Faz 45: Kontrolcü Kod Yapıştırma Desteği ve Oda Oluşturma Geçiş Bildirimi (Tamamlandı)
- [x] **Oda Kodu Yapıştırma ve URL Normalizasyonu (`controller/page.tsx`):** Kontrolcü oda kodu girişindeki `maxLength={6}` erken DOM kesmesi kaldırılarak boşluk veya ayırıcı içeren yapıştırılan kodların (`" 84K-9X2 "`) temizlendikten sonra 6 karaktere kırpılması ve `?room=` sorgu parametresinin de aynı kuralla normalize edilmesi sağlandı.
- [x] **Kontrolcüden Host'a Geçişte Önceki Odaya Bildirim (`gyro.gateway.ts`, `room.service.test.mjs`):** Önceden bir odaya kontrolcü olarak bağlı soket `ROOM_CREATE` çağırdığında eski odadan ayrılıp önceki ev sahibine `ROOM_CONTROLLER_DISCONNECTED` olayı göndermesi sağlandı ve sunucu birim testi ile doğrulandı.

### Faz 46: Özel Harita Revizyon Anahtarı ve Devriye Engel Çarpışma Kurtarma (Tamamlandı)
- [x] **Özel Harita `boardSize` Revizyon Takibi (`mazeLevels.ts`, `mazeLevels.test.mjs`):** `getLevelRevisionKey` çıktısına özel haritalar için (`id === 99`) `boardSize` alanı eklenerek farklı tahta boyutlu harita içe aktarımlarında yerel rekor/hayalet izi temizliği ile sahne sıfırlamasının tetiklenmesi sağlandı ve birim testiyle doğrulandı.
- [x] **Hareketli Engel Merkez Çakışma Düzeltmesi (`MazeScene.tsx`):** Bilyenin devriye engelinin tam merkeziyle çakıştığı durumda sıfır vektör (`nx = 0, nz = 0`) yüzünden hızının sıfırlanıp engelin içinde sıkışmasını önleyen dikey geri sekme normali ve aynı karede çift çarpışma tetiklemesini önleyen erken çıkış (`break`) eklendi.

### Faz 47: Sunucu Yuva Yetki Sabitleme, Bölüm İsteği Temizliği ve Sonlu Seviye Koruması (Tamamlandı)
- [x] **Yetkili Yuva Sabitleme & Oda Adapter Temizliği (`gyro.gateway.ts`, `room.service.test.mjs`):** `handleGyroUpdate` içinde sunucu üyeliğinden türetilen yuva (`membership.playerSlot === 2 ? 2 : 1`) esas alınarak yuva belirtmeden katılan 1. kontrolcünün `payload.data.playerSlot` ile 2. oyuncuyu taklit etmesi önlendi; `handleChangeLevel` yükü yalnız doğrulanmış `roomId`, `direction` ve `[1, 9999]` tam sayı `level` alanlarıyla sınırlandı ve masaüstü ayrılış/yenileme sonrasında `socketsLeave` ile Socket.IO oda kalıntıları temizlendi.
- [x] **Sonlu Bölüm Numarası Koruması (`mazeLevels.ts`, `mazeLevels.test.mjs`):** `getMazeLevel` içinde `NaN` / `Infinity` girişlerinin prosedürel üretece geçip bozuk başlık veya önbellek kaydı oluşturmasını önleyen `Number.isFinite` koruması eklendi ve birim testiyle doğrulandı.

### Faz 48: Çakışan Kuantum Portal Çifti Koruması (Tamamlandı)
- [x] **Kendi Kendine Işınlanma Portal Döngüsü Koruması (`mazeLevels.ts`, `mazeLevels.test.mjs`):** `parseCustomMazeLevel` içinde tahta sınırlarına kırpıldıktan sonra giriş ve çıkışı üst üste veya birbirinin tetikleme yarıçapına (`< 0.75` birim) düşen dejenere portal çiftleri elenerek içe aktarılan özel haritalarda bilyenin sonsuz ışınlanma döngüsüne girmesi önlendi ve birim testiyle doğrulandı.

### Faz 49: Özel Harita Editörü `boardSize` Ölçek Eşlemesi ve Çakışma İyileştirmesi (Tamamlandı)
- [x] **Orantılı 8x8 Izgara Dönüşümü (`mazeLevels.ts`, `LevelEditorModal.tsx`, `mazeLevels.test.mjs`):** `worldToEditorGridCell` ve `editorGridCellToWorld` yardımcıları `mazeLevels.ts` içinde merkezileştirildi; `levelDefinitionToGrid` artık sabit 12x12 adımı yerine haritanın gerçek `boardSize` (`8..18`) ölçeğini kullanarak büyük/küçük içe aktarılan haritalarda öğelerin kenarlara yığılmasını veya merkeze sıkışmasını önlüyor ve başlangıç/hedef çakışmalarında boş hücrelere öncelik veriyor.

### Faz 50: Harita Editöründe Kuantum Portal Aracı ve Tahta Boyutu Seçici (Tamamlandı)
- [x] **Çift Yönlü Portal Yerleştirme & Portal-Farkındalıklı BFS (`mazeLevels.ts`, `LevelEditorModal.tsx`, `mazeLevels.test.mjs`):** Editör araç paletine `portal` (◎) aracı eklendi; `validateEditorGrid` açıkta kalan tekil portalları uyarıyor ve duvarla ayrılmış bölümleri portal çifti üzerinden geçen BFS ile çözülebilir doğruluyor.
- [x] **Ölçekli Tahta Boyutu Seçici (`12×12 / 14×14 / 16×16`):** `buildLevelFromEditorGrid` ve `levelDefinitionToEditorGrid` ile tahta boyutu seçimi duvar/engel ölçeklerini ve kuantum portalları çift yönlü olarak koruyacak şekilde merkezileştirildi.

### Faz 51: Kalıcı Liderlik Tablosu Altyapısı (Tamamlandı)
- [x] **Atomik Disk JSON Kalıcılığı (`room.service.ts`, `room.service.test.mjs`, `.gitignore`):** `RoomService` liderlik tablosunu geçici dosya + `rename` atomik yazım kuyruğuyla `.data/leaderboard.json` (veya `GYROMAZE_LEADERBOARD_FILE`) üzerinde kalıcı saklıyor, sunucu başlangıcında doğrulayarak geri yüklüyor ve bozuk JSON durumunda başlangıç kayıtlarına güvenle düşüyor.

### Faz 52: Mobil Kumanda İçin PWA Manifest ve Uygulama İkonu (Tamamlandı)
- [x] **Standalone PWA Desteği (`manifest.ts`, `icon.svg`, `layout.tsx`):** Next.js 15 App Router için `manifest.ts`, vektörel `icon.svg` ve `appleWebApp` tam ekran meta ayarları eklenerek `/controller` mobil kumandasının ana ekrana kurulup tarayıcı çubuğu olmadan açılması sağlandı.

### Faz 53: Canlı NestJS WebSocket Entegrasyon Testi ve Editör Portal Eşleşme Göstergesi (Tamamlandı)
- [x] **Gerçek TCP/WebSocket E2E Süiti (`socket.e2e.test.mjs`, `apps/server/package.json`):** `NestFactory.create(AppModule)` ve `socket.io-client` ile canlı port üzerinden oda oluşturma, 1P/2P eşleşme, yuva yetkisi sabitleme, hedefli haptik, `ROOM_PING` RTT, `SESSION_REPLACED` ve `ROOM_HOST_DISCONNECTED` akışları uçtan uca doğrulandı.
- [x] **Editör Portal Çift Numaralandırma (`LevelEditorModal.tsx`):** 8×8 ızgara hücrelerinde `◎1`, `◎2` çift indeksleri ve eşleştirme durumu uyarısı gösterilerek çoklu portal tasarımı netleştirildi.

### Faz 54: Paylaşılabilir Özel Harita Bağlantısı (`?map=`) ve Panodan Link İçe Aktarımı (Tamamlandı)
- [x] **UTF-8 Base64url Harita Kodlayıcı/Çözücü (`mazeLevels.ts`, `mazeLevels.test.mjs`):** `encodeCustomMazeLevelForUrl` ve `decodeCustomMazeLevelFromUrl` yardımcı fonksiyonlarıyla Türkçe başlıklı ve portallı özel haritaların `parseCustomMazeLevel` doğrulamasından geçerek tek bir `?map=` URL sorgu parametresinde güvenle taşınması sağlandı; bozuk/taşan veriler birim testlerle güvence altına alındı.
- [x] **Tek Tıkla Paylaşım ve Otomatik Yükleme (`LevelEditorModal.tsx`, `useAppPreferences.ts`):** Harita Editörü alt çubuğuna birleşik pano yardımcısını kullanan `Bağlantı kopyala` düğmesi ve `Panodan yükle` için `?map=` URL algılama eklendi; ana sayfa (`/?map=...`) açılışta haritayı yükleyip adres çubuğunu `history.replaceState` ile temizleyerek bildirim gösterir.

### Faz 55: Sunucu Sağlık Uç Noktası (`/health`, `/api/health`) ve İstemci Proxy Testleri (Tamamlandı)
- [x] **NestJS Sağlık ve Oda Telemetri Denetleyicisi (`health.controller.ts`, `room.service.ts`, `app.module.ts`, `socket.e2e.test.mjs`):** `RoomService.getStats()` ile yalnızca anonim sayaçları (`activeRooms`, `connectedControllers`, `leaderboardEntries`) döndüren `GET /health` ve `GET /api/health` uç noktaları eklendi; canlı NestJS E2E test süitiyle doğrulandı.
- [x] **Modüler HTTP/WebSocket Proxy Yardımcıları ve Süiti (`proxy-helpers.mjs`, `server.mjs`, `proxy.test.mjs`):** Next.js özel sunucusundaki yinelenen yol normalizasyonu ve HTTP/WebSocket Upgrade iletimi test edilebilir `proxy-helpers.mjs` modülüne ayrıldı, `/api/health` proxy yönlendirmesi eklendi ve gerçek TCP/HTTP akışı üzerinden `502` ile `101 Switching Protocols` testleri yazıldı.

### Faz 56: Kapsamlı Klavye Kısayolları Modalı, Kontrolcü Rehberi ve Kısayol Ayrıştırıcı (Tamamlandı)
- [x] **Klavye Kısayolları ve Kontrol Rehberi Modalı (`HelpShortcutsModal.tsx`, `useGameStore.ts`, `DesktopHUD.tsx`):** Masaüstü HUD üst çubuğuna `HelpCircle` yardım düğmesi ve oyun esnasında `H` veya `?` tuşlarıyla her an açılıp kapanabilen, bilye hareketi (`WASD`/yön/Space), kamera (`C`), tema (`L`), ses (`M`), editör (`E`), liderlik tablosu (`K`), eşleştirme (`P`) ve 1..5 bölüm geçişlerini açıklayan modal eklendi.
- [x] **Yalıtılmış Kısayol Çözümleyici ve Birim Testleri (`keyboardShortcuts.ts`, `shortcuts.test.mjs`):** Girdi odakları (`input`, `textarea`), değiştirici tuşlar (`ctrl`, `alt`, `meta`), tekrar engeli ve açık modal çakışmalarını yöneten saf `resolveKeyboardShortcut` motoru ve 5 yeni birim test ile klavye kontrolleri güvence altına alındı.

### Faz 57: Mobil Kontrolcü Gecikme Göstergesi, Titreşim Geçişi ve Hızlı Oda Geçmişi (Tamamlandı)
- [x] **Çift Yönlü RTT Gecikme Ölçümü ve Bağlantı Rozeti (`useSocket.ts`, `controller/page.tsx`):** `ROOM_PING` mekanizması mobil kontrolcü eşleştiğinde de devreye alınarak telefonda canlı gecikme (`<35ms` yeşil, `<75ms` pirinç, `>=75ms` sarı) rozeti gösterildi.
- [x] **Mobil Titreşim Tercihi ve Hızlı Son Odalar (`useGameStore.ts`, `SettingsModal.tsx`, `controller/page.tsx`, `controllerPreferences.test.mjs`):** `isHapticEnabled` tercihi yerel depolama ile kalıcılaştırılıp hem masaüstü ayarlar çekmecesinde hem de mobil kontrolcü başlığında tek tıkla açılıp kapanabilir yapıldı; telefonda son 3 benzersiz oda kodu geçmişi kaydedilerek tek tıkla bağlanma sağlandı.

### Faz 58: REST Liderlik Tablosu Uç Noktası (`/api/leaderboard`) ve Genel API Proxy Yönlendirmesi (Tamamlandı)
- [x] **Liderlik Tablosu REST Denetleyicisi (`leaderboard.controller.ts`, `app.module.ts`, `socket.e2e.test.mjs`):** `GET /api/leaderboard` üzerinden tüm rekorları veya `?level=1` parametresiyle belirli bölüm derecelerini JSON formatında sunan NestJS denetleyicisi eklendi; canlı E2E testlerle doğrulandı.
- [x] **Kapsamlı `/api/*` Proxy Desteği (`proxy-helpers.mjs`, `proxy.test.mjs`):** Next.js özel sunucusundaki ters proxy kuralları tüm `/api/*` isteklerini (sağlık ve skor telemetrisi) NestJS arka ucuna kesintisiz iletecek şekilde genişletildi ve otomatik testlerle güvence altına alındı.

### Faz 59: Mobil Kontrolcü Kalıcı Hassasiyet ve Dokunmatik/Jiroskop Mod Geçişi (Tamamlandı)
- [x] **Kalıcı Hassasiyet ve Dokunmatik Mod Durumu (`useGameStore.ts`, `controller/page.tsx`):** Mobil kontrolcü için `controllerSensitivity` (0.75, 1, 1.35) ve `controllerTouchOverride` alanları Zustand deposuna ve `localStorage` kalıcılığına eklendi; sayfa yenilendiğinde tercihlerin korunması sağlandı.
- [x] **Canlı Mod Seçici ve Pil/CPU Optimizasyonu (`controller/page.tsx`, `useDeviceOrientation.ts`, `controllerPreferences.test.mjs`):** Aktif gimbal ekranına `Jiroskop` ve `Dokunmatik` geçiş düğmesi eklendi; dokunmatik moda geçildiğinde donanım sensör dinleyicileri derhal kaldırılarak pil tasarrufu sağlandı, açı ölçekleme ve sınırlandırma kuralları otomatik testlerle doğrulandı.

### Faz 60: Modüler Liderlik Tablosu Modalı, REST Senkronizasyonu ve Arama Filtresi (Tamamlandı)
- [x] **Liderlik Tablosu Yardımcıları ve Birim Testleri (`leaderboardUtils.ts`, `leaderboard.test.mjs`):** Saniyeleri insan okunabilir süre metnine (`14.2 sn`, `1:05.4 sn`) dönüştüren `formatRecordTime`, güvenli tarih biçimlendirici `formatRecordDate`, büyük/küçük harf duyarsız arama ve bölüm filtresi `filterLeaderboardEntries` geliştirildi ve 4 yeni birim test ile doğrulandı.
- [x] **Bağımsız `LeaderboardModal.tsx` ve REST Senkronizasyonu (`LeaderboardModal.tsx`, `DesktopHUD.tsx`):** Masaüstü HUD içindeki gömülü skor penceresi modüler `LeaderboardModal` bileşenine dönüştürüldü; "Tüm Bölümler" vs "Bölüm X" filtreleri, anlık oyuncu arama çubuğu, ilk 3 derece için altın kupa / madalya rozetleri ve `/api/leaderboard` üzerinden tek tıkla canlı REST yenileme desteği eklendi.

### Faz 61: Modüler Eşleştirme Modalı, Rota Çözümleyici ve Varsayılan Ayarlara Dönüş (Tamamlandı)
- [x] **Bağımsız Eşleşme Yönlendirme Motoru ve Birim Testleri (`pairingUtils.ts`, `pairing.test.mjs`):** HTTPS tüneli (ngrok), yerel Wi-Fi ağı (LAN IP) ve canlı alan adı önceliklendirmesi yapan `resolveControllerBaseUrl` ile oda/yuva parametrelerini güvenle kodlayan `buildControllerUrl` yardımcıları ve 4 yeni birim test eklendi (toplam 31 istemci testi).
- [x] **Yalıtılmış `PairingModal.tsx` ve HUD Sadeleştirmesi (`PairingModal.tsx`, `DesktopHUD.tsx`):** QR kod oluşturma, tünel/LAN rota tespiti, çok oyunculu yuva (P1/P2) seçimi ve tek tıkla kod kopyalama işlevleri `PairingModal` bileşenine taşınarak `DesktopHUD.tsx` üzerinden 110+ satırlık DOM ve durum kalabalığı temizlendi.
- [x] **Tek Tıkla Varsayılan Ayarlara Dönüş (`useGameStore.ts`, `SettingsModal.tsx`):** `DEFAULT_PREFERENCES` sabiti ve `resetPreferencesToDefaults()` eylemi ile oyuncunun fizik, ses, kamera, tema ve kontrolcü tercihlerini kayıtlı bölüm rekorlarını veya oda durumunu bozmadan tek tıkla ilk ayarlara sıfırlayabilmesi sağlandı.

### Faz 62: Modüler Oyun Sonu Modalları (Zafer ve Yenilgi), Yıldız Hedef ve Rekor Motoru (Tamamlandı)
- [x] **Zafer ve Rekor Değerlendirme Motoru (`gameOutcomeUtils.ts`, `gameOutcome.test.mjs`):** Süreye göre yıldız sayısı (`calculateEarnedStars`), 3 yıldız hedef fark mesajı (`formatStarGoalMessage`) ve kişisel rekor (`isPersonalBest`) kontrolü sağlayan saf yardımcılar ve 3 yeni birim test eklendi (toplam 34 istemci testi).
- [x] **Yalıtılmış `GameOutcomeModals.tsx` ve HUD Mimarisi Tamamlanması (`GameOutcomeModals.tsx`, `DesktopHUD.tsx`):** Bölüm tamamlama (zafer) ve süre doldu (yenilgi) modalları, animasyonlu yıldızlar, PB rozeti ve skor formuyla bağımsız `GameOutcomeModals` bileşenine taşındı; `DesktopHUD.tsx` 180+ satır sadeleştirilerek tamamen modüler hale getirildi.

### Faz 63: Web Audio API Prosedürel Ses Motoru Genişletmesi, Dinamik Zafer Fanfarı ve Metronom (Tamamlandı)
- [x] **Çok Katmanlı Prosedürel Ses Efektleri (`soundEngine.ts`, `soundEngine.test.mjs`):** `SoundEngine` sınıfı dışa aktarılabilir ve enjekte edilebilir mock `AudioContext` desteğiyle güçlendirildi; 1/2/3 yıldız derecesine göre dinamik 3..6 notalı zafer fanfarı (`playVictory`), minör inen yenilgi tınısı (`playDefeat`), son saniyeler için normal/acil metronom vuruşu (`playTimerTick`) ve dokunsal arayüz tıkı (`playUIClick`) eklendi; 7 yeni birim test ile doğrulandı (toplam 41 istemci testi).
- [x] **3B Sahne ve HUD Geri Sayım Entegrasyonu (`MazeScene.tsx`, `DesktopHUD.tsx`):** Hedef portalına ulaşıldığında kazanılan yıldız sayısına göre doğru fanfar tetiklenmesi ve Süreye Karşı (Time Attack) modunda son 5 saniyede artan frekanslı uyarı tıkı ve süre bitiminde `playDefeat()` çalınması sağlandı.

### Faz 64: Modüler Mobil Kontrolcü Motoru, Trigonometrik Gimbal Hesaplayıcı ve Yalıtılmış Kart Mimarisi (Tamamlandı)
- [x] **Gimbal Matematik ve Oda Doğrulama Motoru (`controllerUtils.ts`, `controllerUtils.test.mjs`):** `cleanRoomCode`, `validateRoomCode`, dokunmatik daire sınırlandırması ve trigonometrik açı üretimi (`calculateGimbalTouchAngles`), ufuk küresi piksel ofseti (`calculateGimbalDotOffset`), açı biçimlendirici (`formatGimbalAngle`) ve hassasiyet ölçekleyici (`scaleGyroAngles`) saf fonksiyonlara ayrılarak 6 yeni birim test ile doğrulandı (toplam 47 istemci testi).
- [x] **Yalıtılmış Mobil Kontrolcü Bileşenleri (`ControllerRoomCard.tsx`, `ControllerSensorCard.tsx`, `ControllerGimbalPad.tsx`, `page.tsx`):** `page.tsx` 310+ satır sadeleştirilerek 6 haneli oda kodu formu (`ControllerRoomCard`), jiroskop izin kartı (`ControllerSensorCard`) ve sanal 2B eğim tablası ile mod seçicileri (`ControllerGimbalPad`) bağımsız modüllere ayrıldı.

### Faz 65: Modüler Bölüm Seçici, Kampanya Yıldız İlerleme Motoru ve Seviye Başarı Rozeti (Tamamlandı)
- [x] **Kampanya ve Bölüm İlerleme Motoru (`levelProgressUtils.ts`, `levelProgress.test.mjs`):** Standart bölümler için kişisel rekorlardan yıldız sayısı hesaplama (`getLevelProgress`), 5 bölüm üzerinden toplam kazanılan yıldız (örn: 12/15) ve bitirme yüzdesi (`calculateCampaignProgress`), metin sembolleri (`formatLevelStarBadges`) ve 15/15 usta rozeti geliştirildi; 6 yeni birim test ile doğrulandı (toplam 53 istemci testi, 81 monorepo testi).
- [x] **Yalıtılmış `LevelSelectPopover.tsx` ve HUD Mimarisi İyileştirmesi (`LevelSelectPopover.tsx`, `DesktopHUD.tsx`):** Masaüstü HUD üst çubuğundaki gömülü bölüm listesi, tıklama dışı/Escape dinleyicileri ve prosedürel geçiş eylemleri bağımsız `LevelSelectPopover` bileşenine taşındı; `DesktopHUD.tsx` 180+ satır daha sadeleştirilerek tamamen modüler hale getirildi.

### Faz 66: 3B Harita Editörü Hazır Şablon Motoru ve Hızlı Başlangıç Paleti (Tamamlandı)
- [x] **Küratörlü Editör Şablon Motoru (`editorTemplates.ts`, `editorTemplates.test.mjs`):** BFS ile çözülebilirliği matematiksel olarak doğrulanan 4 hazır harita şablonu (`spiral`, `quantum-bridge`, `crystal-hunt`, `speedway`), `createEmptyGrid` ve `getEditorTemplateById` yardımcıları eklendi; 5 yeni birim test ile doğrulandı (toplam 58 istemci testi, 86 monorepo testi).
- [x] **Editör Arayüz Entegrasyonu (`LevelEditorModal.tsx`):** Harita editörü sol paneline 2 sütunlu "Hazır şablonlar" paleti eklendi; şablon seçildiğinde ızgara, harita başlığı, tahta boyutu otomatik güncelleniyor ve dokunsal ses geri bildirimi veriliyor.

### Faz 67: Modüler HUD Üst Çubuğu, Hızlı Araçlar Paneli ve Telemetri Motoru (Tamamlandı)
- [x] **HUD Telemetri ve Biçimlendirme Motoru (`hudUtils.ts`, `hudUtils.test.mjs`):** `calculateTimeAttackLimit`, `calculateTimeRemaining`, `resolveTimerColorClass`, `resolveConnectionStatus`, `formatPortalStatus` ve `formatCameraModeLabel` saf yardımcıları geliştirildi; 7 yeni birim test ile doğrulandı (toplam 65 istemci testi, 93 monorepo testi).
- [x] **Modüler Üst Çubuk ve Hızlı Araçlar (`DesktopHeader.tsx`, `QuickControlsToolbar.tsx`, `DesktopHUD.tsx`):** Masaüstü HUD üst gezinti ve durum çubuğu `DesktopHeader` bileşenine, sağ alt eylem çubuğu `QuickControlsToolbar` bileşenine taşındı; `DesktopHUD.tsx` 614 satırdan 260 satıra indirilerek saf orkestratör mimarisine kavuşturuldu.

### Faz 68: Mobil Kontrolcü Modüler Üst Çubuk, Durum Kartları ve Eylem Paneli (Tamamlandı)
- [x] **Kontrolcü Rozet ve Bölüm Biçimlendirme Motoru (`controllerUtils.ts`, `controllerUtils.test.mjs`):** `formatControllerLevelLabel`, `resolveControllerConnectionBadge` ve `formatCrystalRatio` saf fonksiyonları eklendi; 3 yeni birim test ile doğrulandı (toplam 68 istemci testi, 96 monorepo testi).
- [x] **Modüler Kontrolcü Bileşen Mimarisi (`ControllerHeader.tsx`, `ControllerStatusBanners.tsx`, `ControllerFooter.tsx`, `page.tsx`):** Mobil kumanda üst çubuğu (`ControllerHeader`), bölüm/kristal gezgini, zafer ve süre doldu kartları (`ControllerStatusBanners`) ve alt sıfırlama/kalibrasyon eylemleri (`ControllerFooter`) bağımsız modüllere ayrılarak `page.tsx` 773 satırdan 442 satıra sadeleştirildi.

### Faz 69: Prosedürel Zafer Konfetisi, Parçacık Fiziği ve 3-Yıldız Kutlama Motoru (Tamamlandı)
- [x] **Zafer Parçacık Fiziği Motoru (`celebrationParticles.ts`, `celebrationParticles.test.mjs`):** 3 yıldız veya kişisel rekor durumlarında tetiklenen `isCelebrationWorthy`, yerçekimi/sürtünme/açısal hız simülasyonu yapan `createParticle`, `createCelebrationBurst` ve `stepParticle` saf fonksiyonları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 73 istemci testi, 101 monorepo testi).
- [x] **GPU Hızlandırmalı Tuval Bileşeni (`CelebrationCanvas.tsx`, `GameOutcomeModals.tsx`):** Sıfır DOM reflow maliyetli, yalnızca aktifken çalışan ve parçacıklar söndüğünde animasyon döngüsünü otomatik durduran `CelebrationCanvas` bileşeni zafer modallarına entegre edildi.

### Faz 70: Kokpit Yapay Ufuk ve 2B Canlı Radar Koordinat Motoru (Tamamlandı)
- [x] **Radar Koordinat ve Telemetri Motoru (`radarUtils.ts`, `radarUtils.test.mjs`):** Dünya koordinatlarını mini-harita piksel sınırlarına eşleyen `calculateRadarCoords`, yüzde hesaplayıcı `calculateRadarPercentage`, yapay ufuk disk açısı ve dikey öteleme fonksiyonu `calculateAttitudeHorizonTransform` ve biçimlendirici `formatAttitudeTelemetry` saf yardımcıları eklendi; 5 yeni birim test ile doğrulandı (toplam 78 istemci testi, 106 monorepo testi).
- [x] **Yalıtılmış Kokpit Bileşenleri (`AttitudeHorizonDial.tsx`, `MiniMapRadar.tsx`, `AttitudeGauge.tsx`):** Yapay ufuk kadranı ve 2B mini-harita radarı bağımsız bileşenlere ayrıldı, React yeniden render'ı olmaksızın 60 FPS doğrudan DOM dönüştürme mimarisi korundu.

### Faz 71: Modüler Ayarlar Paneli, Bölüm Kartları ve Ses/Fizik Kontrol Motoru (Tamamlandı)
- [x] **Ayar Değer Biçimlendirme ve Seçenek Motoru (`settingsUtils.ts`, `settingsUtils.test.mjs`):** Ses düzeyi metin biçimlendirici `formatVolumeLabel`, aktif segmented ses seçici `resolveActiveVolumeValue`, döngüsel radyo grubu gezinim indeksi `resolveNextRadioIndex`, bilye kaplama rengi `resolveBallSkinSwatch` ve standart ayar seçenekleri (`BALL_SKIN_OPTIONS`, `GRAVITY_SCALE_OPTIONS`, `TILT_RESPONSIVENESS_OPTIONS`, `VOLUME_SEGMENTED_OPTIONS`) geliştirildi; 6 yeni birim test ile doğrulandı (toplam 84 istemci testi, 112 monorepo testi).
- [x] **Yalıtılmış Ayar Bölüm Bileşenleri (`SettingsGameModeSection.tsx`, `SettingsAppearanceSection.tsx`, `SettingsPhysicsSection.tsx`, `SettingsAudioOverlaysSection.tsx`, `SettingsModal.tsx`):** Ayarlar çekmecesindeki tüm bölümler (oyun modu/oyuncu sayısı, görünüm/3B atmosfer/kamera/bilye görünümü, fizik ivmesi/eğim tepkisi, ses şiddeti ve ekran katmanları) bağımsız alt bileşenlere ayrılarak `SettingsModal.tsx` 339 satırdan 145 satıra sadeleştirildi.

### Faz 72: Modüler 3B Harita Editörü, Izgara Fırçası, Araç Paleti ve Editör Motoru (Tamamlandı)
- [x] **Harita Editörü Izgara ve Araç Mantığı Motoru (`editorUtils.ts`, `editorUtils.test.mjs`):** Başlangıç/hedef tekilliğini koruyan ve hücre toggle'ı yöneten `applyToolToCell`, çözülebilir ve geçerli labirent üreten `generateRandomEditorGrid`, kuantum portal çifti denetimi `countGridPortals` / `isPortalCountBalanced` ve editör sabitleri (`BOARD_SIZE_OPTIONS`, `EDITOR_GRID_SIZE`) geliştirildi; 6 yeni birim test ile doğrulandı (toplam 90 istemci testi, 118 monorepo testi).
- [x] **Yalıtılmış Editör Bileşen Mimarisi (`LevelEditorToolbar.tsx`, `LevelEditorGrid.tsx`, `LevelEditorTemplatesList.tsx`, `LevelEditorMetaControls.tsx`, `LevelEditorFooter.tsx`, `LevelEditorModal.tsx`):** Harita editörü modülü bağımsız alt parçalara bölünerek klavye erişilebilirliği ve DOM yönetimi güçlendirildi; `LevelEditorModal.tsx` 664 satırdan 239 satıra sadeleştirildi.

### Faz 73: 3B Sahne Matematik Motoru, Lazer/Engel Simülasyonu, Dinamik Kamera ve Tema Çözümleyici (Tamamlandı)
- [x] **3B Sahne Matematik ve Görsel Efekt Motoru (`sceneUtils.ts`, `sceneUtils.test.mjs`):** Periyodik lazer kapısı zamanlayıcısı `isLaserGateActive`, hareketli kinetik devriye engeli sinüzoidal ötelemesi `calculateMovingObstacleOffset`, çok modlu dinamik kamera konumlandırıcısı `calculateCameraTargetTransform`, hayalet yarışçı enterpolasyonu `calculateGhostPlaybackCoord`, neon iz halkası ölçekleyicisi `calculateTrailScale`, atmosferik sahne paleti `resolveThemePalette` ve bilye kaplama rengi `resolveBallSkinColors` geliştirildi; 6 yeni birim test ile doğrulandı (toplam 96 istemci testi, 124 monorepo testi).
- [x] **Sahne Mimarisi Entegrasyonu (`MazeScene.tsx`):** `MazeScene.tsx` bileşenindeki inline matematiksel formüller, gömülü renk dallanmaları ve kamera dönüşümleri saf yardımcı motora devredilerek kod okunabilirliği ve test güvencesi artırıldı.

### Faz 74: Mobil Kontrolcü Yaşam Döngüsü Motoru, Wake Lock Kancası ve Sanal Gimbal Sınır Hesaplayıcısı (Tamamlandı)
- [x] **Gimbal Sınır ve Yaşam Döngüsü Motoru (`controllerUtils.ts`, `controllerUtils.test.mjs`):** Dokunmatik gimbal alanı merkez ve yarıçap sınır hesaplayıcısı `calculateGimbalBounds`, sensör/dokunmatik yüzey görünürlük çözümleyicisi `resolveGimbalSurfaceVisibility` ve 0.2px delta eşikli GPU reflow filtresi `shouldUpdateGimbalDotOffset` geliştirildi; 3 yeni birim test ile doğrulandı (toplam 99 istemci testi, 127 monorepo testi).
- [x] **Bağımsız Screen Wake Lock Kancası ve Sayfa Sadeleştirmesi (`useWakeLock.ts`, `controller/page.tsx`):** Telefon ekranının oyun esnasında uykuya geçmesini önleyen `useWakeLock` kancası ayrıştırıldı; `controller/page.tsx` içindeki gömülü yaşam döngüsü kodları temizlenerek mimari saflaştırıldı.

### Faz 75: Özel Harita URL Kodlayıcı, Base64url Güvenlik Katmanı ve JSON Şema Ayrıştırıcı Motoru (Tamamlandı)
- [x] **Özel Harita URL ve Şema Ayrıştırma Motoru (`customMapCodec.ts`, `customMapCodec.test.mjs`):** Sıkı JSON şema doğrulayıcısı `parseCustomMazeLevel`, URL-safe Base64url serileştiricisi `encodeCustomMazeLevelForUrl`, UTF-8 Base64url çözücüsü `decodeCustomMazeLevelFromUrl`, sorgu parametresi sabiti `CUSTOM_MAP_URL_PARAM` ve uzunluk sınırı `MAX_ENCODED_MAP_LENGTH` geliştirildi; 6 yeni birim test ile doğrulandı (toplam 105 istemci testi, 133 monorepo testi).
- [x] **Harita Tanım Modülü Sadeleştirmesi (`mazeLevels.ts`):** `mazeLevels.ts` dosyasından 270+ satırlık JSON ayrıştırma ve Base64url dönüşüm kodu bağımsız `customMapCodec` motoruna devredildi ve re-export ile geriye dönük tam uyumluluk korundu.

### Faz 76: 3B Harita Derleyici, BFS Yol Doğrulayıcı ve Izgara-Dünya Eşleyici Motoru (Tamamlandı)
- [x] **Harita Derleyici, Akıllı Eksen ve BFS Yol Doğrulama Motoru (`editorCompiler.ts`, `editorCompiler.test.mjs`):** Hedefe yönelik akıllı hızlandırıcı yön vektörü `computeEditorBoostDirection`, koridor yönüne dik dinamik lazer ekseni `computeEditorLaserAxis`, hareketli devriye engeli genlik ve eksen seçici `computeEditorMovingConfig`, 8×8 ızgara ile 12×12 / 16×16 dünya koordinatları arasında kayıpsız çift yönlü eşleyiciler `editorGridCellToWorld` ve `worldToEditorGridCell`, kuantum portal sıçramalarını ve tüm kristallerin erişilebilirliğini denetleyen BFS doğrulayıcısı `validateEditorGrid`, tam donanımlı 3B `MazeLevelDefinition` derleyicisi `buildLevelFromEditorGrid` ve tersine ızgara dönüştürücüsü `levelDefinitionToEditorGrid` geliştirildi; 6 yeni birim test ile doğrulandı (toplam 111 istemci testi, 139 monorepo testi).
- [x] **Harita Tanım Modülü Temizliği ve Re-export Mimarisi (`mazeLevels.ts`):** `mazeLevels.ts` dosyasından 520+ satırlık derleme ve geometri hesaplama kodu silinerek saf `editorCompiler` motoruna devredildi; geriye dönük tam uyumlu re-export mimarisi sağlandı.

### Faz 77: 3B Sahne Materyal Fabrikası, WebGL Hata Sınırı ve Işıklandırma Ayrıştırması (Tamamlandı)
- [x] **3B Sahne Singleton Materyal ve Matematik Motoru (`sceneMaterials.ts`, `sceneMaterials.test.mjs`):** Tahta, iç/dış duvarlar, bilyeler, tuzak delikleri, hedefler, kristaller, lazerler, portallar, kinetik engeller ve neon iz halkaları için paylaşılan 18+ Three.js materyali, GC duraksamasını sıfırlayan modül seviyesi vektör/Euler singleton nesneleri ve `applySceneThemeMaterials` tema güncelleyicisi geliştirildi; 6 yeni birim test ile doğrulandı (toplam 117 istemci testi, 145 monorepo testi).
- [x] **Modüler WebGL Hata Sınırı ve Sahne Aydınlatması (`SceneErrorBoundary.tsx`, `SceneLights.tsx`, `MazeScene.tsx`):** WebGL ve Rapier WASM başlatma çökmelerini zarif kurtarma kartıyla yakalayan `SceneErrorBoundary` ve dinamik gölge haritasına sahip ortam/güneş/dolgu aydınlatması `SceneLights` bileşenlerine ayrıştırıldı; `MazeScene.tsx` 200+ satır sadeleştirildi.

### Faz 78: 3B Sahne Görsel Geometri Motoru, Duvarlar, Tehlikeler ve Aktör Ayrıştırması (Tamamlandı)
- [x] **3B Sahne Geometri ve Tehlike Analiz Motoru (`sceneGeometry.ts`, `sceneGeometry.test.mjs`):** Lazer sütun ve ışın kutusu konumlandırıcı `calculateLaserGateGeometry`, hızlandırma rampası yaw açısı hesaplayıcı `calculateBoostYaw`, tahta boyutuna göre 4 çevre sınır duvarı üreteci `calculateOuterWallConfigs`, harita tehlikelerini analiz eden `summarizeLevelHazards` ve hedef portal konfigüratörü `resolveGoalPortalConfig` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 122 istemci testi, 150 monorepo testi).
- [x] **Yalıtılmış 3B Sahne Görsel Bileşenleri (`MazeStageWalls.tsx`, `MazeStageHazards.tsx`, `MazeStageCollectibles.tsx`, `MazeStageActors.tsx`, `MazeScene.tsx`):** `MazeScene.tsx` bileşenindeki 280+ satırlık iç içe JSX render blokları bağımsız duvar, tehlike, toplanabilir/hedef ve aktör alt bileşenlerine ayrılarak kod tabanı saf fizik/kamera orkestratör mimarisine kavuşturuldu.

### Faz 79: 3B Çarpışma ve Fizik Algılama Motoru (Tuzaklar, Lazerler, Rampalar ve Portallar) (Tamamlandı)
- [x] **Saf 3B Çarpışma ve Fizik Hesaplama Motoru (`sceneCollisions.ts`, `sceneCollisions.test.mjs`):** Bilye ile enerji kristalleri kesişimi `findCollidingCrystalIndex`, kinetik hızlandırma rampası tetiklemesi `findCollidingBoostPad`, yönlü rampa itiş vektörü `calculateBoostVelocity`, kuantum portal çifti ışınlanma hedefi `findTeleportDestination`, periyodik aktif lazer koridor çarpışması `isBallCollidingLaserGate`, hareketli devriye engeli ile temas ve radyal geri tepme `calculateMovingObstacleCollision`, hedef portalı kapsama alanı `isBallInsideGoal` ve yerçekimi/tabla eğimine göre Euler sönümlemeli hız adımı `stepBallVelocity` geliştirildi; 7 yeni birim test ile doğrulandı (toplam 129 istemci testi, 157 monorepo testi).
- [x] **Fizik Döngüsü Sadeleştirmesi ve Çok Oyunculu Parite (`MazeScene.tsx`):** `processBallInteractions` ve `useFrame` kancasındaki gömülü mesafe, açı ve hız matematiği `sceneCollisions.ts` motoruna devredildi; 1. ve 2. oyuncu için birebir simetrik, güvenilir ve modüler çarpışma algılama mimarisi kuruldu.

### Faz 80: 3B Fizik Çarpıştırıcıları (Rapier Colliders) ve Tabla Slerp Kancası Ayrıştırması (Tamamlandı)
- [x] **Rapier Çarpıştırıcı ve Sensör Yardımcı Motoru (`sceneColliderUtils.ts`, `sceneColliderUtils.test.mjs`):** Kutu çarpıştırıcıları için yarı-boyut dönüştürücüsü `calculateCuboidHalfExtents`, bilyenin ağırlık merkezine odaklanan tuzak deliği sensör yarıçapı `calculateHoleSensorRadius`, temas eden bilye gövdesine göre oyuncu yuva çözümleyicisi `resolveSensorSlot`, oyun modu/modal/cooldown korumalı düşme denetleyicisi `shouldTriggerHoleFall` ve dinamik slerp katsayısı hesaplayıcı `calculateSlerpAlpha` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 134 istemci testi, 162 monorepo testi).
- [x] **Modüler Sabit Fizik Çarpıştırıcıları Bileşeni (`MazeStageColliders.tsx`, `MazeScene.tsx`):** Dış duvar, iç duvar, hedef portalı ve tuzak deliklerinin tüm Rapier sabit gövde (`type="fixed"`) çarpıştırıcıları ve sensörleri bağımsız `MazeStageColliders` bileşenine taşındı; `MazeScene.tsx` 80+ satır daha sadeleştirilerek 1630 satırdan 1070 satıra indirildi.

### Faz 81: 3B Dinamik Kamera Teçhizatı, Dinamik FOV, Bilye Yuvarlanma ve İz Motoru (Tamamlandı)
- [x] **Dinamik Kamera ve Hareket Takip Motoru (`sceneCameraUtils.ts`, `sceneCameraUtils.test.mjs`):** Kare hızından bağımsız üssel kamera sönümleme katsayısı `calculateCameraLerpAlpha`, bilye hızına ve rampa fırlatmasına duyarlı sinematik görüş açısı `calculateDynamicFov`, çok modlu kamera hedef vektörleri `calculateCameraTargetTransform`, doğrusal hız ve bilye yarıçapına göre fiziksel yuvarlanma açıları `calculateBallRollingRotation`, sıfır bellek ayırmalı (Zero GC) neon iz kaydırma fonksiyonu `stepTrailHistory` ve deterministik hayalet örnekleme kontrolü `shouldUpdateGhostSample` geliştirildi; 7 yeni birim test ile doğrulandı (toplam 141 istemci testi, 169 monorepo testi).
- [x] **Bağımsız Kamera Teçhizatı Bileşeni ve Sahne Sadeleştirmesi (`MazeCameraRig.tsx`, `MazeScene.tsx`):** Kamera hedef takip (`lerp`), odaklama (`lookAt`) ve dinamik FOV mantığı doğrudan Canvas seviyesinde çalışan otonom `MazeCameraRig` bileşenine devredildi; `MazeStage` içindeki bilye dönme, hayalet kayıt ve iz döngüleri saf motor fonksiyonlarıyla yenilenerek `MazeScene.tsx` temiz bir orkestratör haline getirildi.

### Faz 82: 3B Aktör Animasyon Motoru, Bilye Etkileşim Kancası ve Cooldown İzolasyonu (Tamamlandı)
- [x] **3B Aktör Animasyon ve Etkileşim Yardımcı Motoru (`sceneActorUtils.ts`, `sceneActorUtils.test.mjs`):** Hedef portal halkası açı hesabı `calculateGoalRingRotation`, kristal havada süzülme ve dönme dönüşümü `calculateCrystalFloatTransform`, hareketli kinetik engelin 3B sinüzoidal konumu `calculateObstacleMeshPosition`, engelin kendi ekseni etrafında dönüşü `calculateObstacleRotationY` ve bekleme süresi denetleyicisi `isWithinInteractionCooldown` geliştirildi; 6 yeni birim test ile doğrulandı (toplam 147 istemci testi, 175 monorepo testi).
- [x] **Bağımsız Bilye Etkileşim Kancası (`useBallInteractions.ts`, `MazeScene.tsx`):** Rampa (boost), portal (teleport), lazer kapısı ve kinetik engel bekleme süreleri (cooldowns) ile bilye etkileşim döngüsü `useBallInteractions` özel kancasına taşındı; `MazeScene.tsx` dosyasından 110+ satırlık gömülü etkileşim ve animasyon kodu temizlenerek bileşen 940 satıra indirildi.

### Faz 83: 3B Hayalet Kayıt/Yeniden Oynatma Kancası ve Hayalet Yarışçı Motoru (Tamamlandı)
- [x] **Hayalet Yarışçı Matematik ve Doğrulama Motoru (`ghostReplayUtils.ts`, `ghostReplayUtils.test.mjs`):** Hayalet koordinat enterpolasyonu, örnekleme frekans filtresi ve hayalet veri doğrulayıcı saf fonksiyonları geliştirildi; 6 yeni birim test ile doğrulandı (toplam 153 istemci testi, 181 monorepo testi).
- [x] **Bağımsız Hayalet Kayıt ve Yeniden Oynatma Kancası (`useGhostReplay.ts`, `MazeScene.tsx`):** 1P solo modunda en iyi süreyi koşan hayaletin kare kare kaydı ve oynatımı `useGhostReplay` kancasına devredildi; `MazeScene.tsx` bileşeni 810 satıra indirildi.

### Faz 84: 3B Neon Hareket İzi Kancası, Telemetri ve Bilye Aktör Dönüşüm Motoru (Tamamlandı)
- [x] **Bilye Aktör Dönüşüm ve Telemetri Motoru (`sceneActorUtils.ts`, `sceneActorUtils.test.mjs`):** `updateTransientTelemetry` ve `updateBallActorTransform` saf yardımcıları geliştirildi; 2 yeni birim test ile doğrulandı (toplam 155 istemci testi, 183 monorepo testi).
- [x] **Bağımsız Neon Hareket İzi Kancası (`useMotionTrail.ts`, `MazeScene.tsx`):** 12 segmentli halka tampon neon hareket izi yaşam döngüsü `useMotionTrail` kancasına taşındı; `MazeScene.tsx` bileşeni 760 satıra indirildi.

### Faz 85: 3B Sahne Olay İşleyicileri ve Ses/Haptik Kancası Ayrışımı (Tamamlandı)
- [x] **Sahne Olay ve Ses/Haptik Kuralları Motoru (`sceneEventUtils.ts`, `sceneEventUtils.test.mjs`):** Kristal toplama, hedefe ulaşma, boşluğa düşme, lazer/duvar çarpışması ses ve titreşim eylem çözümleyicileri saf motor olarak geliştirildi; 7 yeni birim test ile doğrulandı (toplam 162 istemci testi, 190 monorepo testi).
- [x] **Bağımsız Sahne Olay İşleyici Kancası (`useMazeSceneEvents.ts`, `MazeScene.tsx`):** Kristal toplama, hedefe varış, boşluğa düşme, lazer çarpması, rampa ve portal tetikleyicileri `useMazeSceneEvents` kancasına taşındı; `MazeScene.tsx` bileşeni 712 satıra indirildi.

### Faz 86: 3B Sahne Sıfırlama Kancası, Aktör Animasyon Döngüleri ve Bilye Doğuş Motoru (Tamamlandı)
- [x] **Aktör Animasyon ve Doğuş Motoru (`sceneActorUtils.ts`, `sceneActorUtils.test.mjs`):** `calculateBallSpawnPosition`, `updateCrystalsAnimation`, `updateLaserBeamsVisibility` ve `updateMovingObstaclesTransform` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 166 istemci testi, 194 monorepo testi).
- [x] **Bağımsız Sahne Sıfırlama Kancası (`useMazeStageReset.ts`, `MazeScene.tsx`):** 1P ve 2P bilye doğuş, tabla ve tehlike saati sıfırlaması `useMazeStageReset` kancasına taşındı; `MazeScene.tsx` bileşeni 657 satıra indirildi.

### Faz 87: Bağımsız 3B Labirent Sahnesi (MazeStage) Bileşeni ve Hedef Varış Motoru (Tamamlandı)
- [x] **Hedef Varış Kural Motoru (`sceneCollisions.ts`, `sceneCollisions.test.mjs`):** Oyun etkileşimi, kilit açılma durumu ve bilye hedef yarıçap mesafesini tek kuralla doğrulayan `canTriggerGoalReach` saf yardımcısı eklendi; 1 yeni birim test ile doğrulandı (toplam 168 istemci testi, 196 monorepo testi).
- [x] **Bağımsız 3B Labirent Sahnesi Bileşeni (`MazeStage.tsx`, `MazeScene.tsx`):** Fizik simülasyonu, Rapier dinamik bilyeleri, görsel tabla slerp dönüşümü ve sahne kare döngüsü (`useFrame`) bağımsız `MazeStage` bileşeni olarak ayrıştırıldı; `MazeScene.tsx` konteyner bileşeni 657 satırdan 149 satıra indirilerek saf WebGL/Canvas orkestratörü haline getirildi.

### Faz 88: Mobil Kontrolcü Sanal Gimbal, Oda Bağlantı Kancaları ve Yardımcı Motoru (Tamamlandı)
- [x] **Mobil Kontrolcü Mantık ve Durum Motoru (`controllerUtils.ts`, `controllerUtils.test.mjs`):** 8 Hz metin güncelleme filtresi `shouldUpdateAngleText`, işaretçi kimlik eşleşmesi `isPointerEventMatching`, sürükleme bırakma denetleyicisi `shouldResetPointerDrag` ve yuva değiştirme çözümleyicisi `resolveSlotChange` geliştirildi; 1 yeni birim test ile doğrulandı (toplam 169 istemci testi, 197 monorepo testi).
- [x] **Bağımsız Sanal Gimbal ve Oda Bağlantı Kancaları (`useGimbalInteraction.ts`, `useControllerRoom.ts`, `controller/page.tsx`):** Sanal gimbal işaretçi yakalama, ufuk küresi 60 FPS GPU animasyonu `useGimbalInteraction` kancasına; oda kodu parametreleri ve manuel bağlantı doğrulama formu `useControllerRoom` kancasına devredildi; `controller/page.tsx` bileşeni 520 satırdan 341 satıra indirildi.

### Faz 89: Mobil Kontrolcü Sensör Yaşam Döngüsü Kancası, Güvenlik ve Zaman Aşımı Motoru (Tamamlandı)
- [x] **Kontrolcü Sensör ve Bağlam Güvenlik Motoru (`controllerUtils.ts`, `controllerUtils.test.mjs`):** Sensör zaman aşımı koşulu `shouldTriggerSensorTimeout`, izin sonucu aksiyon çözümleyicisi `resolveSensorActivation`, dokunmatik geçiş anahtarı `resolveTouchOverrideToggle` ve güvenli bağlam denetleyicisi `isContextInsecure` saf yardımcıları geliştirildi; 1 yeni birim test ile doğrulandı (toplam 170 istemci testi, 198 monorepo testi).
- [x] **Bağımsız Sensör Yaşam Döngüsü ve İzin Kancası (`useControllerSensors.ts`, `controller/page.tsx`):** HTML5 jiroskop sensör yaşam döngüsü, izin istekleri, güvensiz bağlam tespiti, 1500ms sinyal zaman aşımı, kalibrasyon ve ekran uyku kilidi (`useWakeLock`) bağımsız `useControllerSensors` kancasına devredildi; `controller/page.tsx` bileşeni 341 satırdan **249 satıra** indirildi.

### Faz 90: Masaüstü HUD Oyun Saati Kancası, Klavye Kısayolları ve Arayüz Ayrışımı (Tamamlandı)
- [x] **HUD Zamanlayıcı ve Bildirim Tonu Motoru (`hudUtils.ts`, `hudUtils.test.mjs`):** `shouldRunGameTimer`, `isTimerExpired`, `shouldWarnTimerTick` ve `resolveHudNotificationTone` saf yardımcıları geliştirildi; 2 yeni birim test ile doğrulandı (toplam 172 istemci testi, 200 monorepo testi).
- [x] **Bağımsız Oyun Saati ve Klavye Kısayol Kancaları (`useGameTimer.ts`, `useDesktopKeyboardShortcuts.ts`):** Sekme dondurma ve Time Attack geri sayım döngüsü `useGameTimer` kancasına; masaüstü global klavye aksiyonları `useDesktopKeyboardShortcuts` kancasına ayrıştırıldı.
- [x] **Modüler HUD Bildirimleri ve Alt Kontrol Paneli (`DesktopHUDOverlays.tsx`, `DesktopFooterControls.tsx`, `DesktopHUD.tsx`):** Sahne üstü duraklatma/kurtarma çubuğu ile toast bildirimleri `DesktopHUDOverlays` bileşenine; AttitudeGauge, mini-harita ve 1P/2P ipuçları `DesktopFooterControls` bileşenine devredildi; `DesktopHUD.tsx` orkestratörü 359 satırdan **96 satıra** indirildi.

### Faz 91: Modüler Liderlik Tablosu, Arama/Bölüm Kancası ve Sıralama Rozet Motoru (Tamamlandı)
- [x] **Liderlik Tablosu Sayfalama ve Rozet Motoru (`leaderboardUtils.ts`, `leaderboard.test.mjs`):** 5 elemanlı bölüm penceresi `calculateLevelWindow`, podyum/madalya görsel stilleri `resolveRankBadgeStyle`, bölüm rozeti formatlayıcı `formatLevelBadge` ve dinamik boş liste mesajı `resolveEmptyLeaderboardMessage` saf yardımcıları geliştirildi; 1 yeni birim test ile doğrulandı (toplam 173 istemci testi, 201 monorepo testi).
- [x] **Bağımsız Liderlik Tablosu Senkronizasyon Kancası (`useLeaderboardSync.ts`):** REST API veri çekme, bölüm sekmesi değiştirme, oyuncu arama filtresi ve yenileme durumu `useLeaderboardSync` kancasına ayrıştırıldı.
- [x] **Modüler Liderlik Bileşen Mimarisi (`LeaderboardLevelSelector.tsx`, `LeaderboardSearchInput.tsx`, `LeaderboardList.tsx`, `LeaderboardModal.tsx`):** Bölüm seçici sekmeleri, arama kutusu ve podyum madalyalı skor listesi bağımsız alt bileşenlere ayrılarak `LeaderboardModal.tsx` 310 satırdan **75 satıra** indirildi.

### Faz 92: Modüler Bölüm Seçici, Popover Kancası ve İlerleme Görsel Motoru (Tamamlandı)
- [x] **Liderlik/Bölüm İlerleme ve Etiket Motoru (`levelProgressUtils.ts`, `levelProgress.test.mjs`):** `formatShortLevelTag`, `cleanLevelTitle`, `calculateNextProceduralLevel` ve `resolveLevelItemAriaLabel` saf yardımcıları geliştirildi; 1 yeni birim test ile doğrulandı (toplam 174 istemci testi, 202 monorepo testi).
- [x] **Bağımsız Bölüm Seçici Kancası (`useLevelSelect.ts`):** Açılır menü yaşam döngüsü, dışarı tıklama/Esc denetleyicisi, kampanya yıldız/rekor ilerlemesi ve prosedürel bölüm sıçrama eylemleri bağımsız `useLevelSelect` kancasına taşındı.
- [x] **Modüler Bölüm Seçici Arayüz Mimarisi (`LevelSelectTrigger.tsx`, `LevelSelectMenu.tsx`, `LevelSelectPopover.tsx`):** Üst çubuk tetikleyicisi/okları ve 1..5 standart bölüm kartları ile özel/prosedürel butonlar bağımsız bileşenlere ayrılarak `LevelSelectPopover.tsx` 300 satırdan **65 satıra** indirildi.

### Faz 93: Oyun Sonucu Modalları, Zafer/Yenilgi Kancası ve Çok Oyunculu Rozet Motoru (Tamamlandı)
- [x] **Zafer/Yenilgi Değerlendirme ve Formatlayıcı Motoru (`gameOutcomeUtils.ts`, `gameOutcome.test.mjs`):** `calculateTimeAttackLimit`, `cleanPlayerName`, `resolveMultiplayerWinnerText`, `formatOutcomeStarAriaLabel` ve `formatDefeatCrystalSummary` saf yardımcıları geliştirildi; 1 yeni birim test ile doğrulandı (toplam 175 istemci testi, 203 monorepo testi).
- [x] **Bağımsız Oyun Sonucu Kancası (`useGameOutcome.ts`):** Zafer konfeti eşiği, kişisel rekor (PB), yıldız hesabı, oyuncu adı yerel saklama ve liderlik tablosu puan gönderim yaşam döngüsü bağımsız `useGameOutcome` kancasına devredildi.
- [x] **Modüler Sonuç Modalları Mimarisi (`VictoryModal.tsx`, `DefeatModal.tsx`, `GameOutcomeModals.tsx`):** Zafer ve süre doldu modalları bağımsız alt bileşenlere ayrılarak `GameOutcomeModals.tsx` 271 satırdan **63 satıra** indirildi.

### Faz 94: Mobil Eşleştirme Modali, Pano Kancası ve Yuva Durum Motoru (Tamamlandı)
- [x] **Eşleşme Yuvası ve Pano Yardımcı Motoru (`pairingUtils.ts`, `pairing.test.mjs`):** `resolvePairingSlotStatus`, `formatPairingSlotLabel`, `resolveCopyButtonLabel` ve `formatRoomCodeDisplay` saf yardımcıları geliştirildi; 1 yeni birim test ile doğrulandı (toplam 176 istemci testi, 204 monorepo testi).
- [x] **Bağımsız Eşleştirme Modali Kancası (`usePairingModal.ts`):** Pano kopyalama zamanlayıcıları, tarayıcı adresi algılama, QR kod URL çözümü ve klavye moduna geçiş kancaya taşındı.
- [x] **Modüler Eşleştirme Arayüz Mimarisi (`PairingSlotSelector.tsx`, `PairingQRCodeCard.tsx`, `PairingModal.tsx`):** 1P/2P radyo grubu yuva seçici ve QR kod / oda kodu kartı bağımsız alt bileşenlere ayrılarak `PairingModal.tsx` 242 satırdan **88 satıra** indirildi.

### Faz 95: Masaüstü HUD Üst Çubuğu, Başlık Kancası ve Durum Kapsülleri Ayrışımı (Tamamlandı)
- [x] **HUD Başlık ve Durum Yardımcı Motoru (`hudUtils.ts`, `hudUtils.test.mjs`):** `resolveMultiplayerTooltip`, `resolvePairingButtonBadge` ve `formatVisibleTimerText` saf yardımcıları geliştirildi; 1 yeni birim test ile doğrulandı (toplam 177 istemci testi, 205 monorepo testi).
- [x] **Bağımsız Başlık Kancası (`useDesktopHeader.ts`):** Portal/kristal telemetrisi, oyun süresi formatlama, kontrolcü bağlantı durumu ve modal tetikleyicileri bağımsız `useDesktopHeader` kancasına taşındı.
- [x] **Modüler Üst Çubuk Arayüz Mimarisi (`HeaderBrandCapsule.tsx`, `HeaderStatusReadouts.tsx`, `HeaderActionButtons.tsx`, `DesktopHeader.tsx`):** Sol marka/bölüm kapsülü, sağ durum göstergeleri ve aksiyon butonları bağımsız bileşenlere ayrılarak `DesktopHeader.tsx` 184 satırdan **54 satıra** indirildi.

### Faz 96: Modüler Klavye ve Yardım Rehberi Modalı, Kısayol Veri Modeli Ayrışımı (Tamamlandı)
- [x] **Klavye ve Mobil Kılavuz Veri/Yardımcı Motoru (`keyboardShortcuts.ts`, `shortcuts.test.mjs`):** `SHORTCUT_GUIDE_GROUPS`, `MOBILE_GUIDE_FEATURES`, `formatShortcutKeyAriaLabel` ve `resolveShortcutGroupIconColor` saf modelleri ve yardımcıları geliştirildi; 1 yeni birim test ile doğrulandı (toplam 178 istemci testi, 206 monorepo testi).
- [x] **Modüler Kılavuz Bileşen Mimarisi (`ShortcutRow.tsx`, `ShortcutsSection.tsx`, `MobileFeaturesSection.tsx`, `HelpShortcutsModal.tsx`):** Kısayol satırları, kategori kartları ve mobil özellik rehberi bağımsız alt bileşenlere ayrılarak `HelpShortcutsModal.tsx` 174 satırdan **52 satıra** indirildi.

### Faz 97: Modüler Ayarlar Paneli, Çekmece Kancası ve Tercih Alt Çubuğu (Tamamlandı)
- [x] **Ayarlar ve Ses Geçişleri Yardımcı Motoru (`settingsUtils.ts`, `settingsUtils.test.mjs`):** `resolveVolumeTransition` ve `formatPreferenceAriaLabel` saf yardımcıları geliştirildi; 1 yeni birim test ile doğrulandı (toplam 179 istemci testi, 207 monorepo testi).
- [x] **Bağımsız Ayarlar Çekmecesi Kancası (`useSettingsDrawer.ts`):** Ses kademesi/sessize alma akışı, harita editörü ve skor tablosu geçişleri ile varsayılanlara sıfırlama eylemleri `useSettingsDrawer` kancasına taşındı.
- [x] **Modüler Ayarlar Alt Çubuğu Mimarisi (`SettingsDrawerFooter.tsx`, `SettingsModal.tsx`):** Harita editörü, skor tablosu ve sıfırlama butonları bağımsız `SettingsDrawerFooter` bileşeni olarak ayrıştırılarak `SettingsModal.tsx` 146 satırdan **78 satıra** indirildi.

### Faz 98: Kokpit Yapay Ufuk ve Canlı Radar Kancası, Telemetri Sütunu Ayrışımı (Tamamlandı)
- [x] **Yapay Ufuk ve Radar Yardımcı Motoru (`radarUtils.ts`, `radarUtils.test.mjs`):** `resolveAttitudeTransformStyle`, `calculateRadarDotTransform` ve `shouldThrottleTelemetryText` saf yardımcıları geliştirildi; 1 yeni birim test ile doğrulandı (toplam 180 istemci testi, 208 monorepo testi).
- [x] **Bağımsız Telemetri RAF Döngüsü Kancası (`useAttitudeTelemetryLoop.ts`):** 60 FPS yapay ufuk disk açısı, 2B mini-harita bilye koordinatları ve 10 Hz metin güncelleme döngüsü `useAttitudeTelemetryLoop` kancasına devredildi.
- [x] **Modüler Kokpit Telemetri Arayüz Mimarisi (`AttitudeTelemetryColumn.tsx`, `AttitudeGauge.tsx`):** Sayısal eğim, yatış ve hız göstergesi bağımsız `AttitudeTelemetryColumn` bileşeni olarak ayrılarak `AttitudeGauge.tsx` 160 satırdan **74 satıra** indirildi.

### Faz 99: Hızlı Kontroller Araç Çubuğu Ayrıştırması, Toolbar Kancası ve Alt Gruplar (Tamamlandı)
- [x] **Hızlı Sahne Kontrolleri Yardımcı Motoru (`quickControlsUtils.ts`, `quickControlsUtils.test.mjs`):** `resolveThemeToggleLabel`, `resolveSoundToggleLabel`, `formatCameraControlAriaLabel` ve `resolveNextCameraMode` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 185 istemci testi, 213 monorepo testi).
- [x] **Bağımsız Hızlı Kontroller Kancası (`useQuickControls.ts`):** Kamera modu döngüsü, ses açma/kapama, açık/koyu renk modu ve modal tetikleyicileri tek kancada toplandı.
- [x] **Modüler Araç Çubuğu Mimarisi (`ViewportAudioControls.tsx`, `ToolsControls.tsx`, `QuickControlsToolbar.tsx`):** Görünüm/ses kontrolleri ile araç kontrolleri bağımsız bileşenlere ayrıştırılarak `QuickControlsToolbar.tsx` 106 satırdan **46 satıra** indirildi.

### Faz 100: Modüler Masaüstü HUD Orkestratörü, Kanca ve Modallar Katmanı Ayrıştırması (Tamamlandı)
- [x] **Masaüstü HUD Katmanı Yardımcı Motoru (`desktopHudUtils.ts`, `desktopHudUtils.test.mjs`):** `calculateRemainingCrystals`, `resolveIsPortalUnlocked`, `resolveAnyOverlayOpen` ve `resolveLeaderboardInitialLevel` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 190 istemci testi, 218 monorepo testi).
- [x] **Bağımsız Masaüstü HUD Kancası (`useDesktopHUD.ts`):** Bölüm bilgisi, toplanan kristal hesaplaması, overlay açık durumu, oyun saati ve global kısayol bağlamları tek kancada toplandı.
- [x] **Modüler Modallar Katmanı ve Yalın Orkestratör (`DesktopModalsLayer.tsx`, `DesktopHUD.tsx`):** Editör, Ayarlar, Yardım, Eşleştirme, Skor Tablosu ve Sonuç pencereleri `DesktopModalsLayer` bileşenine taşınarak `DesktopHUD.tsx` 97 satırdan **54 satıra** indirildi.

### Faz 101: Alt Bölge Kontrolleri ve Klavye İpuçları Ayrıştırması (Tamamlandı)
- [x] **Alt Panel Kontrol ve İpucu Yardımcı Motoru (`footerControlsUtils.ts`, `footerControlsUtils.test.mjs`):** `shouldShowKeyboardHints` ve `resolveMultiplayerSlotHints` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 194 istemci testi, 222 monorepo testi).
- [x] **Modüler Klavye İpuçları Bileşeni (`FooterKeyboardHints.tsx`):** Tek ve çok oyunculu modlar için dinamik tuş eşleşmesi ve yuva ayrımı bağımsız `FooterKeyboardHints` bileşeni olarak ayrıştırıldı.
- [x] **Yalın Masaüstü Alt Paneli (`DesktopFooterControls.tsx`):** Gösterge, ipucu ve araç çubuğu yapısı modüler alt bileşenlerle bağlanarak `DesktopFooterControls.tsx` 88 satırdan **49 satıra** indirildi.

### Faz 102: Sahne Üstü Bildirim ve Kurtarma Çubuğu Ayrıştırması (Tamamlandı)
- [x] **Sahne Üstü Bildirim ve Çubuk Yardımcı Motoru (`overlayBarUtils.ts`, `overlayBarUtils.test.mjs`):** `shouldShowPauseRecoveryBar` ve `getToastMotionVariants` saf yardımcıları geliştirildi; 3 yeni birim test ile doğrulandı (toplam 197 istemci testi, 225 monorepo testi).
- [x] **Modüler Kurtarma Çubuğu ve Bildirim Kartı (`PauseRecoveryBar.tsx`, `HudNotificationToast.tsx`):** Bağlantı kopmasında duraklatma/devam barı ile framer-motion tabanlı toast kartı bağımsız bileşenlere ayrıştırıldı.
- [x] **Yalın Sahne Üstü Orkestratörü (`DesktopHUDOverlays.tsx`):** Bildirim ve kurtarma mantığı modüler alt bileşenlerle birleştirilerek `DesktopHUDOverlays.tsx` 87 satırdan **38 satıra** indirildi.

### Faz 103: Modüler Harita Editörü Kancası ve Modal İnce Mimarisi (Tamamlandı)
- [x] **Harita Editörü Eylemleri Yardımcı Motoru (`editorActionUtils.ts`, `editorActionUtils.test.mjs`):** `buildInitialEditorGrid`, `createShareUrl` ve `detectClipboardMapType` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 201 istemci testi, 229 monorepo testi).
- [x] **Bağımsız Harita Editörü Kancası (`useLevelEditor.ts`):** Izgara durumu, araç seçimi, rastgele üretim, şablon uygulama, pano dışa/içe aktarımı ve anında oynama akışı tek kancada toplandı.
- [x] **Modüler Harita Editörü Modalı (`LevelEditorModal.tsx`):** Araç çubuğu, ızgara, şablonlar, meta kontroller ve alt çubuk bileşenleri yalın bir deklaratif yapıyla bağlanarak `LevelEditorModal.tsx` 249 satırdan **78 satıra** indirildi.

### Faz 104: Modüler Mobil Kontrolcü Orkestrasyonu, Kanca ve Merkez Sahne Ayrıştırması (Tamamlandı)
- [x] **Mobil Orkestrasyon Yardımcı Motoru (`controllerOrchestrationUtils.ts`, `controllerOrchestrationUtils.test.mjs`):** `resolveCenterStageMode` ve `handleSlotSelection` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 206 istemci testi, 234 monorepo testi).
- [x] **Modüler Kontrolcü Merkez Sahnesi (`ControllerCenterStage.tsx`):** Oda kodu girişi, sensör izni ve canlı gimbal pad görünümleri `ControllerCenterStage` bileşeni altında modülerleştirildi.
- [x] **Bağımsız Mobil Kontrolcü Kancası ve Yalın Sayfa (`useMobileController.ts`, `controller/page.tsx`):** Tüm sensör, oda, soket ve gimbal durumları tek kancada toplanarak `page.tsx` 268 satırdan **150 satıra** indirildi.

### Faz 105: Mobil Kontrolcü Başlık Çubuğu Ayrıştırması (Tamamlandı)
- [x] **Mobil Başlık Yardımcı Motoru (`controllerHeaderUtils.ts`, `controllerHeaderUtils.test.mjs`):** `resolveHapticButtonLabel`, `resolveRoomCodeButtonLabel`, `resolveConnectionAriaLabel` ve `resolvePlayerSlotBadgeClasses` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 211 istemci testi, 239 monorepo testi).
- [x] **Modüler Başlık Eylemleri ve Marka Kapsülü (`ControllerBrandCapsule.tsx`, `ControllerHeaderActions.tsx`):** Sol marka ve P1/P2 rozeti ile sağ taraftaki titreşim, tema, oda kodu ve bağlantı kapsülü bağımsız bileşenlere ayrıştırıldı.
- [x] **Yalın Mobil Kontrolcü Başlığı (`ControllerHeader.tsx`):** Başlık yapısı alt bileşenlerle birleştirilerek `ControllerHeader.tsx` 154 satırdan **52 satıra** indirildi.

### Faz 106: Mobil Kontrolcü Durum ve Bölüm Şeritleri Ayrıştırması (Tamamlandı)
- [x] **Mobil Durum Şeritleri Yardımcı Motoru (`controllerBannerUtils.ts`, `controllerBannerUtils.test.mjs`):** `shouldShowLevelNavBanner`, `shouldShowVictoryBanner`, `shouldShowDefeatBanner` ve `isPrevLevelDisabled` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 216 istemci testi, 244 monorepo testi).
- [x] **Modüler Durum ve Gezinme Şeritleri (`ControllerErrorBanner.tsx`, `ControllerLevelNavBanner.tsx`, `ControllerVictoryBanner.tsx`, `ControllerDefeatBanner.tsx`):** Hata bildirimi, bölüm/kristal navigasyonu, zafer kutlaması ve süre doldu uyarı kartları bağımsız alt bileşenlere ayrıştırıldı.
- [x] **Yalın Mobil Durum Şeritleri Orkestratörü (`ControllerStatusBanners.tsx`):** Tüm bildirim ve oyun sonu kartları modüler yapıyla bağlanarak `ControllerStatusBanners.tsx` 155 satırdan **55 satıra** indirildi.

### Faz 107: Mobil Kontrolcü Alt Araç Çubuğu Ayrıştırması (Tamamlandı)
- [x] **Mobil Alt Çubuk Yardımcı Motoru (`controllerFooterUtils.ts`, `controllerFooterUtils.test.mjs`):** `isResetBallDisabled`, `resolveRecalibrateAriaLabel` ve `resolveResetBallAriaLabel` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 220 istemci testi, 248 monorepo testi).
- [x] **Modüler Alt Eylem Butonları (`RecalibrateButton.tsx`, `ResetBallButton.tsx`):** Kalibrasyon ve topu sıfırlama butonları bağımsız, erişilebilir alt bileşenlere ayrıştırıldı.
- [x] **Yalın Mobil Kontrolcü Alt Çubuğu (`ControllerFooter.tsx`):** Buton yerleşimi modüler alt bileşenlerle bağlanarak `ControllerFooter.tsx` 46 satırdan **32 satıra** indirildi.

### Faz 108: Mobil Gimbal Pad Arayüzü ve Radyo Kontrolcüleri Ayrıştırması (Tamamlandı)
- [x] **Mobil Gimbal Pad Yardımcı Motoru (`gimbalPadUtils.ts`, `gimbalPadUtils.test.mjs`):** `resolveGimbalInstructionText`, `shouldShowPairingStatus`, `shouldShowSensorTimeoutStatus` ve `resolveGimbalDotClasses` saf yardımcıları geliştirildi; 6 yeni birim test ile doğrulandı (toplam 226 istemci testi, 254 monorepo testi).
- [x] **Modüler Gimbal Bileşenleri (`GimbalTouchSurface.tsx`, `GimbalInstructionStatus.tsx`, `GimbalPitchRollReadout.tsx`, `GimbalControlSelectors.tsx`):** Dokunmatik gimbal yüzeyi, kılavuz/uyarı durumu, eğim/dönüş telemetri okuması ve hassasiyet/yuva radyo grupları bağımsız alt bileşenlere ayrıştırıldı.
- [x] **Yalın Mobil Gimbal Pad Orkestratörü (`ControllerGimbalPad.tsx`):** Dokunmatik etkileşim ve radyo kontrolleri modüler alt bileşenlerle birleştirilerek `ControllerGimbalPad.tsx` 263 satırdan **70 satıra** indirildi.

### Faz 109: Mobil Oda Kartı ve Son Odalar Listesi Ayrıştırması (Tamamlandı)
- [x] **Mobil Oda Kartı Yardımcı Motoru (`roomCardUtils.ts`, `roomCardUtils.test.mjs`):** `validateRoomCodeInput`, `shouldShowCloseButton`, `formatRecentRoomAriaLabel` ve `isSubmitDisabled` saf yardımcıları geliştirildi; 7 yeni birim test ile doğrulandı (toplam 233 istemci testi, 261 monorepo testi).
- [x] **Modüler Oda Kartı Bileşenleri (`RoomCardHeader.tsx`, `RoomCodeInput.tsx`, `RecentRoomsList.tsx`, `RoomConnectButton.tsx`):** Başlık ve kapatma düğmesi, 6 haneli kod girişi, son kullanılan odalar listesi ve bağlan butonu bağımsız alt bileşenlere ayrıştırıldı.
- [x] **Yalın Mobil Oda Kartı Orkestratörü (`ControllerRoomCard.tsx`):** Form yapısı alt bileşenlerle birleştirilerek `ControllerRoomCard.tsx` 110 satırdan **54 satıra** indirildi.

### Faz 110: Mobil Sensör Kartı ve Güvensiz Bağlam Uyarısı Ayrıştırması (Tamamlandı)
- [x] **Mobil Sensör Kartı Yardımcı Motoru (`sensorCardUtils.ts`, `sensorCardUtils.test.mjs`):** `shouldShowInsecureWarning`, `resolveInsecureContextNotice` ve `resolveSensorActionAriaLabels` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 237 istemci testi, 265 monorepo testi).
- [x] **Modüler Sensör Kartı Bileşenleri (`SensorCardHeader.tsx`, `InsecureContextWarning.tsx`, `SensorActionButtons.tsx`):** Kalkan ikonu ve başlık alanı, HTTP güvensiz bağlam uyarı notu ve sensör/dokunmatik eylem butonları bağımsız alt bileşenlere ayrıştırıldı.
- [x] **Yalın Mobil Sensör Kartı Orkestratörü (`ControllerSensorCard.tsx`):** Düzen alt bileşenlerle bağlanarak `ControllerSensorCard.tsx` 58 satırdan **28 satıra** indirildi.

### Faz 111: Arayüz Temel Bileşenleri Motoru ve Primitives Ayrıştırması (Tamamlandı)
- [x] **Arayüz Temel Bileşenleri Yardımcı Motoru (`primitiveUtils.ts`, `primitiveUtils.test.mjs`):** `cx`, `getModalWidthClass`, `formatShortcutTitle` ve `calculateNextRadioIndex` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 242 istemci testi, 270 monorepo testi).
- [x] **WAI-ARIA Yön Tuşu ve Başlık Standardizasyonu (`primitives.tsx`):** `calculateNextRadioIndex` entegrasyonu ile radyo gruplarında klavye yön tuşu (Ok / Home / End) döngüsü güvenceye alındı; `IconButton` ve `Modal` genişlik sınıfları saf motor üzerinden standartlaştırıldı.

### Faz 112: Zafer Konfeti Motoru, Canvas Kancası ve Yalın Bileşen Ayrıştırması (Tamamlandı)
- [x] **Konfeti Canvas Yardımcı Motoru (`celebrationCanvasUtils.ts`, `celebrationCanvasUtils.test.mjs`):** `calculateCelebrationOrigins`, `createDualCelebrationBurst`, `stepCelebrationParticles` ve `renderParticle` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 247 istemci testi, 275 monorepo testi).
- [x] **Bağımsız Konfeti Canvas Kancası (`useCelebrationCanvas.ts`):** 2B Canvas yeniden boyutlandırma dinleyicisi, rAF çizim döngüsü ve temizleme mantığı tek kancada soyutlandı.
- [x] **Yalın Zafer Konfeti Bileşeni (`CelebrationCanvas.tsx`):** Karmaşık çizim döngüsü kancaya devredilerek `CelebrationCanvas.tsx` 94 satırdan **23 satıra** indirildi.

### Faz 113: Canlı 2B Mini-Harita Radarı ve Nokta İşaretçileri Ayrıştırması (Tamamlandı)
- [x] **Radar İşaretçi ve Yüzde Yardımcı Motoru (`radarUtils.ts`, `radarUtils.test.mjs`):** `resolveGoalMarkerClasses`, `resolvePlayerMarkerClasses` ve `calculateCrystalPercentages` saf yardımcıları geliştirildi; 8 birim test ile doğrulandı (toplam 249 istemci testi, 277 monorepo testi).
- [x] **Modüler Radar İşaretçi Bileşenleri (`RadarGoalMarker.tsx`, `RadarCrystalMarkers.tsx`, `RadarPlayerMarkers.tsx`):** Hedef portalı rengi, kalan kristallerin döngüsü ve 1P/2P bilye transform noktaları bağımsız alt bileşenlere ayrıştırıldı.
- [x] **Yalın 2B Radar Bileşeni (`MiniMapRadar.tsx`):** DOM işaretçileri alt bileşenlere devredilerek `MiniMapRadar.tsx` 85 satırdan **56 satıra** indirildi.

### Faz 114: 3B Sahne Fizik Küreleri ve Tahta Taban Geometrisi Ayrıştırması (Tamamlandı)
- [x] **3B Sahne Geometrisi ve Fizik Başlangıç Yardımcı Motoru (`stageUtils.ts`, `stageUtils.test.mjs`):** `resolveBoardBaseConfig`, `resolveGridHelperConfig` ve `resolveBallSpawnPosition` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 253 istemci testi, 281 monorepo testi).
- [x] **Modüler Sahne Tabanı ve Fizik Bilyeleri (`MazeStageBoardBase.tsx`, `MazeStagePhysicsBalls.tsx`):** Zemin mesh'i, aydınlık/karanlık ızgara yardımcısı ve 1P/2P sıfır zıplamalı dinamik Rapier fizik küreleri bağımsız bileşenlere ayrıştırıldı.
- [x] **Daha Sade 3B Sahne Orkestratörü (`MazeStage.tsx`):** Zemin ve dinamik küre blokları alt bileşenlere devredilerek `MazeStage.tsx` 509 satırdan **460 satıra** indirildi.

### Faz 115: 3B Sahne Kare Döngüsü Kancası ve Etkileşim Motoru Ayrıştırması (Tamamlandı)
- [x] **3B Sahne Kare Döngüsü Yardımcı Motoru (`stageLoopUtils.ts`, `stageLoopUtils.test.mjs`):** `resolveIsInteractive`, `stepHazardElapsed` ve `resolveP2BallVisibility` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 257 istemci testi, 285 monorepo testi).
- [x] **Bağımsız Sahne Kare Döngüsü Kancası (`useMazeStageFrameLoop.ts`):** Eğim ivmesi, slerp yumuşatma, kristal/lazer/engel animasyonları, hayalet yarışçı ve 1P/2P etkileşim döngüsü tek kancada toplandı.
- [x] **Yalın 3B Sahne Orkestratörü (`MazeStage.tsx`):** `useFrame` blokları kancaya devredilerek `MazeStage.tsx` 460 satırdan **280 satıra** indirildi.

### Faz 116: WebGL Bağlam Kurtarma Kancası, Sahne Konfigürasyonu ve Yalın 3B Tuval Ayrıştırması (Tamamlandı)
- [x] **3B Sahne Konfigürasyon Yardımcı Motoru (`sceneConfigUtils.ts`, `sceneConfigUtils.test.mjs`):** `isLightSceneActive`, `resolveSceneColors` ve `calculateShadowMargin` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 261 istemci testi, 289 monorepo testi).
- [x] **Bağımsız WebGL Bağlam Kurtarma Kancası (`useWebGLContextRecovery.ts`):** WebGL bağlam kesilmesi (`webglcontextlost`) ve geri yüklenmesi (`webglcontextrestored`) dinleyicileri, revizyon sayacı ve temizleme mantığı tek kancada toplandı.
- [x] **Modüler Kurtarma Kartı ve Yalın 3B Sahne (`ContextLostFallback.tsx`, `MazeScene.tsx`):** Bağlam kesintisi arayüzü alt bileşene devredilip `MazeScene.tsx` 149 satırdan **88 satıra** indirildi.

### Faz 117: Bağımsız 3B Kamera Teçhizatı Kancası ve Yalın Rig Ayrıştırması (Tamamlandı)
- [x] **Kamera Eğim ve FOV Yardımcı Motoru (`sceneCameraUtils.ts`, `sceneCameraUtils.test.mjs`):** `calculateCameraClampedTilt` ve `calculateNextCameraFov` saf yardımcıları geliştirildi; test kapsamı 9 birim teste genişletildi (toplam 263 istemci testi, 291 monorepo testi).
- [x] **Bağımsız Kamera Teçhizatı Kancası (`useMazeCameraRig.ts`):** İzometrik, takip ve kuş bakışı hedef takibi, sönümleme (lerp) ve sinematik dinamik FOV döngüsü tek kancada toplandı.
- [x] **Yalın Kamera Rig Bileşeni (`MazeCameraRig.tsx`):** Kamera teçhizat döngüsü kancaya devredilerek `MazeCameraRig.tsx` 87 satırdan **14 satıra** indirildi.

### Faz 118: 3B Sahne Tehlikeler ve Kinetik Alanlar Ayrıştırması (Tamamlandı)
- [x] **Sahne Tehlikeleri Geometri ve Dönüşüm Motoru (`hazardUtils.ts`, `hazardUtils.test.mjs`):** Tuzak delik yarıçapları `resolveVoidHoleRadii`, kinetik rampalar `resolveBoostPadTransform`, lazer sütunları ve ışın kafesleri `resolveLaserGatePillars` ile portal koordinatları `flattenTeleporterPortals` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 268 istemci testi, 296 monorepo testi).
- [x] **Modüler Tehlike ve Dinamik Alan Bileşenleri (`HazardVoidHoles.tsx`, `HazardBoostPads.tsx`, `HazardTeleporters.tsx`, `HazardLaserGates.tsx`, `HazardMovingObstacles.tsx`):** Tuzak delikleri, hızlandırma rampaları, kuantum portalları, lazer kapıları ve kinetik devriye engelleri bağımsız alt bileşenlere ayrıştırıldı.
- [x] **Yalın Tehlikeler Orkestratörü (`MazeStageHazards.tsx`):** Karmaşık gömülü Three.js geometrileri alt bileşenlere devredilerek `MazeStageHazards.tsx` 170 satırdan **53 satıra** indirildi.

### Faz 119: 3B Sabit Fizik Çarpıştırıcıları ve Sensörler Ayrıştırması (Tamamlandı)
- [x] **Çarpıştırıcı ve Sensör Yardımcı Motoru (`sceneColliderUtils.ts`, `sceneColliderUtils.test.mjs`):** Modal açık kontrolü `isAnyOverlayModalOpen`, hedef bilye çözücü `resolveTargetBallBody` ve bitiş rotası seçici `resolveGoalRunPath` saf yardımcıları geliştirildi; 3 yeni birim test ile doğrulandı (toplam 271 istemci testi, 299 monorepo testi).
- [x] **Modüler Fizik Çarpıştırıcı Bileşenleri (`ColliderWalls.tsx`, `ColliderGoalSensor.tsx`, `ColliderHoleSensors.tsx`):** Katı duvarlar, bitiş portalı temas sensörü ve tuzak deliği tetikleyicileri Rapier alt bileşenlerine ayrıştırıldı.
- [x] **Yalın Çarpıştırıcılar Orkestratörü (`MazeStageColliders.tsx`):** Sabit Rapier RigidBody orkestrasyonu yalınlaştırılarak `MazeStageColliders.tsx` 140 satırdan **68 satıra** indirildi.

### Faz 120: 3B Toplanabilirler, Başlangıç Halkası ve Hedef Portalı Ayrıştırması (Tamamlandı)
- [x] **Toplanabilirler ve Geçit Yardımcı Motoru (`collectiblesUtils.ts`, `collectiblesUtils.test.mjs`):** Hedef portalı ışık ve materyalleri `resolveGoalPortalVisuals`, kristal görünürlüğü `isCrystalVisible` ve başlangıç konumu `resolveStartRingPosition` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 276 istemci testi, 304 monorepo testi).
- [x] **Modüler Toplanabilir ve Geçit Bileşenleri (`CollectibleStartRing.tsx`, `CollectibleCrystals.tsx`, `CollectibleGoalPortal.tsx`):** Başlangıç halkası, enerji kristalleri ve kilitli/açık hedef portalı bağımsız Three.js alt bileşenlerine ayrıştırıldı.
- [x] **Yalın Toplanabilirler Orkestratörü (`MazeStageCollectibles.tsx`):** 3B toplanabilirler ve geçit geometrileri devredilerek `MazeStageCollectibles.tsx` 104 satırdan **48 satıra** indirildi.

### Faz 121: 3B Sahne Aktörleri ve Hareket İzi Ayrıştırması (Tamamlandı)
- [x] **Aktör Geometri ve Başlangıç Yardımcı Motoru (`sceneActorUtils.ts`, `sceneActorUtils.test.mjs`):** Hareket izi başlangıç dönüşümü `resolveTrailInitialTransform` saf yardımcısı geliştirildi; test kapsamı 13 teste çıkarıldı (toplam 277 istemci testi, 305 monorepo testi).
- [x] **Modüler 3B Aktör Bileşenleri (`ActorMotionTrail.tsx`, `ActorGhostBall.tsx`, `ActorPlayerBalls.tsx`):** Neon hareket izi halkaları, hayalet yarışçı hologram küresi ve 1P/2P oyuncu bilyeleri bağımsız alt bileşenlere ayrıştırıldı.
- [x] **Yalın Sahne Aktörleri Orkestratörü (`MazeStageActors.tsx`):** Doğrudan Three.js aktör geometrileri devredilerek `MazeStageActors.tsx` 91 satırdan **46 satıra** indirildi.

### Faz 122: 3B Labirent Duvarları ve Geometri Ayrıştırması (Tamamlandı)
- [x] **Duvar Geometri ve Anahtar Yardımcı Motoru (`wallUtils.ts`, `wallUtils.test.mjs`):** Tutarli React anahtarları `resolveWallKey`, boyut doğrulama `formatWallGeometryArgs` ve 3B hacim hesabı `calculateWallVolume` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 281 istemci testi, 309 monorepo testi).
- [x] **Modüler 3B Duvar Bileşenleri (`StageOuterWalls.tsx`, `StageInnerWalls.tsx`):** Dış sınır ve iç labirent duvarları bağımsız Three.js alt bileşenlerine ayrıştırıldı.
- [x] **Yalın Duvarlar Orkestratörü (`MazeStageWalls.tsx`):** Duvar geometrileri alt bileşenlere devredilerek `MazeStageWalls.tsx` 53 satırdan **33 satıra** indirildi.

### Faz 123: 3B Sahne Orkestrasyonu ve Ref Yaşam Döngüsü Kancası (Tamamlandı)
- [x] **Sahne Orkestrasyonu ve Hız Yardımcı Motoru (`stageOrchestrationUtils.ts`, `stageOrchestrationUtils.test.mjs`):** Açık zemin teması `isLightBoardTheme`, XZ bilye hız büyüklüğü `calculateBallVelocitySpeed` ve zaman aşımlı duvar sesi denetimi `shouldTriggerWallSound` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 285 istemci testi, 313 monorepo testi).
- [x] **Bağımsız Sahne Orkestrasyon Kancası (`useMazeStageOrchestration.ts`):** 13 adet Three.js/Rapier ref nesnesi, sıfırlama kancaları, hareket izi, hayalet yarışçı, bilye etkileşimleri ve 60 FPS kare döngüsü tek bir kancada konsolide edildi.
- [x] **Yalın Sahne Görsel Şablonu (`MazeStage.tsx`):** Tüm yan etkiler ve orkestrasyon devredilerek `MazeStage.tsx` 280 satırdan **132 satıra** indirildi.

### Faz 124: Zafer Modalı Arayüzü ve Skor Gönderim Ayrıştırması (Tamamlandı)
- [x] **Zafer Modalı ve Skor Yardımcı Motoru (`victoryModalUtils.ts`, `victoryModalUtils.test.mjs`):** Skor formu görünürlüğü `shouldShowScoreSubmitForm`, çok oyunculu kazanan kontrolü `shouldShowMultiplayerWinner`, yıldız doluluğu `isStarFilled` ve buton metni `formatSubmitButtonText` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 290 istemci testi, 318 monorepo testi).
- [x] **Modüler Zafer Arayüz Bileşenleri (`VictoryWinnerBadge.tsx`, `VictoryStarsRow.tsx`, `VictoryTimeReadout.tsx`, `VictoryScoreSubmitForm.tsx`):** Kazanan rozeti, yıldız gösterimi, süre/PB rozeti ve liderlik tablosu formu bağımsız alt bileşenlere ayrıştırıldı.
- [x] **Yalın Zafer Modalı (`VictoryModal.tsx`):** Alt bileşen mimarisine geçirilerek `VictoryModal.tsx` 170 satırdan **88 satıra** indirildi.

### Faz 126: Harita Editörü Araç Çubuğu ve Butonları Ayrıştırması (Tamamlandı)
- [x] **Araç Çubuğu ve Palet Yardımcı Motoru (`editorToolbarUtils.ts`, `editorToolbarUtils.test.mjs`):** 10 adet editör araç tanımı (`TOOLS`, `TOOL_BY_ID`), araç arama `getToolDefinition`, aktiflik denetimi `isToolActive` ve dinamik stil hesaplayıcı `resolveToolButtonClass` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 301 istemci testi, 329 monorepo testi).
- [x] **Modüler Araç Butonu Bileşeni (`EditorToolButton.tsx`):** Tekil araç butonu, erişilebilir radyo semantiği ve ikon/etiket yerleşimi bağımsız bileşene ayrıştırıldı.
- [x] **Yalın Araç Çubuğu Orkestratörü (`LevelEditorToolbar.tsx`):** Araç listesi ve durum eşlemesi sadeleştirilerek `LevelEditorToolbar.tsx` 159 satırdan **45 satıra** indirildi ve `TOOLS`, `TOOL_BY_ID` geriye dönük re-export uyumluluğu korundu.

### Faz 127: Harita Editörü Alt Çubuğu ve Eylemleri Ayrıştırması (Tamamlandı)
- [x] **Alt Çubuk Durum ve Hata Yardımcı Motoru (`editorFooterUtils.ts`, `editorFooterUtils.test.mjs`):** JSON ve bağlantı kopyalama butonu durumu `resolveCopyButtonState`, içe aktarma hatası görünürlüğü `shouldShowImportError` ve hata metni temizleyici `formatImportErrorMessage` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 306 istemci testi, 334 monorepo testi).
- [x] **Modüler Editör Alt Bileşenleri (`EditorImportErrorAlert.tsx`, `EditorGridActions.tsx`, `EditorPlayButton.tsx`):** İçe aktarma hatası uyarısı, ızgara yardımcı aksiyonları (temizle, rastgele, kopyala, panodan yükle) ve birincil "Bu haritayı oyna" butonu bağımsız bileşenlere ayrıştırıldı.
- [x] **Yalın Editör Alt Çubuğu (`LevelEditorFooter.tsx`):** Alt bileşen mimarisine geçirilerek `LevelEditorFooter.tsx` 112 satırdan **45 satıra** indirildi.

### Faz 128: Harita Editörü Üst Bilgi ve Başlık/Boyut Seçici Ayrıştırması (Tamamlandı)
- [x] **Üst Bilgi ve Boyut Yardımcı Motoru (`editorMetaUtils.ts`, `editorMetaUtils.test.mjs`):** Başlık temizleme `sanitizeMapTitle`, tahta boyutu etiketi formatlayıcı `formatBoardSizeLabel`, boyut seçili denetimi `isBoardSizeSelected` ve dinamik stil sınıfı `resolveBoardSizeButtonClass` saf yardımcıları geliştirildi; 6 yeni birim test ile doğrulandı (toplam 312 istemci testi, 340 monorepo testi).
- [x] **Modüler Üst Bilgi Bileşenleri (`EditorTitleInput.tsx`, `EditorBoardSizeSelector.tsx`):** Harita adı metin girişi ve erişilebilir radyo semantiğine sahip tahta boyutu seçici buton grubu bağımsız bileşenlere ayrıştırıldı.
- [x] **Yalın Editör Üst Meta Kontrolleri (`LevelEditorMetaControls.tsx`):** Grid düzeni sadeleştirilerek `LevelEditorMetaControls.tsx` 84 satırdan **35 satıra** indirildi.

### Faz 129: Harita Editörü Hazır Şablonlar Listesi ve Şablon Kartı Ayrıştırması (Tamamlandı)
- [x] **Şablon Listesi ve Kart Yardımcı Motoru (`editorTemplateListUtils.ts`, `editorTemplateListUtils.test.mjs`):** Şablon butonu ARIA etiketi `getTemplateCardAriaLabel`, şablon kartı hover/geçiş sınıfları `resolveTemplateCardClass` ve şablon kimlik denetimi `isTemplateMatchingId` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 316 istemci testi, 344 monorepo testi).
- [x] **Modüler Şablon Bileşenleri (`EditorTemplatesHeader.tsx`, `EditorTemplateCard.tsx`):** "Hazır şablonlar" + "Hızlı başla" rozet başlığı ve tekil şablon seçim butonu bağımsız bileşenlere ayrıştırıldı.
- [x] **Yalın Şablonlar Paleti (`LevelEditorTemplatesList.tsx`):** Alt bileşen mimarisine geçirilerek `LevelEditorTemplatesList.tsx` 42 satırdan **31 satıra** indirildi.

### Faz 130: Harita Editörü 8x8 Izgara Hücresi ve Çizim Ayrıştırması (Tamamlandı)
- [x] **Izgara Gezinim ve Hücre Yardımcı Motoru (`editorGridUtils.ts`, `editorGridUtils.test.mjs`):** 2B klavye ok ve Home/End tuş gezinimi `calculateNextGridCoords`, hücre ARIA etiketi formatlayıcı `formatCellAriaLabel` ve dinamik stil hesaplayıcı `resolveGridCellClass` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 320 istemci testi, 348 monorepo testi).
- [x] **Modüler Izgara Hücre Bileşeni (`EditorGridCell.tsx`):** 8x8 ızgaradaki tekil hücre butonu, erişilebilir gridcell rolü ve tık/tuş olayları bağımsız bileşene ayrıştırıldı.
- [x] **Yalın Editör Çizim Izgarası (`LevelEditorGrid.tsx`):** Grid JSX haritalaması ve hücre durumları sadeleştirilerek `LevelEditorGrid.tsx` 79 satırdan **45 satıra** indirildi.

### Faz 131: Harita Editörü Orkestrasyonu ve Pano Ayrıştırması (Tamamlandı)
- [x] **Orkestrasyon ve Pano Yardımcı Motoru (`editorOrchestrationUtils.ts`, `editorOrchestrationUtils.test.mjs`):** Dışa aktarma denetimi `canExportGrid`, JSON/link yük çözümleyici `resolveExportPayload`, panodan harita yükleme `parseClipboardMapData` ve başlangıç değer yardımcıları (`getEditorInitialTitle`, `getEditorInitialBoardSize`) saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 325 istemci testi, 353 monorepo testi).
- [x] **Yalın Editör Kancası (`useLevelEditor.ts`):** Pano/şema mantığı motor fonksiyonlarına devredilerek `useLevelEditor.ts` 204 satırdan **139 satıra** indirildi.
- [x] **Kapsamlı Editör Modalı Mimarisi (`LevelEditorModal.tsx`):** Araç paleti, şablon listesi, meta kontrolleri, çizim ızgarası ve alt çubuk alt bileşenleri tam uyum içinde konsolide edildi.

### Faz 132: UI İlkel Bileşenleri, Dialog Kancası ve Modallar Ayrıştırması (Tamamlandı)
- [x] **Dialog Odak ve Tuş Yardımcı Motoru (`dialogBehaviorUtils.ts`, `dialogBehaviorUtils.test.mjs`):** Odaklanabilir öğe seçicisi `FOCUSABLE_ELEMENTS_SELECTOR`, Escape/Tab tuş denetleyicileri ve döngüsel odak çözümleyici `resolveNextFocusElement` saf yardımcıları geliştirildi; 6 yeni birim test ile doğrulandı (toplam 331 istemci testi, 359 monorepo testi).
- [x] **Modüler İlkel Bileşenler (`useDialogBehavior.ts`, `Modal.tsx`, `Drawer.tsx`, `Buttons.tsx`, `FormControls.tsx`, `DisplayPrimitives.tsx`):** Pencere/panel odak tuzağı kancası, modal pencere, sağ çekmece paneli, ikon/metin butonları, radyo grupları/anahtarlar ve etiket elemanları bağımsız modüllere ayrıştırıldı.
- [x] **Yalın UI Primitives Barrel Dosyası (`primitives.tsx`):** Monolitik yapı saf re-export mimarisine dönüştürülerek `primitives.tsx` 525 satırdan **42 satıra** indirildi ve geriye dönük tam uyumluluk korundu.

### Faz 133: Mobil Kontrolcü Eğim ve Seçici Kontrolleri Ayrıştırması (Tamamlandı)
- [x] **Gimbal Seçici Buton Yardımcı Motoru (`gimbalSelectorUtils.ts`, `gimbalSelectorUtils.test.mjs`):** Eğim modu buton stili `resolveGimbalModeButtonClass`, hassasiyet çarpanı butonu stili `resolveSensitivityButtonClass` ve 1P/2P yuva butonu stili `resolveSlotButtonClass` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 335 istemci testi, 363 monorepo testi).
- [x] **Modüler Eğim Seçici Bileşenleri (`GimbalModeSelector.tsx`, `GimbalSensitivitySelector.tsx`, `GimbalSlotSelector.tsx`):** Jiroskop/Dokunmatik modu seçici, 0.75x..1.35x hassasiyet seçici ve çok oyunculu oyuncu yuvası seçici radyo grupları bağımsız modüllere ayrıştırıldı.
- [x] **Yalın Eğim Kontrolleri Orkestratörü (`GimbalControlSelectors.tsx`):** Seçici bileşen mimarisine geçirilerek `GimbalControlSelectors.tsx` 144 satırdan **38 satıra** indirildi.



### Faz 136: Ayarlar Modalı Ses ve Ekran Katmanları Ayrıştırması (Tamamlandı)
- [x] **Ses ve Katman Yardımcı Motoru (`audioOverlaysUtils.ts`, `audioOverlaysUtils.test.mjs`):** Katman konfigürasyonları `OVERLAY_SWITCH_CONFIGS`, erişilebilir anahtar etiketi `formatOverlayToggleAriaLabel`, katman arama `getOverlaySwitchConfig` ve ses düzeyi metin formatlayıcı `formatVolumeAriaLabel` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 350 istemci testi, 378 monorepo testi).
- [x] **Modüler Ses ve Katman Bileşenleri (`AudioVolumeControl.tsx`, `OverlaysSwitchGroup.tsx`):** Ses şiddeti göstergesi ve Segmented seçici bileşeni ile Neon hareket izi, 3B hayalet yarışçı, 2B canlı radar ve Mobil titreşim switch grubu bağımsız modüllere ayrıştırıldı.
- [x] **Yalın Ses ve Katmanlar Orkestratörü (`SettingsAudioOverlaysSection.tsx`):** Alt bileşen mimarisine geçirilerek `SettingsAudioOverlaysSection.tsx` 81 satırdan **53 satıra** indirildi.

### Faz 137: Ayarlar Modalı Oyun Modu ve Oyuncu Sayısı Ayrıştırması (Tamamlandı)
- [x] **Oyun Modu Seçenekleri ve Oyuncu Sayısı Yardımcı Motoru (`gameModeSectionUtils.ts`, `gameModeSectionUtils.test.mjs`):** Oyuncu sayısı seçenekleri `PLAYER_COUNT_OPTIONS`, süre kuralı seçenekleri `GAME_MODE_RULE_OPTIONS`, seçimden boolean türetici `resolvePlayerCountValue` / `isMultiplayerValue` ve erişilebilir mod etiketi `formatGameModeAriaLabel` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 356 istemci testi, 384 monorepo testi).
- [x] **Modüler Oyun Modu Seçici Bileşenleri (`GameModePlayerCountSelector.tsx`, `GameModeRuleSelector.tsx`):** 1P solo vs 2P 1v1 duo seçici ve dinamik rehber metni ile Standart vs Süreye karşı kural seçici bağımsız modüllere ayrıştırıldı.
- [x] **Yalın Oyun Modu Orkestratörü (`SettingsGameModeSection.tsx`):** Alt bileşen mimarisine geçirilerek `SettingsGameModeSection.tsx` 63 satırdan **35 satıra** indirildi.

### Faz 138: Ayarlar Modalı Fizik ve Kontrol Tepkisi Ayrıştırması (Tamamlandı)
- [x] **Fizik ve Kontrol Yardımcı Motoru (`physicsSectionUtils.ts`, `physicsSectionUtils.test.mjs`):** Bilye ivmesi etiket formatlayıcı `formatPhysicsScaleLabel`, eğim tepki hızı etiket formatlayıcı `formatTiltResponsivenessLabel`, turbo ivme doğrulaması `isTurboPhysics` ve anında tepki eşiği `isInstantTilt` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 360 istemci testi, 388 monorepo testi).
- [x] **Modüler Fizik Seçici Bileşenleri (`GravityScaleSelector.tsx`, `TiltResponsivenessSelector.tsx`):** Bilye ivmesi ve eğim tepki hızı Segmented buton grupları bağımsız bileşenlere ayrıştırıldı.
- [x] **Yalın Fizik Bölümü Orkestratörü (`SettingsPhysicsSection.tsx`):** Alt bileşen mimarisine geçirilerek `SettingsPhysicsSection.tsx` 46 satırdan **28 satıra** indirildi.

### Faz 139: Masaüstü HUD Üst Durum Göstergeleri Ayrıştırması (Tamamlandı)
- [x] **HUD Gösterge Yardımcı Motoru (`headerReadoutUtils.ts`, `headerReadoutUtils.test.mjs`):** Portal kilit erişilebilir etiketi `resolvePortalLockAriaLabel`, rekor metni formatlayıcı `formatRecordBadgeText`, çok oyunculu mod bildirim etiketi `resolveMultiplayerBadgeAriaLabel` ve süre konteyneri başlık metni `resolveTimerStatusTitle` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 367 istemci testi, 395 monorepo testi).
- [x] **Modüler Gösterge Bileşenleri (`HeaderCrystalStatus.tsx`, `HeaderTimerStatus.tsx`, `HeaderMultiplayerBadge.tsx`):** Kristal oranı ve portal kilidi, oyun süresi ve bölüm rekoru ile çok oyunculu aktiflik rozeti bağımsız modüllere ayrıştırıldı.
- [x] **Yalın Üst Durum Orkestratörü (`HeaderStatusReadouts.tsx`):** Alt bileşen mimarisine geçirilerek `HeaderStatusReadouts.tsx` 91 satırdan **56 satıra** indirildi.

### Faz 140: Masaüstü HUD Üst Eylem Butonları Ayrıştırması (Tamamlandı)
- [x] **HUD Eylem Butonları Yardımcı Motoru (`headerActionUtils.ts`, `headerActionUtils.test.mjs`):** Eşleştirme butonu varyantı `resolvePairingButtonVariant`, oda kodu metni güvenli formatlayıcı `formatPairingButtonRoomCode`, gecikme rozet stili `resolvePairingBadgeClass` ve ekran okuyucu etiketi `formatPairingButtonAriaLabel` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 372 istemci testi, 400 monorepo testi).
- [x] **Modüler Eylem Buton Bileşenleri (`HeaderPairingButton.tsx`, `HeaderSettingsButton.tsx`, `HeaderHelpButton.tsx`):** Telefon eşleştirme/gecikme rozeti butonu, ayarlar çekmecesi butonu ve klavye yardım rehberi ikon butonu bağımsız modüllere ayrıştırıldı.
- [x] **Yalın Üst Eylem Butonları Orkestratörü (`HeaderActionButtons.tsx`):** Alt bileşen mimarisine geçirilerek `HeaderActionButtons.tsx` 74 satırdan **45 satıra** indirildi.

### Faz 141: Masaüstü HUD Araç Çubuğu Görünüm ve Ses Kontrolleri Ayrıştırması (Tamamlandı)
- [x] **Görünüm ve Ses Yardımcı Motoru (`viewportAudioUtils.ts`, `viewportAudioUtils.test.mjs`):** Sıfırlama yapılandırması `getViewportResetConfig`, kamera/tema/ses kısayol belirteçleri `getViewportCameraShortcut` / `getViewportThemeShortcut` / `getViewportSoundShortcut`, tema doğrulama/ikon çözümleme `isLightTheme` / `getViewportThemeIconName` ve ses ikonu/stil yapılandırıcısı `getViewportSoundIconConfig` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 377 istemci testi, 405 monorepo testi).
- [x] **Modüler Görünüm ve Ses Buton Bileşenleri (`ViewportResetButton.tsx`, `ViewportCameraButton.tsx`, `ViewportThemeButton.tsx`, `ViewportSoundButton.tsx`):** Topu başa alma (R), kamera modu döngüsü (C), açık/koyu tema anahtarlama (L) ve ses açma/kapatma (M) butonları bağımsız modüllere ayrıştırıldı.
- [x] **Yalın Görünüm ve Ses Orkestratörü (`ViewportAudioControls.tsx`):** Alt bileşen ve barrel mimarisine geçirilerek `ViewportAudioControls.tsx` 82 satırdan **49 satıra** indirildi.

### Faz 142: Masaüstü HUD Araç Çubuğu Editör ve Skor Butonları Ayrıştırması (Tamamlandı)
- [x] **Araçlar Yardımcı Motoru (`toolsControlsUtils.ts`, `toolsControlsUtils.test.mjs`):** Editör yapılandırması `getEditorButtonConfig`, skor tablosu yapılandırması `getLeaderboardButtonConfig`, erişilebilir buton etiketi `formatToolButtonAriaLabel` ve grup rol etiketi `getToolsGroupAriaLabel` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 382 istemci testi, 410 monorepo testi).
- [x] **Modüler Araç Buton Bileşenleri (`ToolsEditorButton.tsx`, `ToolsLeaderboardButton.tsx`):** Harita editörü açma (E) ve küresel skor tablosu açma (K) butonları bağımsız modüllere ayrıştırıldı.
- [x] **Yalın Araç Çubuğu Araçlar Orkestratörü (`ToolsControls.tsx`):** Alt bileşen mimarisine geçirilerek `ToolsControls.tsx` 32 satırdan **20 satıra** indirildi.

### Faz 143: Masaüstü HUD Alt Klavye İpuçları Ayrıştırması (Tamamlandı)
- [x] **Klavye İpuçları Yardımcı Motoru (`footerKeyboardHintUtils.ts`, `footerKeyboardHintUtils.test.mjs`):** Solo tuş listesi `getSoloKeyboardHintItems`, çok oyunculu yuva yapılandırmaları `getMultiplayerP1Hint` / `getMultiplayerP2Hint` ve dinamik ekran okuyucu etiket formatlayıcı `formatKeyboardHintAriaLabel` saf yardımcıları geliştirildi; 6 yeni birim test ile doğrulandı (toplam 388 istemci testi, 416 monorepo testi).
- [x] **Modüler Klavye İpucu Bileşenleri (`KeyboardHintItem.tsx`, `MultiplayerKeyboardHints.tsx`, `SoloKeyboardHints.tsx`):** Kbd/span çifti, 1P/2P çok oyunculu yuva gösterimi ve solo eğim/sıfırlama/tema gösterimi bağımsız modüllere ayrıştırıldı.
- [x] **Yalın Alt Klavye İpuçları Orkestratörü (`FooterKeyboardHints.tsx`):** Alt bileşen ve dinamik ARIA etiket mimarisine geçirilerek `FooterKeyboardHints.tsx` 74 satırdan **57 satıra** indirildi.

### Faz 144: Masaüstü HUD Durum Overlay Katmanı Ayrıştırması (Tamamlandı)
- [x] **Overlay ve Kurtarma Yardımcı Motoru (`overlayBarUtils.ts`, `overlayBarUtils.test.mjs`):** Duraklatma mesajı `getPauseRecoveryMessage`, eylem butonları yapılandırması `getPauseRecoveryActionsConfig`, canlı bölge önceliği `resolveToastAriaLive` ve bildirim geçerlilik denetleyicisi `isNotificationPresent` saf yardımcıları geliştirildi; test süiti 2'den 7 teste genişletildi (toplam 392 istemci testi, 420 monorepo testi).
- [x] **Modüler Kurtarma ve Toast Bileşenleri (`PauseRecoveryMessage.tsx`, `PauseRecoveryActions.tsx`, `ToastContent.tsx`):** Uyarı mesajı metni, "Bağla" / "Devam et" buton grubu ve dinamik ton stillerine sahip toast içerik kartı bağımsız modüllere ayrıştırıldı.
- [x] **Yalın Overlay Bileşenleri ve Barrel Yapısı (`PauseRecoveryBar.tsx`, `HudNotificationToast.tsx`, `DesktopHUDOverlays.tsx`):** Tekil sorumluluk ilkesi uygulanarak çubuk ve bildirim yapıları sadeleştirildi; `overlays/index.ts` üzerinden merkezi dışa aktarım sağlandı.

### Faz 145: Masaüstü Modallar Katmanı Ayrıştırması (Tamamlandı)
- [x] **Masaüstü Modallar Yardımcı Motoru (`desktopModalsUtils.ts`, `desktopModalsUtils.test.mjs`):** Modal anahtarları `DESKTOP_MODAL_KEYS`, liderlik tablosu seviye sınırlandırması `resolveInitialLeaderboardLevel`, dinamik modal başlığı `formatLeaderboardModalTitle`, aktif modal sorgulayıcı `isAnyDesktopModalOpen` ve görünürlük denetleyici `shouldRenderLeaderboardModal` saf yardımcıları geliştirildi; 6 yeni birim test ile doğrulandı (toplam 398 istemci testi, 426 monorepo testi).
- [x] **Modüler Modal Grupları (`UtilityModalsGroup.tsx`, `SocialModalsGroup.tsx`):** Araç pencereleri (Editör, Ayarlar, Yardım) ile Sosyal/Ağ pencereleri (QR Eşleştirme, Liderlik Tablosu) tekil sorumluluk esasına göre bağımsız bileşen gruplarına ayrıştırıldı.
- [x] **Yalın Modallar Katmanı Orkestratörü (`DesktopModalsLayer.tsx`):** Alt grup mimarisine devredilerek `DesktopModalsLayer.tsx` 45 satırdan **31 satıra** indirildi.

### Faz 146: Masaüstü Oyun Sonucu Modalları Ayrıştırması (Tamamlandı)
- [x] **Süre Doldu (Yenilgi) Yardımcı Motoru (`defeatModalUtils.ts`, `defeatModalUtils.test.mjs`):** Standart başlık `getDefeatModalTitle`, dinamik süre sınırı açıklaması `formatDefeatModalDescription`, toplanan kristal mesajı `formatDefeatCrystalMessage` ve buton yapılandırması `getDefeatActionsConfig` saf yardımcıları geliştirildi; 5 yeni birim test ile doğrulandı (toplam 403 istemci testi, 431 monorepo testi).
- [x] **Modüler Yenilgi Bileşenleri (`DefeatModalBody.tsx`, `DefeatModalFooter.tsx`):** Kristal özet metni ve "Modu değiştir" / "Tekrar dene" butonları bağımsız modüllere ayrıştırıldı; `defeat/index.ts` ve `victory/index.ts` üzerinden merkezi `outcome/index.ts` barrel mimarisi kuruldu.
- [x] **Yalın Oyun Sonucu Orkestratörü (`DefeatModal.tsx`, `GameOutcomeModals.tsx`):** `DefeatModal.tsx` 61 satırdan **50 satıra** indirildi; `GameOutcomeModals.tsx` temiz re-export importlarına bağlandı.

### Faz 147: Masaüstü Eşleştirme Modalı Ayrıştırması (Tamamlandı)
- [x] **Eşleştirme Modalı Görünüm Yardımcı Motoru (`pairingModalViewUtils.ts`, `pairingModalViewUtils.test.mjs`):** Başlık metni `getPairingModalTitle`, açıklama metni `getPairingModalDescription`, sahneye geçiş butonu metni `getPairingProceedLabel`, kopyalama durum ikonu çözümleyici `resolveCopyIconState` ve ekran okuyucu bildirimi `formatPairingModalAriaLabel` saf yardımcıları geliştirildi; 4 yeni birim test ile doğrulandı (toplam 407 istemci testi, 435 monorepo testi).
- [x] **Modüler Eşleştirme Alt Bileşenleri (`PairingModalFooter.tsx`, `pairing/index.ts`):** "Bağlantıyı kopyala" ve "Sahneye geç" aksiyonları bağımsız footer bileşenine ayrıştırıldı; `pairing/index.ts` üzerinden merkezi modül yapısı tamamlandı.
- [x] **Yalın Eşleştirme Orkestratörü (`PairingModal.tsx`):** Alt bileşen ve saf yardımcı mimarisine devredilerek `PairingModal.tsx` 91 satırdan **75 satıra** indirildi.















































