<template>
  <div class="topline">Ücretsiz kargo · 750 TL ve üzeri siparişlerde</div>
  <header class="site-header">
    <a class="brand" href="#anasayfa" aria-label="Fındıkhane ana sayfa">
      <span class="brand-mark">F</span><span>fındıkhane</span>
    </a>
    <nav aria-label="Ana menü">
      <a href="#urunler">Fındıklarımız</a>
      <a href="#hikayemiz">Hikâyemiz</a>
      <a href="#yorumlar">Yorumlar</a>
    </nav>
    <button class="cart-button" id="open-cart" type="button" aria-label="Sepeti aç">
      <span>Sepet</span><span class="cart-count" id="cart-count">0</span>
    </button>
  </header>

  <main id="anasayfa">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow"><span></span> Ordu ve Giresun'dan taze hasat</p>
        <h1>Bir avuç <em>iyi</em><br />gelir.</h1>
        <p class="hero-text">Her pakette Karadeniz'in serin rüzgârı, bereketli toprağı ve özenle seçilmiş fındıkları var.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#urunler">Fındıkları keşfet <span>→</span></a>
          <a class="text-link" href="#hikayemiz">Neden Fındıkhane? <span>↗</span></a>
        </div>
        <div class="hero-note"><span class="spark">✦</span> Kavrulmamış, katkısız, taptaze.</div>
      </div>
      <div class="hero-art" aria-label="Fındık illüstrasyonu">
        <div class="sun"></div>
        <div class="line line-one"></div><div class="line line-two"></div>
        <div class="leaf leaf-one"></div><div class="leaf leaf-two"></div>
        <div class="hazelnut nut-back"></div>
        <div class="hazelnut nut-main"><span></span></div>
        <div class="hazelnut nut-small"><span></span></div>
        <div class="ground"></div>
        <div class="harvest-tag">2026<br /><strong>YENİ HASAT</strong></div>
      </div>
    </section>

    <section class="trust-strip" aria-label="Fındıkhane avantajları">
      <p><span>01</span> Dalından sofrana</p>
      <p><span>02</span> Günlük paketleme</p>
      <p><span>03</span> Güvenli ödeme</p>
      <p><span>04</span> Doğal lezzet</p>
    </section>

    <section class="products section" id="urunler">
      <div class="section-heading">
        <div><p class="eyebrow"><span></span> En sevilenler</p><h2>Fındığın en <em>iyi</em> hâli.</h2></div>
        <a class="text-link" href="#urunler">Tüm ürünleri gör <span>→</span></a>
      </div>
      <div class="product-grid">
        <article class="product-card feature-card">
          <div class="product-image bag-image cream">
            <span class="badge">Çok sevilen</span>
            <div class="packaging"><b>fındık<br />hane</b><i>DOĞAL İÇ<br />FINDIK</i><small>ORDU VE GİRESUN</small></div>
            <img class="product-illustration" src="/images/findik-dogal.svg" alt="Doğal iç fındık illüstrasyonu" width="240" height="220" loading="lazy" />
          </div>
          <div class="product-info"><div><p class="product-type">Çiğ iç fındık</p><h3>Ordu ve Giresun Seçme</h3></div><strong>₺529</strong></div>
          <button class="add-button" data-product="Ordu ve Giresun Seçme" data-product-id="giresun-secme">Sepete ekle <span>+</span></button>
        </article>
        <article class="product-card">
          <div class="product-image bag-image green">
            <div class="packaging light"><b>fındık<br />hane</b><i>KAVRULMUŞ<br />FINDIK</i><small>ORDU VE GİRESUN</small></div>
            <img class="product-illustration" src="/images/findik-kavrulmus.svg" alt="Taş fırında kavrulmuş fındık illüstrasyonu" width="240" height="220" loading="lazy" />
          </div>
          <div class="product-info"><div><p class="product-type">Kavrulmuş iç fındık</p><h3>Taş Fırın Kavrulmuş</h3></div><strong>₺579</strong></div>
          <button class="add-button" data-product="Taş Fırın Kavrulmuş" data-product-id="tas-firin-kavrulmus">Sepete ekle <span>+</span></button>
        </article>
        <article class="product-card">
          <div class="product-image bag-image rust">
            <div class="packaging dark"><b>fındık<br />hane</b><i>FINDIK<br />EZMESİ</i><small>%100 FINDIK</small></div>
            <img class="product-illustration" src="/images/findik-ezmesi.svg" alt="Fındık ezmesi kavanozu illüstrasyonu" width="240" height="220" loading="lazy" />
          </div>
          <div class="product-info"><div><p class="product-type">Katkısız fındık ezmesi</p><h3>İpek Kıvam</h3></div><strong>₺459</strong></div>
          <button class="add-button" data-product="İpek Kıvam" data-product-id="ipek-kivam">Sepete ekle <span>+</span></button>
        </article>
      </div>
    </section>

    <section class="story section" id="hikayemiz">
      <div class="story-visual">
        <div class="story-circle"><span>•</span><span>•</span><span>•</span><span>•</span><span>•</span><span>•</span><span>•</span><span>•</span></div>
        <p>Karadeniz<br />usulü<br /><em>iyilik.</em></p>
        <div class="branch"><i></i><i></i><i></i></div>
      </div>
      <div class="story-copy">
        <p class="eyebrow"><span></span> Bizim hikâyemiz</p>
        <h2>Bir bahçenin<br />anlatacak <em>çok</em><br />şeyi vardır.</h2>
        <p>Fındıkhane, Ordu ve Giresun'un yamaçlarında üç kuşaktır fındık yetiştiren bir ailenin sofrasından doğdu. İyi bir fındığın aceleye gelmeyeceğini biliyoruz; bu yüzden her taneyi hasattan pakete kadar özenle takip ediyoruz.</p>
        <a class="button button-outline" href="#urunler">Hikâyemizi dinle <span>→</span></a>
      </div>
    </section>

    <section class="quote-section" id="yorumlar">
      <p class="eyebrow centered"><span></span> Fındıkhane sofralarda</p>
      <blockquote>"Fındığın tazesi böyle olurmuş. Paketi açar açmaz bütün ev mis gibi koktu."</blockquote>
      <div class="quote-author"><span>ZE</span><p><strong>Zeynep E.</strong><br />İstanbul</p></div>
    </section>

    <section class="newsletter">
      <div><p class="eyebrow"><span></span> Bahçeden haber var</p><h2>İyi şeylerden<br />haberdar ol.</h2></div>
      <form id="newsletter-form">
        <label class="sr-only" for="email">E-posta adresiniz</label>
        <input id="email" type="email" placeholder="E-posta adresin" required />
        <button class="button button-primary" type="submit">Kaydol <span>→</span></button>
        <p class="form-message" id="form-message" aria-live="polite"></p>
      </form>
    </section>
  </main>

  <footer>
    <a class="brand" href="#anasayfa"><span class="brand-mark">F</span><span>fındıkhane</span></a>
    <p>© 2026 Fındıkhane. Ordu ve Giresun'dan sevgiyle.</p>
    <div><a href="#anasayfa">Instagram</a><a href="#anasayfa">İletişim</a></div>
  </footer>

  <div class="cart-overlay" id="cart-overlay" hidden></div>
  <aside class="cart-drawer" id="cart-drawer" aria-label="Alışveriş sepeti" aria-hidden="true">
    <div class="drawer-header"><p class="eyebrow"><span></span> Sepetin</p><button class="close-drawer" id="close-cart" type="button" aria-label="Sepeti kapat">×</button></div>
    <div class="cart-items" id="cart-items"><p class="empty-cart">Sepetin henüz boş.</p></div>
    <div class="cart-total"><span>Toplam</span><strong id="cart-total">₺0</strong></div>
    <form id="checkout-form" class="checkout-form">
      <p class="checkout-title">Teslimat bilgileri</p>
      <div class="form-grid"><label>Ad<input name="firstName" autocomplete="given-name" required /></label><label>Soyad<input name="lastName" autocomplete="family-name" required /></label></div>
      <label>E-posta<input name="email" type="email" autocomplete="email" required /></label>
      <div class="form-grid"><label>Telefon<input name="gsmNumber" type="tel" inputmode="tel" placeholder="+905XXXXXXXXX" autocomplete="tel" required /></label><label>T.C. kimlik no<input name="identityNumber" inputmode="numeric" pattern="[0-9]{11}" maxlength="11" autocomplete="off" required /></label></div>
      <label>Teslimat adresi<textarea name="address" autocomplete="street-address" rows="2" required></textarea></label>
      <label>Şehir<input name="city" autocomplete="address-level2" required /></label>
      <p class="payment-note">Kart bilgileri Fındıkhane'ye ulaşmadan, iyzico'nun güvenli ödeme sayfasında alınır.</p>
      <button class="button button-primary checkout-button" id="checkout-button" type="submit">Güvenli ödemeye geç <span>→</span></button>
      <p class="checkout-message" id="checkout-message" aria-live="polite"></p>
    </form>
  </aside>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
</template>

<script setup lang="ts">
// Sepet/checkout etkileşimi orijinal script.js ile birebir aynı; bu dosya (public/script.js)
// nuxt.config.ts içinde `app.head.script` ile sayfaya ekleniyor (DOM'u doğrudan yöneten
// orijinal kod aynen kullanılıyor, Vue state'ine taşınmadı).
</script>
