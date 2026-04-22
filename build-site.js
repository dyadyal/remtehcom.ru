const fs = require("node:fs");
const path = require("node:path");
const {
  company,
  benefits,
  process,
  reviews,
  generalFaq,
  homeFaq,
  services
} = require("./site-data");

const outDir = __dirname;
const serviceFile = (service) => `${service.slug}.html`;
const assetImage = "images/banner.jpg";
const defaultKeywords = [
  "ремонт бытовой техники в Туле",
  "мастер по ремонту бытовой техники Тула",
  "ремонт техники Тульская область",
  "вызов мастера Тула",
  "срочный ремонт бытовой техники",
  "ремонт холодильников Тула",
  "ремонт стиральных машин Тула",
  "ремонт посудомоечных машин Тула",
  "ремонт телевизоров Тула",
  "ремонт кондиционеров Тула"
];

const navItems = [
  ["index.html", "Главная"],
  ["services.html", "Услуги"],
  ["prices.html", "Цены"],
  ["about.html", "О компании"],
  ["reviews.html", "Отзывы"],
  ["faq.html", "FAQ"],
  ["contact.html", "Контакты"]
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function attr(value) {
  return escapeHtml(value).replace(/\n/g, " ");
}

function phoneHref(value) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

function canonicalUrl(file) {
  if (file === "index.html") {
    return `${company.baseUrl}/`;
  }
  return `${company.baseUrl}/${file.replace(/\.html$/, "")}`;
}

function absoluteImageUrl(image = assetImage) {
  return `${company.baseUrl}/${image || assetImage}`;
}

function keywordsContent(keywords = defaultKeywords) {
  return Array.isArray(keywords) ? keywords.join(", ") : keywords;
}

function scriptJson(data) {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2).replace(/</g, "\\u003c")}</script>`;
}

function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.legalName,
    url: company.baseUrl,
    image: absoluteImageUrl(assetImage),
    telephone: [company.phone, company.mobile],
    email: company.email,
    priceRange: "от 400 руб.",
    address: {
      "@type": "PostalAddress",
      streetAddress: company.streetAddress,
      addressLocality: company.city,
      addressRegion: company.region,
      addressCountry: "RU"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: company.coordinates.latitude,
      longitude: company.coordinates.longitude
    },
    openingHours: "Mo-Sa 09:00-20:00",
    areaServed: [
      { "@type": "City", name: company.city },
      { "@type": "AdministrativeArea", name: company.region }
    ],
    sameAs: [company.baseUrl]
  };
}

function breadcrumbsSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.file)
    }))
  };
}

function faqSchema(faq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

function serviceSchema(service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.name} в Туле`,
    description: service.description,
    image: absoluteImageUrl(service.image),
    provider: {
      "@type": "LocalBusiness",
      name: company.legalName,
      telephone: company.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: company.streetAddress,
        addressLocality: company.city,
        addressRegion: company.region,
        addressCountry: "RU"
      }
    },
    areaServed: [
      { "@type": "City", name: company.city },
      { "@type": "AdministrativeArea", name: company.region }
    ],
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
      url: canonicalUrl(serviceFile(service))
    }
  };
}

function header(activeFile) {
  const nav = navItems
    .map(([href, label]) => {
      const active = href === activeFile ? " is-active" : "";
      return `<a class="navbar-item${active}" href="${href}">${escapeHtml(label)}</a>`;
    })
    .join("\n");

  return `
<nav class="navbar is-sticky-top navigation site-nav" role="navigation" aria-label="Основная навигация">
  <div class="container">
    <div class="navbar-brand">
      <a class="navbar-item brand-link" href="index.html" aria-label="Remtehcom - ремонт бытовой техники в Туле">
        <span class="brand-mark">R</span>
        <span class="brand-copy"><strong>Remtehcom</strong><small>ремонт техники в Туле</small></span>
      </a>
      <a role="button" class="navbar-burger burger" aria-expanded="false" data-target="navbar-links" aria-label="Открыть меню">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
    <div id="navbar-links" class="navbar-menu">
      <div class="navbar-start ml-auto">
        ${nav}
      </div>
      <div class="navbar-end ml-0">
        <div class="navbar-item py-0 nav-contacts">
          <a href="${phoneHref(company.phone)}" class="nav-phone">${escapeHtml(company.phone)}</a>
          <a href="contact.html#request" class="btn btn-sm btn-primary ml-4">Вызвать мастера</a>
        </div>
      </div>
    </div>
  </div>
</nav>`;
}

