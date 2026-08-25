# Mimari

## Genel yapı

Playlist Curator, Next.js App Router'ın Server Component ve Route Handler katmanlarını kullanır. Token, veritabanı ve Spotify erişimi yalnızca server modüllerinde kalır; Client Component'ler serializable view model'ler ve uygulamanın kendi JSON route'larıyla çalışır.

```text
UI (Server + Client Components)
        ↓
Route Handlers / Server pages
        ↓
Application services
   ↙                ↘
Repositories      Provider registry
   ↓                ↓
Prisma/SQLite     Classification providers
        ↘          ↙
       Spotify adapter (yalnız gerçek mod)
```

### Katmanlar

- `src/domain`: Provider'dan bağımsız track, playlist, category ve result sözleşmeleri ile Zod doğrulamaları.
- `src/spotify`: PKCE, token encryption/refresh, güncel Web API client'ı, response mapper'ları ve playlist export.
- `src/classification`: Demo ve rule-based provider'lar ile provider registry.
- `src/repositories`: Prisma sorguları ve domain mapper'ları.
- `src/services`: Playlist kaynağı seçimi, sınıflandırma orchestration ve demo export.
- `src/app/api`: Session/authorization ve input doğrulaması yapan Route Handler'lar.
- `src/components`: Etkileşimli istemci bileşenleri ve ortak UI parçaları.
- `src/test`: Provider/API fixture'ları ve test ortamı.

## Temel veri akışları

### Demo

1. Demo login route'u sabit demo kullanıcı için veritabanı session'ı oluşturur.
2. Playlist source statik, lisanssız demo fixture'larını döndürür.
3. Kullanıcı kategorileri seçer ve classification route'una gönderir.
4. Seçili provider sonuç üretir; run/result kayıtları Prisma ile saklanır.
5. Kabul/ret hem sonucu günceller hem `FeedbackEvent` yazar. Kabul edilen sonuç `TrackTag` olarak rule-based provider'a girdi olur.
6. Demo export Spotify'a istek atmaz; açıkça `demo-completed` durumlu yerel kayıt oluşturur.

### Spotify

1. Start route'u PKCE verifier/challenge ve state üretir.
2. Callback state/verifier'ı doğrular, authorization code'u token'larla değiştirir ve `/me` üzerinden kalıcı `account_id` alır.
3. Token'lar AES-256-GCM ile şifreli saklanır; tarayıcıya yalnız opaque session cookie verilir.
4. Playlist source `/me/playlists` ve `/playlists/{id}/items` sayfalarını map eder.
5. Export, özel listeyi `/me/playlists` ile oluşturur ve track URI'lerini `/playlists/{id}/items` uçlarına 100'lü gruplarla ekler.

## Veri modeli kararları

- Category type, provider ve status değerleri SQLite/PostgreSQL taşınabilirliği için string kolonda; domain katmanında Zod union/enum ile doğrulanır.
- Category rule ve seed track ayrı tablolardadır; provider'lar Prisma tiplerine bağımlı değildir.
- `ClassificationResult`, sonucu yeniden görüntüleyebilmek için yalnız gerekli metin snapshot'ını ve track URI/ID'sini saklar; artwork URL'si saklamaz.
- `FeedbackEvent` append-only kişiselleştirme geçmişidir. `TrackTag`, kabul edilmiş son durumu hızlı rule-based lookup için materialize eder.
- `PlaylistExport`, client request ID ile idempotenttir; `addedCount/nextOffset` kısmi Spotify hatasından sonra devam etmeyi mümkün kılar.

## Hata modeli

`AppError`, güvenli kullanıcı mesajlarını `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `SPOTIFY_ERROR` ve `INTERNAL_ERROR` kodlarına ayırır. Route'lar ortak `errorResponse` ile aynı JSON şeklini döndürür.

Spotify 429 yanıtındaki `Retry-After` sayısı detay olarak korunur. 403, yeni Development Mode kısıtına uygun owner/collaborator mesajına dönüşür. Mutating Spotify çağrıları körlemesine retry edilmez; export ilerlemesi veritabanından devam eder.

## Güvenlik ve üretim notları

- Server-only modüller token ve Prisma bağımlılıklarının client graph'a girmesini engeller.
- OAuth geçici cookie'si 10 dakika geçerlidir; state eşleşmesi ve expiry zorunludur.
- Redirect hedefleri sabittir; kullanıcı kontrollü open redirect yoktur.
- Unsafe route'larda session sahipliği, same-origin ve Zod doğrulaması birlikte uygulanır.
- Spotify egress politikası yalnız `GET` ile okuma, `POST /me/playlists` ile yeni liste oluşturma ve `POST /playlists/{id}/items` ile öğe eklemeye izin verir. `DELETE`, `PUT`, `PATCH`, unfollow ve diğer yazma uçları token yüklenmeden önce engellenir.
- Token encryption key ve session secret environment secret store içinde tutulmalıdır.
- SQLite kişisel/tek process MVP içindir. Çok instance deployment'ta PostgreSQL, connection pooling ve account bazlı distributed refresh lock eklenmelidir.
- Üretimde CSP, structured redacted logging, database backup encryption ve key rotation eklenmelidir.

## Haricî metadata provider ekleme

`TrackMetadataProvider.enrichTracks` Spotify adapter'ından ayrı tutulmuştur. Uygun entegrasyon; yalnız lisansı uygulamanın kullanımına izin veren bir kaynağa bağlanmalı, Spotify içeriğini AI/ML sistemine ingest etmemeli ve provider-specific alanları domain DTO'larına map etmelidir.

Yeni classification provider; `ClassificationProvider` sözleşmesini uygulamalı, her sonucu 0–1 aralığında score ve kullanıcıya gösterilebilir evidence ile döndürmeli, registry'ye eklenmeli ve gerçek hesap gerektirmeyen fixture testleri sunmalıdır.
