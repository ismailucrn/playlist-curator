# Spotify Web API notları

Bu belge 24 Ağustos 2026 tarihinde Spotify'ın resmi Web API dokümantasyonu ve 2026 changelog'ları kontrol edilerek hazırlanmıştır.

## Kullanılan uçlar

| İşlev                         | Method ve path                                | Scope                                                                            |
| ----------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| Mevcut profil                 | `GET /me`                                     | `user-read-private`                                                              |
| Mevcut kullanıcının listeleri | `GET /me/playlists`                           | `playlist-read-private`, collaborative içerik için `playlist-read-collaborative` |
| Liste detayı                  | `GET /playlists/{id}`                         | kullanıcı token'ı                                                                |
| Liste öğeleri                 | `GET /playlists/{id}/items`                   | `playlist-read-private`                                                          |
| Özel liste oluşturma          | `POST /me/playlists` (`public:false`)         | `playlist-modify-private`                                                        |
| Listeye öğe ekleme            | `POST /playlists/{id}/items`                  | `playlist-modify-private`                                                        |
| Authorization                 | `GET https://accounts.spotify.com/authorize`  | PKCE S256                                                                        |
| Token/refresh                 | `POST https://accounts.spotify.com/api/token` | authorization code veya refresh token                                            |

Eski `GET/POST /playlists/{id}/tracks` ve `POST /users/{id}/playlists` uçları kullanılmaz. Şubat 2026 Development Mode değişikliklerinde `/tracks` uçları kaldırıldı; liste oluşturma mevcut kullanıcıya ait `/me/playlists` ucuna taşındı.

## Mevcut playlist'leri koruma politikası

- Uygulama mevcut playlist'leri yalnızca `GET` istekleriyle okur.
- Spotify istemcisi `DELETE`, `PUT` ve `PATCH` metotlarını kabul etmez.
- Yazma allowlist'i yalnız `POST /me/playlists` ve `POST /playlists/{id}/items` uçlarını içerir.
- Playlist unfollow/silme ve mevcut playlist'i değiştirme route'u veya UI kontrolü bulunmaz.
- OAuth'taki `playlist-modify-private` scope'u yeni özel playlist oluşturmak için gereklidir. Spotify daha dar bir create-only scope sunmadığından uygulama düzeyindeki egress allowlist'i testlerle zorunlu tutulur.

## Response shape kararları

- Simplified playlist toplamı deprecated `tracks.total` yerine `items.total` alanından okunur.
- Playlist sayfasındaki öğe `items[].item` alanından map edilir; eski `items[].track` alanına fallback yoktur.
- `item` null, episode, local track veya kimliksiz track ise güvenle atlanır.
- Artwork URL'leri bir günden kısa sürede sona erebilir; veritabanında saklanmaz.
- Track popularity, available markets veya deprecated artist genre gibi kaldırılabilen alanlara domain modeli bağımlı değildir.
- Account linking, Mayıs 2026'da eklenen kalıcı/pseudoanonymous `account_id` ile yapılır; değişebilen user `id` yalnız playlist owner karşılaştırmasında tutulur.

## Development Mode

- Yeni Development Mode uygulamasının sahibi aktif Spotify Premium kullanmalıdır; abonelik biterse uygulama durur.
- Yeni uygulamalar en fazla beş authenticated user alabilir ve her kullanıcı allowlist'te bulunmalıdır.
- Yeni developer hesaplarında Client ID sayısı da kısıtlıdır.
- Extended quota başvuruları geniş kullanıcı kitlesi içindir; kişisel MVP bu moda dayanmaz.
- `GET /playlists/{id}/items`, mevcut kullanıcı listenin sahibi veya collaborator değilse `403` döndürür. UI yalnız owner/collaborative adayları gösterir fakat endpoint 403'ünü ayrıca güvenli biçimde işler.

Kaynaklar:

- [February 2026 migration guide](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide)
- [February 2026 changelog](https://developer.spotify.com/documentation/web-api/references/changes/february-2026)
- [Quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
- [Get Playlist Items](https://developer.spotify.com/documentation/web-api/reference/get-playlists-items)

## Authorization ve token yaşam döngüsü

- Akış Authorization Code + PKCE'dir; challenge method yalnız `S256`.
- State, verifier ve expiry şifreli HttpOnly cookie'de tutulur ve callback'te birlikte doğrulanır.
- PKCE token exchange/refresh body'lerinde `client_id` bulunur; Client Secret kullanılmaz.
- Access token yaklaşık bir saat sonra yenilenir; uygulama expiry'den 60 saniye önce refresh yapar.
- Refresh response yeni refresh token içermeyebilir; bu durumda mevcut token korunur.
- Refresh token ömrü authorization tarihinden itibaren altı aydır. Refresh bu süreyi uzatmaz.
- `invalid_grant` tekrar denenmez; saklanan bağlantı kaldırılır ve kullanıcı yeniden authorization akışına yönlendirilir.
- Redirect URI production'da HTTPS olmalıdır. Yerel HTTP istisnası yalnız açık loopback IP'sidir; `localhost` kullanılamaz.

Kaynaklar:

- [Authorization Code with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [Refreshing tokens](https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens)
- [Redirect URI requirements](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri)

## Rate limit ve export

- 429 yanıtının `Retry-After` header'ı uygulama hatasına taşınır ve UI kullanıcıya bekleme mesajı verir.
- Mutating POST istekleri response bilinmediğinde otomatik tekrar edilmez.
- Export request ID ile idempotenttir; playlist oluşturulduktan sonra ekleme başarısızsa playlist ID ve `nextOffset` saklanır.
- Add Items endpoint'i istekte en fazla 100 URI kabul eder. URI'ler JSON body içinde 100'lü gruplara bölünür.

Kaynaklar:

- [Rate limits](https://developer.spotify.com/documentation/web-api/concepts/rate-limits)
- [Create Playlist](https://developer.spotify.com/documentation/web-api/reference/create-playlist)
- [Add Items to Playlist](https://developer.spotify.com/documentation/web-api/reference/add-items-to-playlist)

## Bilerek kullanılmayan özellikler

- Audio Features
- Audio Analysis
- Recommendations
- Spotify browse category/genre seed sistemleri
- Deprecated artist genre alanı
- Spotify içeriğini LLM'e veya başka bir AI/ML modeline gönderen herhangi bir entegrasyon

Spotify metadata'sını genişletmek için yalnız ayrı `TrackMetadataProvider` adapter'ı üzerinden lisansı uygun haricî servis bağlanmalıdır. Spotify içeriği model eğitimi veya AI inference girdisi olarak kullanılmamalıdır.