function footer() {
  const serviceLinks = services
    .slice(0, 6)
    .map((service) => `<li><a href="${serviceFile(service)}">${escapeHtml(service.name)}</a></li>`)
    .join("\n");

  return `
<footer class="site-footer">
  <div class="container">
    <div class="columns is-multiline">
      <div class="column is-4-desktop is-12-tablet">
        <a class="footer-brand" href="index.html">
          <span class="brand-mark">R</span>
          <span><strong>Remtehcom</strong><small>сервисный центр в Туле</small></span>
        </a>
        <p>Ремонт бытовой техники на дому и в сервисной зоне. Работаем по Туле и согласовываем выезд по Тульской области.</p>
      </div>
      <div class="column is-4-desktop is-6-tablet">
        <h2 class="footer-title h5">Популярные услуги</h2>
        <ul class="footer-links">${serviceLinks}</ul>
      </div>
      <div class="column is-4-desktop is-6-tablet">
        <h2 class="footer-title h5">Контакты</h2>
        <ul class="footer-links">
          <li><a href="${phoneHref(company.phone)}">${escapeHtml(company.phone)}</a></li>
          <li><a href="${phoneHref(company.mobile)}">${escapeHtml(company.mobile)}</a></li>
          <li><a href="mailto:${attr(company.email)}">${escapeHtml(company.email)}</a></li>
          <li>${escapeHtml(company.address)}</li>
          <li>${escapeHtml(company.workingHours)}</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} ${escapeHtml(company.name)}. Ремонт бытовой техники в Туле.</span>
      <a href="privacy.html">Политика конфиденциальности</a>
    </div>
  </div>
</footer>`;
}

function breadcrumbsHtml(items) {
  if (!items || items.length <= 1) {
    return "";
  }

  return `
<nav class="breadcrumb-trail" aria-label="Хлебные крошки">
  <div class="container">
    <ol>
      ${items
        .map((item, index) => {
          const isLast = index === items.length - 1;
          const isHome = index === 0;
          const linkClass = isHome ? ' class="home-link"' : "";
          const linkText = isHome ? `<i class="ti-home" aria-hidden="true"></i><span>${escapeHtml(item.name)}</span>` : escapeHtml(item.name);
          return `<li>${isLast ? `<span aria-current="page">${escapeHtml(item.name)}</span>` : `<a${linkClass} href="${item.file}">${linkText}</a>`}</li>`;
        })
        .join("\n")}
    </ol>
  </div>
</nav>`;
}

