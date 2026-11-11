# 🤝 Katkıda Bulunma Rehberi (CONTRIBUTING)

**GyroMaze** projesine katkıda bulunmak istediğiniz için teşekkürler! Bu belge, kod kalitesini, görsel tutarlılığı ve gerçek zamanlı performans standartlarını korumak için uyulması gereken kuralları tanımlar.

---

## 1. Temel İlkeler ve Dil Standardı

- **Proje Dili:** Projenin resmi dili **Türkçe**'dir.
  - Tüm kullanıcı arayüzü (UI) metinleri Türkçe olmalıdır.
  - Kod içerisindeki tüm yorum satırları (comments) ve JSDoc açıklamaları Türkçe yazılmalıdır.
  - Tüm dokümantasyon güncellemeleri (`.md`) profesyonel Türkçe ile hazırlanmalıdır.
  - Tüm Git commit mesajları ve Pull Request (PR) açıklamaları Türkçe olmalıdır.

---

## 2. Git Kimliği ve Commit Standartları

### Yazar Kimliği
- Tüm commit işlemleri gerçek geliştirici kimliğiyle (**Eren Kadiroğlu**) gerçekleştirilmelidir.
- Commit mesajlarında kesinlikle `Co-authored-by` etiketleri veya otomatik bot imzaları yer almamalıdır.

### Türkçe Conventional Commits
Commit mesajları aşağıdaki yapıyı takip etmelidir:

```text
<tip>(<kapsam>): <kısa ve net açıklama>
```

#### Kullanılabilecek Commit Tipleri:
| Tip | Açıklama | Örnek |
| :--- | :--- | :--- |
| `feat` | Yeni bir özellik eklenmesi | `feat(socket): mobil-masaüstü oda eşleşme akışı eklendi` |
| `fix` | Bir hatanın giderilmesi | `fix(gyro): iOS safari sensör izin hatası düzeltildi` |
| `perf` | Performans ve FPS iyileştirmeleri | `perf(scene): fizik döngüsünde gereksiz re-render önlendi` |
| `refactor` | Davranış değiştirmeyen kod iyileştirmesi | `refactor(shared): telemetri veri tipleri sadeleştirildi` |
| `style` | UI/UX, Tailwind veya biçimlendirme | `style(hud): bağlantı durumu göstergesi modernize edildi` |
| `docs` | Dokümantasyon değişiklikleri | `docs(readme): yerel ağ kurulum adımları güncellendi` |
| `chore` | Yapılandırma, paket ve monorepo işleri | `chore(repo): monorepo çalışma alanı yapılandırıldı` |

---

## 3. Kodlama Standartları

### TypeScript Kuralları
- `any` tipinin kullanımı kesinlikle yasaktır. Tüm veri yapıları açıkça tiplendirilmelidir.
- İstemci (`apps/client`) ve sunucu (`apps/server`) arasında taşınan tüm WebSocket olayları ve yükleri (`payload`) mutlaka `packages/shared` paketinde tanımlanmalıdır.
- Katı tip kontrolü (`strict: true`) her zaman aktif tutulmalıdır.

### 3B Grafik (React Three Fiber) ve Performans Kuralları
- **60 FPS Hedefi:** `useFrame` döngüsü içerisinde **asla** `new THREE.Vector3()`, `new THREE.Euler()` veya `new THREE.Quaternion()` gibi nesne örneklemeleri (instantiation) yapılmamalıdır. Bu nesneler bileşen dışında veya `useMemo`/`useRef` ile bir kez oluşturulup yeniden kullanılmalıdır (Garbage Collection duraksamalarını önlemek için).
- **React State Yasağı (Sıcak Döngü):** Saniyede 60 kez tetiklenen jiroskop verileri için standart React `useState` kullanılmamalıdır; Zustand transient güncellemeleri veya doğrudan `ref` mutasyonları tercih edilmelidir.
- **Sönümleme (Smoothing):** Ham jiroskop açıları doğrudan labirent rotasyonuna atanmamalı, her karede `THREE.MathUtils.lerp` veya `Quaternion.slerp` ile yumuşatılmalıdır.

### UI/UX ve Tasarım Kuralları
- **TailwindCSS:** Tüm bileşenler TailwindCSS sınıfları ile stillendirilmelidir.
- **Stilsiz Eleman Yasağı:** Ham `<button>`, `<input>` veya varsayılan tarayıcı görünümlü HTML elemanları kesinlikle kullanılmamalıdır.
- **Framer Motion:** Modal açılışları, QR kod ekranı, bağlantı durum geçişleri ve HUD bildirimleri Framer Motion ile akıcı şekilde canlandırılmalıdır.

---

## 4. Pull Request (PR) Süreci

1. Yeni bir özellik veya hata düzeltmesi için anlamlı bir dal (branch) oluşturun:
   - `feat/qr-eslesme-sistemi`
   - `fix/jiroskop-kalibrasyon`
2. Değişikliklerinizin tüm çalışma alanlarında hatasız derlendiğinden emin olun:
   ```bash
   npm run build
   ```
3. Tip kontrolünü ve yazım denetimini çalıştırın:
   ```bash
   npm run typecheck
   ```
4. PR açıklamasında yapılan değişikliği, mimari etkilerini ve varsa ekran görüntülerini/GIF'leri Türkçe olarak paylaşın.

