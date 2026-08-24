# Playlist Curator

Playlist Curator, kişisel Spotify çalma listelerini dil, müzik türü, ruh hâli veya kullanıcı tanımlı kategorilere ayırmak için geliştirilmiş çalışan bir MVP'dir. Öneriler güven puanı ve kısa bir gerekçeyle gösterilir; kullanıcı sonuçları kabul veya reddeder ve seçilen parçaları yeni bir özel Spotify listesine aktarabilir.

Spotify anahtarları olmadan demo modunda uçtan uca çalışır. Spotify yapılandırıldığında aynı arayüz gerçek hesap, gerçek listeler ve gerçek playlist export yolunu kullanır.

## Teknoloji

- Next.js 16 App Router, React 19 ve TypeScript
- Tailwind CSS 4
- Prisma ORM 7 ve yerel SQLite
- Zod 4 doğrulamaları
- Vitest, ESLint ve Prettier
- Server-mediated Authorization Code + PKCE (S256)
- AES-256-GCM token şifreleme ve hash'lenmiş veritabanı session'ları

## Yerel kurulum

Gereksinimler: Node.js 22 veya üzeri ve pnpm 11.

```bash
git clone https://github.com/ismailucrn/playlist-curator.git
cd playlist-curator
cp .env.example .env
pnpm install
pnpm dev
```

`pnpm dev`; Prisma Client'ı üretir, bekleyen migration'ları uygular, idempotent demo seed'ini çalıştırır ve uygulamayı `http://127.0.0.1:3000` adresinde açar. Bağımlılıklar ve pnpm store proje içinde tutulur; sistem geneline paket kurulmaz.

Ana sayfada **Demo'yu aç** düğmesini kullanarak Spotify ayarı yapmadan şu akışı deneyebilirsiniz:

1. Demo listesini seçme
2. Yeni kategori oluşturma veya hazır kategorileri seçme
3. Demo provider ile sınıflandırma
4. Sonuçları kabul veya reddetme
5. Seçilen sonuçlar için yerel demo export kaydı oluşturma

## Spotify Developer Dashboard kurulumu

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) içinde yeni bir uygulama oluşturun.
2. Redirect URI olarak aşağıdaki değeri **birebir** kaydedin:

   ```text
   http://127.0.0.1:3000/api/auth/spotify/callback
   ```

   Spotify loopback geliştirmesinde `localhost` kabul etmez; açık IPv4/IPv6 adresi ister.

3. Dashboard'daki Client ID'yi `.env` içindeki `SPOTIFY_CLIENT_ID` alanına yazın.
4. Güvenlik anahtarlarını üretin:

   ```bash
   openssl rand -base64 32
   openssl rand -base64 48
   ```

   İlk çıktıyı `TOKEN_ENCRYPTION_KEY`, ikincisini `SESSION_SECRET` olarak kullanın.

5. Development Mode kullanıyorsanız Spotify hesabınızı uygulamanın allowlist'ine ekleyin.
6. Sunucuyu yeniden başlatın.

PKCE akışında token endpoint'i `client_id` ve `code_verifier` kullanır; bu nedenle uygulama Client Secret istemez. Spotify Dashboard yine bir Client Secret gösterse de bu değer tarayıcıya, `.env.example` dosyasına veya repository'ye eklenmemelidir.

### Gerekli ortam değişkenleri

| Değişken               | Açıklama                                                   |
| ---------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`         | Varsayılan: `file:./dev.db`                                |
| `APP_URL`              | Yerel uygulama origin'i                                    |
| `DEMO_MODE`            | Demo girişini açar veya kapatır                            |
| `SPOTIFY_CLIENT_ID`    | Spotify uygulaması Client ID'si                            |
| `SPOTIFY_REDIRECT_URI` | Dashboard ile birebir aynı callback URI                    |
| `TOKEN_ENCRYPTION_KEY` | 32 byte base64 AES anahtarı                                |
| `SESSION_SECRET`       | OAuth geçici verilerini koruyan en az 32 karakterli secret |

Gerçek değerler yalnızca `.env` veya deployment secret store içinde tutulmalıdır. `.env` Git tarafından yok sayılır.

### OAuth scope'ları

Uygulama minimum yetki ilkesiyle şunları ister:

- `user-read-private`: `/me` üzerinden kalıcı `account_id` ile hesap eşleştirme
- `playlist-read-private`: özel listeleri görme
- `playlist-read-collaborative`: işbirlikçi listeleri dahil etme
- `playlist-modify-private`: yeni özel liste oluşturma ve öğe ekleme

MVP public playlist oluşturmaz; bu nedenle `playlist-modify-public` istemez.

## Veritabanı

Yerel geliştirme SQLite kullanır. Şema provider'a özel enum veya JSON kolonlarına bağımlı değildir ve PostgreSQL'e taşınabilir tutulmuştur.

```bash
pnpm db:generate       # Prisma Client üret
pnpm db:migrate        # geliştirme migration'ı oluştur/uygula
pnpm db:deploy         # kayıtlı migration'ları uygula
pnpm db:seed           # demo kullanıcı/kategorilerini ekle
pnpm db:studio         # Prisma Studio
```

PostgreSQL'e geçerken `prisma/schema.prisma` datasource provider'ını `postgresql` yapın, `@prisma/adapter-pg` ve `pg` kurun, `src/lib/db.ts` içindeki adapter'ı `PrismaPg` ile değiştirin, standart bir `postgresql://` `DATABASE_URL` tanımlayın ve yeni bir migration üretin. Domain ve repository arayüzleri değişmez.

