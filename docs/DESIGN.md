# GyroMaze Arayüz Tasarım Sistemi

Bu belge, masaüstü oyun ekranı ve mobil kontrolcü arayüzünün ortak tasarım dilini tanımlar.

## Konu ve amaç

- **Konu:** Telefonu eğerek ekrandaki 3B labirent tablasını yönettiğin bir beceri oyunu. Görsel dil, klasik metal/ahşap eğim labirentlerinden ve uçak kokpitlerindeki yapay ufuk (attitude indicator) göstergelerinden besleniyor.
- **Kitle:** Salonda, masada veya ofiste arkadaşlarıyla oynayan genel oyuncular.
- **Arayüzün birinci görevi:** 3B sahnenin önünden çekilmek. Oyuncu ilerlemeyi (kristal, süre, bağlantı) tek bakışta görür; geri kalan her şey tek bir ayarlar panelinde toplanır.

## Renk paleti

| Rol | Karanlık mod ("Gece") | Aydınlık mod ("Gündüz") |
| --- | --- | --- |
| Zemin (`base`) | `#0F1A2B` gece mavisi | `#E9EEF5` sis grisi |
| Yüzey (`surface`) | `#16233A` | `#FFFFFF` |
| Çizgi (`line`) | `#2B3B57` | `#CBD5E3` |
| Metin (`fg`) | `#EAF0F8` | `#142033` |
| İkincil metin (`muted`) | `#8C9DB8` | `#5D6B82` |
| Pirinç vurgu (`brass`) | `#D9A441` | `#A87414` |
| Sinyal (`signal`) | `#5BC0EB` | `#1C7FB0` |
| Başarılı (`ok`) | `#4FC59B` | `#1F8F68` |
| Uyarı (`warn`) | `#F28C38` | `#C2621A` |
| Hata (`danger`) | `#EF6461` | `#C53B38` |

Pirinç rengi gösterge çerçevelerinden geliyor ve yalnızca birincil eylemlerde ve odak noktalarında kullanılıyor. Sinyal mavisi canlı telemetri verileri için ayrıldı.

## Tipografi

- **Barlow** (400/500/600): tüm arayüz metni. Teknik ama sıcak, Türkçe karakter desteği tam.
- **Barlow Condensed** (500/600): süre, açı, hız ve oda kodu gibi sayısal göstergeler (`tabular-nums`).
- Etiketler cümle düzeninde yazılır; büyük harfli üst başlık (eyebrow) kullanılmaz.

## Yerleşim

```text
┌────────────────────────────────────────────────────────────────────────┐
│ ◎ GyroMaze  ‹ Bölüm 07 ›          ◆ 2/3   12,4 sn   ● K7P2QX   [Bağla] [⚙] │
│                                                                        │
│                              3B sahne                                  │
│                                                                        │
│ ╭──────╮  Eğim  +3,2°   ┌────┐                          [⟲] [◱] [♪]   │
│ │  ◉   │  Yatış −1,0°   │ ·◆ │                                         │
│ ╰──────╯  Hız   2,4     └────┘                                         │
└────────────────────────────────────────────────────────────────────────┘
```

- **Üst çubuk:** solda marka ve bölüm gezgini, sağda durum göstergeleri ve en fazla iki eylem (telefon bağlama, ayarlar).
- **Sol alt — gösterge kümesi:** yapay ufuk göstergesi, sayısal okumalar ve 2B radar. Arayüzün tek "cesur" öğesi budur.
- **Sağ alt — hızlı eylemler:** yalnızca ikon düğmeleri (sıfırla, kamera, ses); her biri `aria-label` ve kısayol ipucu taşır.
- **Ayarlar paneli:** sağdan açılan tek panel. Oyun modu, görünüm, kontrol/fizik, ses ve ekran katmanları burada; harita editörü ve skor tablosu da buradan açılır.

## İlkeler

1. **Tek odak:** Cesaret yalnızca yapay ufuk göstergesinde. Diğer her şey sakin, ince çizgili, yarı saydam yüzeylerde.
2. **Her şeyin tek bir yeri var:** Aynı ayar iki farklı yerde bulunmaz. Üst çubukta sadece durum ve en sık iki eylem kalır.
3. **Hareket yalnızca yanıt olarak:** Panel ve pencere açılışları kısa bir geçişle gelir; kendiliğinden oynayan dekoratif animasyon yoktur. `prefers-reduced-motion` desteklenir.
4. **Erişilebilirlik tabanı:** Tüm ikon düğmelerinde `aria-label`, görünür klavye odağı, `Esc` ile kapanan pencereler ve en az 36px dokunma hedefleri (mobilde 44px).