function layout({ file, activeFile = file, title, description, keywords = defaultKeywords, image = assetImage, body, breadcrumbs, faq = [], schemas = [], noindex = false }) {
  const url = canonicalUrl(file);
  const pageImage = image || assetImage;
  const schemaBlocks = [
    localBusinessSchema(),
    breadcrumbsSchema(breadcrumbs || [{ name: "Главная", file: "index.html" }]),
    ...schemas
  ];

  if (faq.length) {
    schemaBlocks.push(faqSchema(faq));
  }

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${attr(description)}">
  <meta name="keywords" content="${attr(keywordsContent(keywords))}">
  ${noindex ? '<meta name="robots" content="noindex, follow">' : ""}
  <link rel="canonical" href="${attr(url)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(description)}">
  <meta property="og:url" content="${attr(url)}">
  <meta property="og:image" content="${attr(absoluteImageUrl(pageImage))}">
  <meta property="og:locale" content="ru_RU">
  <meta name="theme-name" content="remtehcom-service-site">
  <link rel="stylesheet" href="plugins/bulma/bulma.min.css">
  <link rel="stylesheet" href="plugins/themify-icons/themify-icons.css">
  <link href="css/style.css" rel="stylesheet">
  <link rel="icon" href="images/favicon.svg" type="image/svg+xml">
  ${schemaBlocks.map(scriptJson).join("\n  ")}
</head>
<body>
${header(activeFile)}
<main>
${breadcrumbsHtml(breadcrumbs)}
${body}
</main>
${footer()}
<script src="plugins/jQuery/jquery.min.js"></script>
<script src="plugins/masonry/masonry.min.js"></script>
<script src="plugins/clipboard/clipboard.min.js"></script>
<script src="plugins/match-height/jquery.matchHeight-min.js"></script>
<script src="js/script.js"></script>
</body>
</html>
`;
}

function sectionHeader(title, text = "") {
  return `<div class="section-heading">
    <span class="eyebrow">Remtehcom</span>
    <h2>${escapeHtml(title)}</h2>
    ${text ? `<p>${escapeHtml(text)}</p>` : ""}
  </div>`;
}

function hero({ h1, lead, kicker = "Сервисный центр в Туле", image = assetImage, imageAlt, compact = false }) {
  const heroImage = image || assetImage;
  return `
<section class="section hero-section${compact ? " hero-compact" : ""}">
  <img src="${attr(heroImage)}" alt="${attr(imageAlt || "Мастер по ремонту бытовой техники в Туле")}" class="hero-background">
  <div class="hero-overlay" aria-hidden="true"></div>
  <div class="container">
    <div class="hero-content has-text-centered-mobile has-text-left-desktop">
        <span class="hero-kicker">${escapeHtml(kicker)}</span>
        <h1>${escapeHtml(h1)}</h1>
        <p class="hero-lead">${escapeHtml(lead)}</p>
        <div class="hero-actions">
          <a href="${phoneHref(company.phone)}" class="btn btn-primary">Позвонить мастеру</a>
          <a href="contact.html#request" class="btn btn-outline-primary">Оставить заявку</a>
        </div>
        <ul class="hero-badges">
          <li>Тула и область</li>
          <li>Ремонт на дому</li>
          <li>Гарантия</li>
          <li>Стоимость до начала работ</li>
        </ul>
    </div>
  </div>
</section>`;
}

function serviceCards(list = services) {
  return `
<div class="columns is-multiline service-grid">
  ${list
    .map(
      (service) => {
        const image = service.image || assetImage;
        return `
  <div class="column is-4-widescreen is-4-desktop is-6-tablet">
    <article class="card service-card match-height">
      <figure class="service-card-image">
        <img src="${attr(image)}" alt="${attr(`${service.name} в Туле`)}" loading="lazy">
      </figure>
      <div class="card-body">
        <h3 class="card-title h4">${escapeHtml(service.name)}</h3>
        <p class="card-text">${escapeHtml(service.lead)}</p>
        <a href="${serviceFile(service)}" class="card-link">Подробнее об услуге</a>
      </div>
    </article>
  </div>`;
      }
    )
    .join("\n")}
</div>`;
}

function benefitsBlock(title = "Почему выбирают Remtehcom") {
  return `
<section class="section soft-section">
  <div class="container">
    ${sectionHeader(title, "Ремонтируем технику так, чтобы клиент понимал причину поломки, стоимость и срок службы после ремонта.")}
    <div class="columns is-multiline">
      ${benefits
        .map(
          (item) => `
      <div class="column is-3-desktop is-6-tablet">
        <article class="feature-tile match-height">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>
      </div>`
        )
        .join("\n")}
    </div>
  </div>
</section>`;
}

function processBlock() {
  return `
<section class="section">
  <div class="container">
    ${sectionHeader("Как мы работаем", "Прозрачный порядок ремонта помогает заранее понять, что будет происходить с техникой.")}
    <div class="process-line">
      ${process
        .map(
          (item, index) => `
      <article class="process-step">
        <span>${index + 1}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.text)}</p>
      </article>`
        )
        .join("\n")}
    </div>
  </div>
</section>`;
}

function faqBlock(faq, prefix = "faq") {
  return `
<section class="section soft-section">
  <div class="container">
    ${sectionHeader("Часто задаваемые вопросы", "Собрали ответы на вопросы, которые чаще всего задают перед вызовом мастера.")}
    <div class="faq-list">
      ${faq
        .map((item, index) => {
          const id = `${prefix}-${index + 1}`;
          return `
      <div class="border border-default collapse-wrapper faq-item">
        <a class="is-flex is-align-items-center p-3 collapse-head" data-toggle="collapse" href="#${id}" role="button" aria-expanded="${index === 0 ? "true" : "false"}">
          <span>${escapeHtml(item.question)}</span><i class="ti-plus ml-auto no-pointer" aria-hidden="true"></i>
        </a>
        <div class="collapse" id="${id}" ${index === 0 ? 'style="display:block;" aria-expanded="true"' : 'aria-expanded="false"'}>
          <div class="p-3">${escapeHtml(item.answer)}</div>
        </div>
      </div>`;
        })
        .join("\n")}
    </div>
  </div>
</section>`;
}

function contactCta(title = "Нужен мастер по ремонту бытовой техники в Туле?") {
  return `
<section class="section cta-section">
  <div class="container">
    <div class="cta-panel">
      <div>
        <span class="eyebrow">Вызов мастера</span>
        <h2>${escapeHtml(title)}</h2>
        <p>Позвоните в Remtehcom или оставьте заявку. Мы уточним тип техники, симптомы неисправности и согласуем удобное время диагностики.</p>
      </div>
      <div class="cta-actions">
        <a href="${phoneHref(company.phone)}" class="btn btn-primary">${escapeHtml(company.phone)}</a>
        <a href="contact.html#request" class="btn btn-outline-primary">Оставить заявку</a>
      </div>
    </div>
  </div>
</section>`;
}

function pricesTable(service) {
  return `
<table class="price-table">
  <thead><tr><th>Работа</th><th>Цена</th></tr></thead>
  <tbody>
    ${service.priceRows.map(([name, price]) => `<tr><td>${escapeHtml(name)}</td><td>${escapeHtml(price)}</td></tr>`).join("\n")}
  </tbody>
</table>`;
}

function reviewsBlock() {
  return `
<section class="section">
  <div class="container">
    ${sectionHeader("Отзывы клиентов", "Отзывы помогают понять, как мы общаемся, диагностируем и согласуем ремонт.")}
    <div class="columns is-multiline">
      ${reviews
        .map(
          (review) => `
      <div class="column is-6-desktop">
        <article class="review-card match-height">
          <p>${escapeHtml(review.text)}</p>
          <strong>${escapeHtml(review.name)}</strong>
        </article>
      </div>`
        )
        .join("\n")}
    </div>
  </div>
</section>`;
}

function compactPricesBlock() {
  return `
<section class="section">
  <div class="container">
    ${sectionHeader("Стоимость ремонта", "Цены зависят от модели, характера поломки и деталей. Точную сумму мастер называет после диагностики.")}
    <div class="table-wrap">
      <table class="price-table">
        <thead><tr><th>Услуга</th><th>Ориентир</th><th>Страница</th></tr></thead>
        <tbody>
          ${services
            .map((service) => `<tr><td>${escapeHtml(service.name)}</td><td>${escapeHtml(service.priceRows[1][1])}</td><td><a href="${serviceFile(service)}">Подробнее</a></td></tr>`)
            .join("\n")}
        </tbody>
      </table>
    </div>
    <p class="price-note">Диагностика, выезд и детали согласуются до начала работ. Итоговая стоимость зависит от состояния техники и наличия комплектующих.</p>
  </div>
</section>`;
}

function contactBlock() {
  return `
<section class="section contact-section" id="request">
  <div class="container">
    ${sectionHeader("Контакты и заявка", "Свяжитесь с нами, чтобы вызвать мастера или уточнить возможность ремонта вашей техники.")}
    <div class="columns is-multiline">
      <div class="column is-5-desktop">
        <div class="contact-card">
          <h3>Remtehcom в Туле</h3>
          <ul class="contact-list">
            <li><i class="ti-location-pin" aria-hidden="true"></i>${escapeHtml(company.address)}</li>
            <li><i class="ti-mobile" aria-hidden="true"></i><a href="${phoneHref(company.phone)}">${escapeHtml(company.phone)}</a></li>
            <li><i class="ti-mobile" aria-hidden="true"></i><a href="${phoneHref(company.mobile)}">${escapeHtml(company.mobile)}</a></li>
            <li><i class="ti-email" aria-hidden="true"></i><a href="mailto:${attr(company.email)}">${escapeHtml(company.email)}</a></li>
            <li><i class="ti-time" aria-hidden="true"></i>${escapeHtml(company.workingHours)}</li>
          </ul>
          <a href="${attr(company.mapUrl)}" class="btn btn-outline-primary" target="_blank" rel="noopener">Открыть карту</a>
        </div>
      </div>
      <div class="column is-7-desktop">
        <form class="request-form" action="#" method="post">
          <div class="columns is-multiline">
            <div class="form-group column is-6-desktop">
              <label for="name">Ваше имя</label>
              <input class="input" id="name" name="name" type="text" placeholder="Как к вам обращаться" required>
            </div>
            <div class="form-group column is-6-desktop">
              <label for="phone">Телефон</label>
              <input class="input" id="phone" name="phone" type="tel" placeholder="+7 ___ ___-__-__" required>
            </div>
            <div class="form-group column is-12">
              <label for="service">Техника</label>
              <select class="input custom-select" id="service" name="service">
                <option value="">Выберите услугу</option>
                ${services.map((service) => `<option>${escapeHtml(service.name)}</option>`).join("\n")}
              </select>
            </div>
            <div class="form-group column is-12">
              <label for="message">Что случилось</label>
              <textarea class="input" id="message" name="message" placeholder="Например: холодильник не морозит, стиральная машина не сливает воду"></textarea>
            </div>
            <div class="column is-12">
              <button class="btn btn-primary" type="submit">Отправить заявку</button>
              <p class="form-note">Форма демонстрационная для статического сайта. Для срочного ремонта звоните по телефону.</p>
            </div>
          </div>
        </form>
      </div>
      <div class="column is-12">
        <iframe class="map-frame" src="${attr(company.mapEmbed)}" title="Карта: Remtehcom, Тула, Октябрьская 1" loading="lazy"></iframe>
      </div>
    </div>
  </div>
</section>`;
}

function renderHome() {
  const body = `
${hero({
  h1: "Ремонт бытовой техники в Туле",
  lead: "Remtehcom - мастер по ремонту бытовой техники в Туле. Ремонтируем холодильники, стиральные машины, посудомойки, телевизоры, микроволновки, кондиционеры, плиты и другую технику с гарантией.",
  imageAlt: "Ремонт бытовой техники в Туле"
})}
<section class="section">
  <div class="container">
    ${sectionHeader("Услуги по ремонту техники", "Подберите нужную услугу и узнайте, какие неисправности мы устраняем на дому в Туле и Тульской области.")}
    ${serviceCards()}
  </div>
</section>
${benefitsBlock()}
${processBlock()}
<section class="section soft-section">
  <div class="container">
    ${sectionHeader("Частые неисправности", "Повод вызвать мастера - не только полная остановка техники. Ранняя диагностика часто снижает стоимость ремонта.")}
    <div class="columns is-multiline">
      ${[
        "техника не включается или выбивает автомат",
        "нет нагрева, охлаждения, слива или набора воды",
        "появились шум, запах гари, вибрация или протечка",
        "на дисплее отображается ошибка",
        "прибор работает, но результат стал хуже обычного",
        "нужен ремонт рядом и быстрый вызов мастера"
      ]
        .map((item) => `<div class="column is-4-desktop is-6-tablet"><div class="symptom-pill">${escapeHtml(item)}</div></div>`)
        .join("\n")}
    </div>
  </div>
</section>
${compactPricesBlock()}
${reviewsBlock()}
${faqBlock(homeFaq, "home-faq")}
${contactCta()}`;

  return layout({
    file: "index.html",
    title: "Ремонт бытовой техники в Туле | Мастер на дом Remtehcom",
    description: "Ремонт бытовой техники в Туле и Тульской области: холодильники, стиральные машины, посудомойки, телевизоры, микроволновки, кондиционеры. Вызов мастера, гарантия.",
    breadcrumbs: [{ name: "Главная", file: "index.html" }],
    faq: homeFaq,
    body
  });
}

function renderAbout() {
  const body = `
${hero({
  h1: "О сервисном центре Remtehcom",
  lead: "Remtehcom помогает жителям Тулы и Тульской области ремонтировать бытовую, цифровую и кухонную технику без лишних обещаний и скрытых условий.",
  kicker: "О компании",
  compact: true,
  imageAlt: "Сервисный центр Remtehcom в Туле"
})}
<section class="section">
  <div class="container content commercial-content">
    <h2>Ремонт техники с понятной диагностикой</h2>
    <p>Мы работаем с техникой, которая каждый день нужна дома и в офисе: холодильниками, стиральными и посудомоечными машинами, телевизорами, СВЧ-печами, кондиционерами, электроплитами, духовыми шкафами, варочными панелями, кофемашинами, пылесосами и мелкой бытовой техникой.</p>
    <p>Главный принцип Remtehcom - объяснить клиенту причину неисправности простым языком. Мастер сначала проводит диагностику, затем согласует работы и только после этого приступает к ремонту. Такой подход помогает избежать неожиданных расходов и лишней замены деталей.</p>
    <h2>География работы</h2>
    <p>Основной регион обслуживания - Тула. По Тульской области выезд согласуется отдельно: при заявке достаточно назвать адрес, тип техники и признаки поломки. Мы подскажем ближайшее возможное время визита и ориентир по диагностике.</p>
  </div>
</section>
${benefitsBlock("Наши преимущества")}
${processBlock()}
${contactCta("Обсудить ремонт техники с мастером Remtehcom")}`;

  return layout({
    file: "about.html",
    activeFile: "about.html",
    title: "О компании Remtehcom | Ремонт бытовой техники в Туле",
    description: "Информация о сервисном центре Remtehcom в Туле: ремонт бытовой техники, выезд мастера, диагностика, гарантия и работа по Тульской области.",
    breadcrumbs: [
      { name: "Главная", file: "index.html" },
      { name: "О компании", file: "about.html" }
    ],
    body
  });
}

function renderServices() {
  const body = `
${hero({
  h1: "Услуги по ремонту бытовой техники в Туле",
  lead: "Отдельные SEO-страницы услуг помогут быстро найти нужный ремонт: холодильники, стиральные машины, посудомойки, телевизоры, плиты, кофемашины и другая техника.",
  kicker: "Все услуги",
  compact: true,
  imageAlt: "Услуги по ремонту бытовой техники в Туле"
})}
<section class="section">
  <div class="container">
    ${sectionHeader("Выберите технику", "На каждой странице указаны частые поломки, ориентировочные цены, FAQ и смежные услуги.")}
    ${serviceCards()}
  </div>
</section>
${compactPricesBlock()}
${contactCta("Не нашли свою технику в списке?")}`;

  return layout({
    file: "services.html",
    activeFile: "services.html",
    title: "Все услуги Remtehcom | Ремонт техники в Туле",
    description: "Все услуги Remtehcom по ремонту бытовой техники в Туле: холодильники, стиральные машины, посудомойки, телевизоры, микроволновки, кондиционеры и другая техника.",
    breadcrumbs: [
      { name: "Главная", file: "index.html" },
      { name: "Все услуги", file: "services.html" }
    ],
    body
  });
}

function relatedServices(current) {
  return services
    .filter((service) => service.slug !== current.slug)
    .slice(0, 5);
}

function renderService(service) {
  const related = relatedServices(service);
  const body = `
${hero({
  h1: service.h1,
  lead: service.lead,
  kicker: "Ремонт на дому в Туле",
  compact: true,
  image: service.image,
  imageAlt: `${service.name} в Туле`
})}
<section class="section">
  <div class="container">
    <div class="columns is-multiline">
      <div class="column is-8-desktop content commercial-content">
        <h2>${escapeHtml(service.name)}: диагностика и ремонт</h2>
        ${service.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n")}
        <h2>Частые неисправности</h2>
        <ul>
          ${service.faults.map((fault) => `<li>${escapeHtml(fault)}</li>`).join("\n")}
        </ul>
        <h2>Стоимость ремонта</h2>
        <p>Цены указаны как ориентир. Итоговая стоимость зависит от модели, состояния техники, сложности доступа и необходимости замены деталей.</p>
        ${pricesTable(service)}
      </div>
      <aside class="column is-4-desktop">
        <div class="side-panel">
          <h2 class="h4">Вызвать мастера</h2>
          <p>Опишите поломку и назовите модель техники. Мастер подскажет ориентир по диагностике и времени выезда.</p>
          <a href="${phoneHref(company.phone)}" class="btn btn-primary">${escapeHtml(company.phone)}</a>
          <a href="contact.html#request" class="btn btn-outline-primary">Заявка онлайн</a>
        </div>
        <div class="side-panel">
          <h2 class="h4">Другие услуги</h2>
          <ul class="side-links">
            ${related.map((item) => `<li><a href="${serviceFile(item)}">${escapeHtml(item.name)}</a></li>`).join("\n")}
          </ul>
        </div>
      </aside>
    </div>
  </div>
</section>
${benefitsBlock(`Преимущества услуги «${service.short}»`)}
${processBlock()}
${faqBlock(service.faq, service.slug)}
${contactCta(`Заказать ${service.name.toLowerCase()} в Туле`)}`;

  return layout({
    file: serviceFile(service),
    activeFile: "services.html",
    title: service.title,
    description: service.description,
    keywords: service.keywords,
    image: service.image,
    breadcrumbs: [
      { name: "Главная", file: "index.html" },
      { name: "Услуги", file: "services.html" },
      { name: service.name, file: serviceFile(service) }
    ],
    faq: service.faq,
    schemas: [serviceSchema(service)],
    body
  });
}

function renderPrices() {
  const body = `
${hero({
  h1: "Цены на ремонт бытовой техники в Туле",
  lead: "Публикуем ориентировочные цены, чтобы вы могли заранее оценить порядок расходов. Точная сумма ремонта называется после диагностики.",
  kicker: "Стоимость ремонта",
  compact: true,
  imageAlt: "Цены на ремонт бытовой техники в Туле"
})}
<section class="section">
  <div class="container">
    ${sectionHeader("Прайс по услугам", "Для каждой техники цена зависит от модели, симптомов, доступа к узлам и стоимости деталей.")}
    <div class="columns is-multiline price-groups">
      ${services
        .map(
          (service) => `
      <div class="column is-6-desktop">
        <article class="price-card match-height">
          <h2 class="h4"><a href="${serviceFile(service)}">${escapeHtml(service.name)}</a></h2>
          ${pricesTable(service)}
        </article>
      </div>`
        )
        .join("\n")}
    </div>
    <p class="price-note">Если после диагностики ремонт не требуется или клиент отказывается от работ, оплачивается только диагностика и выезд по согласованию.</p>
  </div>
</section>
${contactCta("Уточнить стоимость ремонта по вашей модели")}`;

  return layout({
    file: "prices.html",
    activeFile: "prices.html",
    title: "Цены на ремонт бытовой техники в Туле | Remtehcom",
    description: "Ориентировочные цены на ремонт бытовой техники в Туле: холодильники, стиральные машины, посудомойки, телевизоры, плиты, микроволновки и другая техника.",
    breadcrumbs: [
      { name: "Главная", file: "index.html" },
      { name: "Цены", file: "prices.html" }
    ],
    body
  });
}

function renderReviews() {
  const body = `
${hero({
  h1: "Отзывы о Remtehcom",
  lead: "Отзывы показывают, как проходит ремонт: от заявки и диагностики до проверки техники и гарантии.",
  kicker: "Отзывы клиентов",
  compact: true,
  imageAlt: "Отзывы клиентов Remtehcom в Туле"
})}
${reviewsBlock()}
${contactCta("Оставить заявку на ремонт техники")}`;

  return layout({
    file: "reviews.html",
    activeFile: "reviews.html",
    title: "Отзывы клиентов Remtehcom | Ремонт техники в Туле",
    description: "Отзывы клиентов о ремонте бытовой техники Remtehcom в Туле: выезд мастера, диагностика, гарантия и понятная стоимость.",
    breadcrumbs: [
      { name: "Главная", file: "index.html" },
      { name: "Отзывы", file: "reviews.html" }
    ],
    body
  });
}

function renderFaqPage() {
  const body = `
${hero({
  h1: "FAQ по ремонту бытовой техники в Туле",
  lead: "Ответы на частые вопросы о выезде мастера, диагностике, сроках, гарантии и стоимости ремонта в Туле и Тульской области.",
  kicker: "Вопросы и ответы",
  compact: true,
  imageAlt: "FAQ по ремонту бытовой техники в Туле"
})}
${faqBlock(generalFaq, "general-faq")}
${contactCta("Остались вопросы по ремонту?")}`;

  return layout({
    file: "faq.html",
    activeFile: "faq.html",
    title: "FAQ Remtehcom | Ремонт бытовой техники в Туле",
    description: "Частые вопросы о ремонте бытовой техники в Туле: вызов мастера, диагностика, срочный ремонт, гарантия, цены и выезд по Тульской области.",
    breadcrumbs: [
      { name: "Главная", file: "index.html" },
      { name: "FAQ", file: "faq.html" }
    ],
    faq: generalFaq,
    body
  });
}

function renderContactPage() {
  const body = `
${hero({
  h1: "Контакты Remtehcom в Туле",
  lead: `Позвоните, напишите или оставьте заявку на ремонт бытовой техники. Адрес сервисного центра: ${company.address}.`,
  kicker: "Контакты",
  compact: true,
  imageAlt: "Контакты Remtehcom в Туле"
})}
${contactBlock()}`;

  return layout({
    file: "contact.html",
    activeFile: "contact.html",
    title: "Контакты Remtehcom | Вызов мастера в Туле",
    description: "Контакты Remtehcom в Туле: адрес, телефоны, email, график работы и форма заявки на ремонт бытовой техники.",
    breadcrumbs: [
      { name: "Главная", file: "index.html" },
      { name: "Контакты", file: "contact.html" }
    ],
    body
  });
}

function renderPrivacy() {
  const body = `
${hero({
  h1: "Политика конфиденциальности",
  lead: "Правила обработки данных, которые пользователь передает при обращении в Remtehcom через сайт, телефон или email.",
  kicker: "Документы",
  compact: true,
  imageAlt: "Политика конфиденциальности Remtehcom"
})}
<section class="section">
  <div class="container content commercial-content">
    <h2>Общие положения</h2>
    <p>Настоящая политика описывает порядок обработки персональных данных пользователей сайта Remtehcom. Данные используются для связи по заявке, уточнения деталей ремонта и предоставления информации об услугах.</p>
    <h2>Какие данные могут обрабатываться</h2>
    <p>При отправке заявки пользователь может указать имя, телефон, email, адрес обслуживания, тип техники и описание неисправности. Эти сведения нужны для обратной связи и организации выезда мастера.</p>
    <h2>Цели обработки</h2>
    <p>Данные используются для приема заявок, консультаций, согласования диагностики, ремонта, гарантии и улучшения качества сервиса. Remtehcom не публикует персональные данные пользователей на сайте.</p>
    <h2>Защита данных</h2>
    <p>Мы принимаем разумные организационные меры для защиты полученной информации от несанкционированного доступа. Пользователь может запросить уточнение или удаление своих данных, связавшись по телефону или email.</p>
    <h2>Контакты</h2>
    <p>По вопросам обработки данных обращайтесь: ${escapeHtml(company.email)}, ${escapeHtml(company.phone)}, ${escapeHtml(company.address)}.</p>
  </div>
</section>`;

  return layout({
    file: "privacy.html",
    activeFile: "contact.html",
    title: "Политика конфиденциальности | Remtehcom",
    description: "Политика конфиденциальности сайта Remtehcom: обработка заявок, контактных данных и обращений клиентов по ремонту техники в Туле.",
    breadcrumbs: [
      { name: "Главная", file: "index.html" },
      { name: "Политика конфиденциальности", file: "privacy.html" }
    ],
    body
  });
}

function renderNotFound() {
  const body = `
<section class="section not-found-section">
  <div class="container has-text-centered">
    <span class="error-code">404</span>
    <h1>Страница не найдена</h1>
    <p>Возможно, адрес изменился. Перейдите к услугам Remtehcom или свяжитесь с мастером по ремонту бытовой техники в Туле.</p>
    <div class="hero-actions is-justify-content-center">
      <a href="services.html" class="btn btn-primary">Все услуги</a>
      <a href="contact.html#request" class="btn btn-outline-primary">Связаться</a>
    </div>
  </div>
</section>`;

  return layout({
    file: "404.html",
    activeFile: "index.html",
    title: "404 | Страница не найдена | Remtehcom",
    description: "Страница не найдена. Перейдите к услугам Remtehcom или оставьте заявку на ремонт бытовой техники в Туле.",
    breadcrumbs: [
      { name: "Главная", file: "index.html" },
      { name: "404", file: "404.html" }
    ],
    noindex: true,
    body
  });
}

function renderLegacy(file, target, title) {
  const body = `
<section class="section not-found-section">
  <div class="container has-text-centered">
    <h1>${escapeHtml(title)}</h1>
    <p>Старая демо-страница заменена новым SEO-сайтом Remtehcom. Актуальная информация доступна в разделе услуг.</p>
    <a href="${target}" class="btn btn-primary">Перейти к актуальному разделу</a>
  </div>
</section>`;

  return layout({
    file,
    activeFile: "services.html",
    title: `${title} | Remtehcom`,
    description: "Служебная страница перехода на актуальный раздел сайта Remtehcom по ремонту бытовой техники в Туле.",
    breadcrumbs: [
      { name: "Главная", file: "index.html" },
      { name: title, file }
    ],
    noindex: true,
    body
  });
}

function sitemap() {
  const pages = [
    "index.html",
    "about.html",
    "services.html",
    "prices.html",
    "reviews.html",
    "faq.html",
    "contact.html",
    "privacy.html",
    ...services.map(serviceFile)
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((file) => `  <url><loc>${canonicalUrl(file)}</loc></url>`)
  .join("\n")}
</urlset>
`;
}

function robots() {
  return `User-agent: *
Allow: /

Sitemap: ${company.baseUrl}/sitemap.xml
`;
}

function htaccess() {
  return `Options -Indexes
RewriteEngine On

RewriteCond %{THE_REQUEST} \\s/+(.+?)\\.html[\\s?] [NC]
RewriteRule ^ /%1 [R=301,L,NE]

RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.+?)/?$ $1.html [L]

ErrorDocument 404 /404.html
`;
}

function write(file, content) {
  fs.writeFileSync(path.join(outDir, file), content, "utf8");
}

function build() {
  write("index.html", renderHome());
  write("about.html", renderAbout());
  write("services.html", renderServices());
  write("prices.html", renderPrices());
  write("reviews.html", renderReviews());
  write("faq.html", renderFaqPage());
  write("contact.html", renderContactPage());
  write("privacy.html", renderPrivacy());
  write("404.html", renderNotFound());

  services.forEach((service) => {
    write(serviceFile(service), renderService(service));
  });

  write("sitemap.xml", sitemap());
  write("robots.txt", robots());
  write(".htaccess", htaccess());
}

build();
console.log(`Generated ${services.length + 9} pages for ${company.name}`);