## Komutlar

```bash
pnpm dev
pnpm build
pnpm start
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm test:watch
```

Gerçek Spotify hesabı gerektiren testler mock'ludur. Testler; response mapper'ları, token yenileme, kategori doğrulama, iki classification provider, skor sınırları, 100 öğelik export chunk'ları, hata/rate-limit dönüşümleri ve kritik demo sınıflandırma akışını kapsar.

## Spotify API ve politika kısıtları

- Yeni Development Mode uygulamalarında uygulama sahibinin aktif Spotify Premium hesabı olmalıdır.
- Development Mode uygulaması en fazla beş yetkilendirilmiş kullanıcıyla çalışır ve bu kullanıcılar allowlist'e eklenmelidir.
- Playlist item içeriği yalnızca mevcut kullanıcının sahibi veya işbirlikçisi olduğu listelerde döner; diğer listeler `403` verir.
- Kod yalnızca güncel `GET/POST /playlists/{id}/items` uçlarını ve liste oluşturmak için `POST /me/playlists` kullanır. Kaldırılmış `/tracks` playlist uçlarına bağımlı değildir.
- Access token yaklaşık bir saat geçerlidir. Refresh token altı ay sonra sona erer; refresh işlemi bu süreyi uzatmaz ve `invalid_grant` durumunda yeniden yetkilendirme gerekir.
- Spotify kapakları değiştirilmeden, kırpılmadan ve Spotify kaynağına geri bağlantıyla gösterilir. Geçici image URL'leri veritabanında saklanmaz.
- Spotify içeriği veya metadata'sı bir LLM'e, makine öğrenmesi modeline ya da eğitim pipeline'ına gönderilmez.
- Audio Features, Audio Analysis, Recommendations, Spotify category/genre seed uçları ve deprecated artist genre alanı kullanılmaz.
- Spotify içeriğini indirme, stream-ripping veya model eğitimi amacıyla kullanma desteklenmez.

Ayrıntılı endpoint ve değişiklik notları için [`docs/spotify-api-notes.md`](docs/spotify-api-notes.md) dosyasına bakın.

## Sınıflandırma provider'ları

`ClassificationProvider` sözleşmesi hem tekli hem toplu sınıflandırma sunar:

```ts
interface ClassificationProvider {
  classifyTrack(
    track,
    categories,
    context?,
  ): Promise<ClassificationSuggestion[]>;
  classifyTracks(
    tracks,
    categories,
    context?,
  ): Promise<ClassificationSuggestion[]>;
}
```

- **DemoClassificationProvider:** Track/category kimliklerinden deterministik 0–1 sonuç üretir.
- **RuleBasedClassificationProvider:** Başlık, sanatçı ve albüm kuralları; seed track'ler ve daha önce kabul edilen kullanıcı etiketleriyle çalışır.

Gerçek bir provider eklemek için:

1. Yasal kullanım hakkı bulunan metadata servisi için `TrackMetadataProvider` adapter'ı uygulayın.
2. Spotify'dan gelen veriyi LLM/ML servisine göndermediğinizi doğrulayın.
3. Yeni provider'ı `src/classification/registry.ts` içine ekleyin.
4. Provider'ın score sınırı, evidence ve hata durumları için test yazın.
5. Veri saklama süresi ve sağlayıcı lisansını dokümante edin.

## Güvenlik özeti

- PKCE verifier/state süreli, şifreli, HttpOnly ve SameSite=Lax cookie'de tutulur.
- Access ve refresh token AES-256-GCM ile şifrelenir; cookie veya client bundle'a girmez.
- Session cookie yalnızca rastgele token taşır; veritabanında SHA-256 hash'i tutulur.
- Production cookie'leri `Secure` olur.
- Mutasyon route'ları session, Zod ve same-origin doğrulaması yapar.
- Spotify hataları token veya response gövdesini loglamadan uygulama hata tiplerine çevrilir.
- Export işlemi idempotent request kimliği ve kısmi ilerleme kaydı kullanır.

Üretimde encryption key'i managed secret store/KMS içinde tutun, düzenli key rotation planlayın ve PostgreSQL yedeklerini de şifreleyin. Ayrıntılar için [`docs/architecture.md`](docs/architecture.md) dosyasına bakın.

## Bilinen MVP sınırlamaları

- Demo provider gerçek müzik analizi yapmaz.
- Rule-based provider yalnızca yerel metin kuralları ve kullanıcı geri bildirimlerini kullanır.
- Yeni listeler MVP'de yalnızca özel olarak oluşturulur.
- SQLite tek process kişisel geliştirme için uygundur; yatay ölçek için PostgreSQL ve dağıtık token-refresh kilidi gerekir.
- Spotify album artwork URL'leri kısa ömürlü olduğundan sayfa yeniden yüklendiğinde API'den tekrar alınır.
