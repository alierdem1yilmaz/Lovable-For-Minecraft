# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Minecraft oyuncuları ve builder'lar (Java Edition) — kod yazmadan Minecraft içeriği (şu an: özel yapı/structure) oluşturmak isteyenler. Türkçe konuşan bir kitle hedefleniyor (arayüz Türkçe).

## Product Purpose

Kullanıcının yazdığı bir metin açıklamasını, yapay zeka aracılığıyla gerçekten kurulup kullanılabilen bir Minecraft Java Edition data pack'ine (blok yerleşimi + `.mcfunction`) dönüştürür. Kod yazmadan, prompt yazarak gerçek oyun içeriği üretmek.

## Positioning

Basit bir metin→JSON şablon üretici değil: prompt önce bir kavram görseline (fal.ai flux/schnell), sonra Gaussian Splatting ile gerçek bir 3D asset'e (fal.ai sam-3/3d-objects, `.glb` + gerçek `.ply` gaussian splat) dönüştürülüyor, bu 3D model voxelize edilip Minecraft bloklarına eşleniyor. Bu görsel→3D→voksel zinciri, rakip "kodsuz Minecraft mod üretici" ürünlerinden (ör. creativemode.net) farklı, gerçek bir görsel-temelli üretim mekanizması. Herhangi bir adım başarısız olursa (görsel/3D servis hatası) sistem otomatik olarak saf metin→JSON üretimine düşer, kullanıcı her durumda çalışan bir data pack alır.

## Operating Context

- Kullanıcı Supabase magic-link ile giriş yapar.
- `/generate` sayfasında tek bir serbest metin alanına isteğini yazar (ör. "küçük taş bir gözetleme kulesi").
- Üretim ~30-90 saniye sürebilir (görsel üretimi + 3D rekonstrüksiyon + voxelization).
- `/result/[id]` sayfasında: üretilen kavram görseli, hangi pipeline'ın çalıştığına dair rozet, indirilebilir `.zip` data pack, bonus `.glb`/`.ply` linkleri ve kurulum talimatları gösterilir.
- Data pack'i kendi Minecraft dünyasının `datapacks` klasörüne koyup `/reload` + `/function <id>` ile bloğu inşa eder.
- `/history` sayfasında geçmiş üretimlerini görür.
- Günlük üretim kotası var (maliyet koruması).

## Capabilities and Constraints

- Şu an tek içerik tipi: "structure" (blok yerleşimi). Item/mob/recipe gibi diğer tipler henüz yok (bilinçli kapsam dışı — okulun rubric'i tek tip mod üreten bir siteyi tam puan sayıyor).
- Sadece Java Edition; Bedrock desteği yok.
- Yapı en fazla 10x10x10 blok, en fazla 400 blok.
- Voxelization kabuk/hollow (içi dolu değil), düşük-detaylı bloksu bir silüet üretir — fotogerçekçi değil, beklenen bir sınırlama.
- Görsel üretimi ve 3D rekonstrüksiyon fal.ai üzerinden (Gemini görsel modeli kota kısıtı nedeniyle terk edildi); yapı metni Gemini üzerinden üretiliyor.

## Brand Commitments

Bağlayıcı bir isim/logo/ton kısıtı yok — proje adı "Lovable for Minecraft" (informal, okul projesi). Görsel yön tamamen serbest, kullanıcının paylaştığı Minecraft gece sahnesi referans görseline göre yönlendirilecek.

## Evidence on Hand

Gerçek kullanıcı/müşteri kanıtı yok (erken aşama okul projesi) — testimonial, vaka çalışması, basın kanıtı uydurulmayacak.

## Product Principles

1. Kullanıcı her zaman çalışan bir çıktı alır — gelişmiş pipeline başarısız olursa sessizce daha basit ama garanti çalışan yola düşülür.
2. Tek içerik tipinde derinlik, çok içerik tipinde sığlık tercih edilir (rubric ve mevcut kapsam gereği).
3. Üretim süreci uzun olabilir (30-90sn) — arayüz bunu gizlemek yerine adım adım gösterir.
4. Türkçe, samimi ama teknik bir ton.
