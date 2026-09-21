# Premium Typography & Whitespace Optimization

Bu plan, sitenin tipografik hiyerarşisini ve boşluk (whitespace) dengesini "Lüks/Premium" segmentine taşımayı hedefler.

## User Review Required

> [!IMPORTANT]
> Sitenin font aileleri tamamen değiştirilecektir. Başlıklarda karakteristik bir **Serif** font, gövde metinlerinde ise ultra-modern bir **Sans-Serif** kullanılacaktır.

## Proposed Changes

### [Theme & Configuration]

#### [MODIFY] [tailwind.config.ts](file:///D:/Development/AndroidProjects/demgida-web/tailwind.config.ts)
- `serif` ve `sans` font aileleri tanımlanacak.
- `tracking` (letter-spacing) için premium değerler eklenecek.

#### [MODIFY] [globals.css](file:///D:/Development/AndroidProjects/demgida-web/src/app/globals.css)
- Google Fonts entegrasyonu (CSS @import).
- Tipografik ölçekleme (Desktop/Mobile font-size dengesi).

#### [MODIFY] [layout.tsx](file:///D:/Development/AndroidProjects/demgida-web/src/app/layout.tsx)
- Font sınıflarının `body` seviyesinde uygulanması.

### [UI Components Refactoring]

#### [MODIFY] [Hero.tsx](file:///D:/Development/AndroidProjects/demgida-web/src/components/Hero.tsx)
- Başlık hiyerarşisinin Serif font ile güncellenmesi.
- Satır arası (leading) ve harf arası (tracking) optimizasyonu.

#### [MODIFY] [Header.tsx](file:///D:/Development/AndroidProjects/demgida-web/src/components/Header.tsx)
- Navigasyon linklerinde `tracking-widest` ve `uppercase` kullanımıyla premium vurgusu.

#### [MODIFY] [page.tsx](file:///D:/Development/AndroidProjects/demgida-web/src/app/page.tsx)
- Bölüm başlıklarının (Section Titles) editöryal bir tarzda yeniden düzenlenmesi.
- `py-20` olan boşlukların `lg:py-32` ve üzerine çıkarılarak sitenin "nefes alması".

## Verification Plan

### Manual Verification
- Farklı ekran boyutlarında okunabilirlik kontrolü.
- Serif/Sans kontrastının görsel uyumu.
- Genel "Luxury" hissiyatının denetlenmesi.
