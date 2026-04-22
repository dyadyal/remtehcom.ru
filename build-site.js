const fs = require("node:fs");
const path = require("node:path");
const {
  company,
  benefits,
  process,
  reviews,
  mapRatings,
  generalFaq,
  homeFaq,
  services
} = require("./site-data");

const outDir = __dirname;
const serviceFile = (service) => `${service.slug}.html`;
const articleFile = (article) => `${article.slug}.html`;
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

const homeSemanticGroupsData = [
  {
    title: "Коммерческие запросы",
    items: [
      { label: "ремонт бытовой техники в Туле", href: "services.html" },
      { label: "мастер по ремонту бытовой техники в Туле", href: "contact.html#request" },
      { label: "ремонт холодильников Тула", href: "remont-holodilnikov-tula.html" },
      { label: "ремонт стиральных машин Тула", href: "remont-stiralnyh-mashin-tula.html" },
      { label: "ремонт посудомоечных машин Тула", href: "remont-posudomoechnyh-mashin-tula.html" },
      { label: "срочный ремонт бытовой техники Тула", href: "srochnyy-remont-bytovoy-tehniki-v-tule.html" },
      { label: "цены на ремонт бытовой техники Тула", href: "prices.html" },
      { label: "ремонт техники Тульская область", href: "remont-tehniki-v-tulskoy-oblasti.html" }
    ]
  },
  {
    title: "Информационные запросы",
    items: [
      { label: "почему не включается холодильник", href: "remont-holodilnikov-tula-ne-vklyuchaetsya.html" },
      { label: "холодильник течет что делать", href: "remont-holodilnikov-tula-techet.html" },
      { label: "стиральная машина шумит при отжиме", href: "remont-stiralnyh-mashin-tula-shumit.html" },
      { label: "посудомоечная машина ошибка", href: "remont-posudomoechnyh-mashin-tula-oshibka.html" },
      { label: "телевизор не включается", href: "remont-televizorov-tula-ne-vklyuchaetsya.html" },
      { label: "микроволновка не греет", href: "remont-mikrovolnovok-tula-ne-vklyuchaetsya.html" },
      { label: "кондиционер течет", href: "remont-kondicionerov-tula-techet.html" },
      { label: "варочная панель ошибка", href: "remont-varochnyh-paneley-tula-oshibka.html" }
    ]
  }
];

const navItems = [
  ["index.html", "Главная"],
  ["services.html", "Услуги"],
  ["article.html", "Статьи"],
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

function routePath(file) {
  if (file === "index.html") {
    return "/";
  }
  if (file === "404.html") {
    return "/404.html";
  }
  if (file.endsWith(".html")) {
    return `/${file.replace(/\.html$/, "")}/`;
  }
  return `/${file.replace(/^\/+/, "")}`;
}

function siteBasePath() {
  const value = String(company.basePath || "").trim();
  if (!value || value === "/") {
    return "";
  }
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

function publicPath(value) {
  const pathname = value === "/" ? "/" : `/${String(value || "").replace(/^\/+/, "")}`;
  return `${siteBasePath()}${pathname}`;
}

function siteOrigin() {
  return String(company.baseUrl || "").replace(/\/+$/, "");
}

function canonicalUrl(file) {
  return `${siteOrigin()}${publicPath(routePath(file))}`;
}

function pageHref(value) {
  if (!value || /^(https?:|mailto:|tel:|#)/i.test(value)) {
    return value;
  }
  const [file, hash] = value.split("#");
  const href = publicPath(routePath(file));
  return hash ? `${href}#${hash}` : href;
}

function sitePath(value) {
  if (!value || /^(https?:|mailto:|tel:|#)/i.test(value)) {
    return value;
  }
  return publicPath(`/${value.replace(/^\/+/, "")}`);
}

function outputPath(file) {
  if (!file.endsWith(".html") || file === "index.html" || file === "404.html") {
    return file;
  }
  return `${file.replace(/\.html$/, "")}/index.html`;
}

function absoluteImageUrl(image = assetImage) {
  return `${siteOrigin()}${sitePath(image || assetImage)}`;
}

function keywordsContent(keywords = defaultKeywords) {
  return Array.isArray(keywords) ? keywords.join(", ") : keywords;
}

function scriptJson(data) {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2).replace(/</g, "\\u003c")}</script>`;
}

function localBusinessSchema() {
  const origin = siteOrigin();
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.legalName,
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
    ]
  };

  if (origin) {
    schema.url = origin;
    schema.sameAs = [origin];
  }

  return schema;
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

function articleSchema(article) {
  const origin = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.h1,
    description: article.description,
    image: absoluteImageUrl(article.image),
    author: {
      "@type": "Organization",
      name: company.legalName
    },
    publisher: {
      "@type": "Organization",
      name: company.legalName,
      logo: {
        "@type": "ImageObject",
        url: `${origin}${sitePath("images/logo.png")}`
      }
    },
    mainEntityOfPage: canonicalUrl(articleFile(article))
  };
}

function header(activeFile) {
  const nav = navItems
    .map(([href, label]) => {
      const active = href === activeFile ? " is-active" : "";
      return `<a class="navbar-item${active}" href="${pageHref(href)}">${escapeHtml(label)}</a>`;
    })
    .join("\n");

  return `
<nav class="navbar is-sticky-top navigation site-nav" role="navigation" aria-label="Основная навигация">
  <div class="container">
    <div class="navbar-brand">
      <a class="navbar-item brand-link" href="${pageHref("index.html")}" aria-label="Remtehcom - ремонт бытовой техники в Туле">
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
          <a href="${pageHref("contact.html#request")}" class="btn btn-sm btn-primary ml-4">Вызвать мастера</a>
        </div>
      </div>
    </div>
  </div>
</nav>`;
}

function footer() {
  const serviceLinks = services
    .slice(0, 6)
    .map((service) => `<li><a href="${pageHref(serviceFile(service))}">${escapeHtml(service.name)}</a></li>`)
    .join("\n");

  return `
<footer class="site-footer">
  <div class="container">
    <div class="columns is-multiline">
      <div class="column is-4-desktop is-12-tablet">
        <a class="footer-brand" href="${pageHref("index.html")}">
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
      <a href="${pageHref("privacy.html")}">Политика конфиденциальности</a>
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
          return `<li>${isLast ? `<span aria-current="page">${escapeHtml(item.name)}</span>` : `<a${linkClass} href="${pageHref(item.file)}">${linkText}</a>`}</li>`;
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
  <link rel="stylesheet" href="${sitePath("plugins/bulma/bulma.min.css")}">
  <link rel="stylesheet" href="${sitePath("plugins/themify-icons/themify-icons.css")}">
  <link href="${sitePath("css/style.css")}" rel="stylesheet">
  <link rel="icon" href="${sitePath("images/favicon.svg")}" type="image/svg+xml">
  ${schemaBlocks.map(scriptJson).join("\n  ")}
</head>
<body>
${header(activeFile)}
<main>
${breadcrumbsHtml(breadcrumbs)}
${body}
</main>
${footer()}
<script src="${sitePath("plugins/jQuery/jquery.min.js")}"></script>
<script src="${sitePath("plugins/masonry/masonry.min.js")}"></script>
<script src="${sitePath("plugins/clipboard/clipboard.min.js")}"></script>
<script src="${sitePath("plugins/match-height/jquery.matchHeight-min.js")}"></script>
<script src="${sitePath("js/script.js")}"></script>
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
  <img src="${attr(sitePath(heroImage))}" alt="${attr(imageAlt || "Мастер по ремонту бытовой техники в Туле")}" class="hero-background">
  <div class="hero-overlay" aria-hidden="true"></div>
  <div class="container">
    <div class="hero-content has-text-centered-mobile has-text-left-desktop">
        <span class="hero-kicker">${escapeHtml(kicker)}</span>
        <h1>${escapeHtml(h1)}</h1>
        <p class="hero-lead">${escapeHtml(lead)}</p>
        <div class="hero-actions">
          <a href="${phoneHref(company.phone)}" class="btn btn-primary">Позвонить мастеру</a>
          <a href="${pageHref("contact.html#request")}" class="btn btn-outline-primary">Оставить заявку</a>
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
        <img src="${attr(sitePath(image))}" alt="${attr(`${service.name} в Туле`)}" loading="lazy">
      </figure>
      <div class="card-body">
        <h3 class="card-title h4">${escapeHtml(service.name)}</h3>
        <p class="card-text">${escapeHtml(service.lead)}</p>
        <a href="${pageHref(serviceFile(service))}" class="card-link">Подробнее об услуге</a>
      </div>
    </article>
  </div>`;
      }
    )
    .join("\n")}
</div>`;
}

function serviceSemanticGroups(service) {
  const relatedArticlesMap = {
    "remont-holodilnikov-tula": [
      { label: "почему не включается холодильник", href: "remont-holodilnikov-tula-ne-vklyuchaetsya.html" },
      { label: "холодильник течет", href: "remont-holodilnikov-tula-techet.html" },
      { label: "холодильник шумит", href: "remont-holodilnikov-tula-shumit.html" },
      { label: "ошибка холодильника", href: "remont-holodilnikov-tula-oshibka.html" }
    ],
    "remont-stiralnyh-mashin-tula": [
      { label: "стиральная машина не включается", href: "remont-stiralnyh-mashin-tula-ne-vklyuchaetsya.html" },
      { label: "стиральная машина течет", href: "remont-stiralnyh-mashin-tula-techet.html" },
      { label: "стиральная машина шумит", href: "remont-stiralnyh-mashin-tula-shumit.html" },
      { label: "ошибка стиральной машины", href: "remont-stiralnyh-mashin-tula-oshibka.html" }
    ],
    "remont-posudomoechnyh-mashin-tula": [
      { label: "посудомоечная машина не включается", href: "remont-posudomoechnyh-mashin-tula-ne-vklyuchaetsya.html" },
      { label: "посудомоечная машина течет", href: "remont-posudomoechnyh-mashin-tula-techet.html" },
      { label: "посудомоечная машина шумит", href: "remont-posudomoechnyh-mashin-tula-shumit.html" },
      { label: "ошибка посудомоечной машины", href: "remont-posudomoechnyh-mashin-tula-oshibka.html" }
    ]
  };

  return [
    {
      title: "Коммерческие формулировки",
      items: service.keywords.slice(0, 6).map((keyword) => ({
        label: keyword,
        href: serviceFile(service)
      }))
    },
    {
      title: "Информационные формулировки",
      items: relatedArticlesMap[service.slug] || relatedArticles(service, 4).map((article) => ({
        label: article.h1.toLowerCase(),
        href: articleFile(article)
      }))
    }
  ];
}

function semanticClusterBlock(groups, title = "Популярные поисковые запросы", subtitle = "Собрали ключевые формулировки, по которым пользователи в Туле ищут услуги, цены, диагностику и ответы по типовым симптомам.") {
  return `
<section class="section">
  <div class="container">
    ${sectionHeader(title, subtitle)}
    <div class="columns is-multiline">
      ${groups
        .map(
          (group) => `
      <div class="column is-6-desktop">
        <article class="semantic-card match-height">
          <h3>${escapeHtml(group.title)}</h3>
          <div class="query-list">
            ${group.items
              .map((item) => `<a href="${attr(pageHref(item.href))}" class="query-chip">${escapeHtml(item.label)}</a>`)
              .join("\n")}
          </div>
        </article>
      </div>`
        )
        .join("\n")}
    </div>
  </div>
</section>`;
}

const articleTopics = [
  {
    key: "ne-vklyuchaetsya",
    suffix: "техника не включается",
    angle: "прибор не реагирует на кнопку питания, отключается через несколько секунд или выбивает автомат",
    focus: "питание, кабель, розетку, защитные цепи и электронный модуль"
  },
  {
    key: "oshibka",
    suffix: "появляется ошибка",
    angle: "на дисплее появляется код, программа останавливается или техника не запускает рабочий цикл",
    focus: "датчики, плату управления, соединения, питание и условия эксплуатации"
  },
  {
    key: "shumit",
    suffix: "появился шум",
    angle: "появились гул, скрежет, вибрация, щелчки или непривычные звуки во время работы",
    focus: "крепления, двигатель, вентилятор, насосы, подшипники и механические узлы"
  },
  {
    key: "techet",
    suffix: "появилась протечка",
    angle: "под техникой появилась вода, влага собирается внутри корпуса или срабатывает защита от протечки",
    focus: "шланги, уплотнители, дренаж, насосы, соединения и герметичность корпуса"
  },
  {
    key: "diagnostika",
    suffix: "диагностика",
    angle: "нужно понять причину поломки до покупки запчастей и согласования ремонта",
    focus: "осмотр, тестирование узлов, оценку стоимости, сроков и целесообразности ремонта"
  },
  {
    key: "stoimost",
    suffix: "стоимость ремонта",
    angle: "цена зависит от модели, доступа к узлам, состояния техники и необходимости замены деталей",
    focus: "тип неисправности, сложность разборки, цену комплектующих и объем работ"
  },
  {
    key: "srochno",
    suffix: "срочный ремонт",
    angle: "техника нужна каждый день, а поломка мешает быту, работе кухни или нормальному хранению продуктов",
    focus: "приоритетные симптомы, порядок заявки, подготовку к приезду мастера и согласование ремонта"
  },
  {
    key: "garantiya",
    suffix: "ремонт с гарантией",
    angle: "важно понимать, какие работы выполняются, какие детали ставятся и как фиксируется гарантия",
    focus: "диагностику, согласование сметы, проверку после ремонта и рекомендации по эксплуатации"
  }
];

const generalArticleIdeas = [
  {
    slug: "remont-bytovoy-tehniki-tula-kak-vybrat-mastera",
    h1: "Как выбрать мастера по ремонту бытовой техники в Туле",
    title: "Как выбрать мастера по ремонту бытовой техники в Туле | Remtehcom",
    description: "Практичная статья о выборе мастера по ремонту бытовой техники в Туле: диагностика, гарантия, цены, выезд, признаки надежного сервиса.",
    keywords: ["мастер по ремонту бытовой техники Тула", "ремонт бытовой техники в Туле", "вызов мастера Тула", "сервисный центр Тула", "ремонт техники с гарантией"],
    lead: "Надежный мастер не обещает точную цену без диагностики, объясняет причину поломки и согласует ремонт до начала работ.",
    sections: [
      ["На что смотреть при выборе", "Для ремонта бытовой техники в Туле важны понятная диагностика, аккуратный выезд, опыт с разными брендами и готовность объяснить клиенту, какие работы действительно нужны."],
      ["Почему цена до диагностики только ориентировочная", "Одна и та же внешняя поломка может быть вызвана разными узлами. Поэтому корректно сначала проверить технику, а затем назвать стоимость ремонта и список деталей."],
      ["Какие вопросы задать мастеру", "Уточните, работает ли специалист с вашей техникой, есть ли гарантия, как согласуется цена, что входит в диагностику и возможен ли ремонт на месте."],
      ["Когда стоит обратиться в Remtehcom", "Если нужна диагностика холодильника, стиральной машины, посудомойки, телевизора, микроволновки, кондиционера или другой техники в Туле, оставьте заявку или позвоните мастеру."]
    ]
  },
  {
    slug: "srochnyy-remont-bytovoy-tehniki-v-tule",
    h1: "Срочный ремонт бытовой техники в Туле: когда нельзя откладывать",
    title: "Срочный ремонт бытовой техники в Туле | Когда вызывать мастера",
    description: "Когда нужен срочный ремонт бытовой техники в Туле: протечка, запах гари, отключение автомата, остановка холодильника, ошибки и шум.",
    keywords: ["срочный ремонт бытовой техники Тула", "вызов мастера Тула", "ремонт техники срочно", "ремонт холодильника срочно", "ремонт стиральной машины срочно"],
    lead: "Некоторые неисправности лучше не проверять повторными включениями: так можно увеличить стоимость ремонта или повредить соседние узлы.",
    sections: [
      ["Опасные симптомы", "Запах гари, искрение, выбивание автомата, протечка, сильная вибрация и перегрев корпуса требуют остановки техники и диагностики."],
      ["Что можно сделать до приезда мастера", "Отключите питание, перекройте воду при протечке, не разбирайте корпус без опыта и подготовьте модель техники, чтобы мастер быстрее оценил ситуацию."],
      ["Какие заявки считаются приоритетными", "Чаще всего срочно обращаются по холодильникам, стиральным машинам, посудомойкам, электроплитам и кондиционерам в сезон жары."],
      ["Как работает Remtehcom", "Мы уточняем район Тулы, тип техники, симптомы и удобное время. Стоимость ремонта согласуется после диагностики."]
    ]
  },
  {
    slug: "diagnostika-bytovoy-tehniki-v-tule",
    h1: "Диагностика бытовой техники в Туле перед ремонтом",
    title: "Диагностика бытовой техники в Туле | Remtehcom",
    description: "Зачем нужна диагностика бытовой техники перед ремонтом в Туле: как мастер определяет причину поломки, цену и целесообразность работ.",
    keywords: ["диагностика бытовой техники Тула", "ремонт техники диагностика", "вызов мастера на диагностику", "ремонт бытовой техники Тула"],
    lead: "Диагностика помогает не менять детали наугад и заранее понять, сколько будет стоить ремонт.",
    sections: [
      ["Что проверяет мастер", "Питание, управляющие узлы, механические детали, нагрев, охлаждение, слив, датчики и соединения проверяются в зависимости от вида техники."],
      ["Почему нельзя назвать точную цену по телефону", "По описанию можно дать ориентир, но окончательная стоимость зависит от конкретной причины неисправности и состояния техники."],
      ["Что получает клиент", "После проверки мастер объясняет причину поломки, варианты ремонта, ориентировочный срок и гарантийные условия."],
      ["Когда диагностика особенно важна", "После скачка напряжения, протечки, перегрева, ошибки на дисплее или повторяющейся поломки диагностика обязательна."]
    ]
  },
  {
    slug: "remont-tehniki-v-tulskoy-oblasti",
    h1: "Ремонт бытовой техники в Туле и Тульской области",
    title: "Ремонт бытовой техники в Туле и Тульской области | Remtehcom",
    description: "Как организовать ремонт бытовой техники в Туле и Тульской области: выезд мастера, диагностика, цены, гарантия, популярные услуги.",
    keywords: ["ремонт бытовой техники Тульская область", "ремонт техники в Туле", "мастер по ремонту техники Тульская область", "выезд мастера Тула"],
    lead: "Для жителей Тулы и области удобнее заранее описать поломку, модель техники и адрес, чтобы согласовать время диагностики.",
    sections: [
      ["Какая техника ремонтируется", "Remtehcom работает с холодильниками, стиральными и посудомоечными машинами, телевизорами, микроволновками, кондиционерами, плитами, духовками, варочными панелями, кофемашинами и пылесосами."],
      ["Как согласуется выезд", "При заявке уточняются адрес, симптомы, срочность и тип техники. По Тульской области условия выезда обсуждаются индивидуально."],
      ["Как формируется цена", "На стоимость влияет вид поломки, доступ к узлам, цена запчастей и объем работ. Точная сумма называется после диагностики."],
      ["Почему важна гарантия", "Гарантия подтверждает, что работы выполнены согласованно, а установленная деталь и ремонт проверены после сборки."]
    ]
  },
  {
    slug: "remont-bytovoy-tehniki-v-tule-ceny-i-sroki",
    h1: "Цены и сроки ремонта бытовой техники в Туле",
    title: "Цены и сроки ремонта бытовой техники в Туле | Remtehcom",
    description: "Как формируются цены и сроки ремонта бытовой техники в Туле: диагностика, сложность поломки, запчасти, выезд мастера и гарантия.",
    keywords: ["цены на ремонт бытовой техники Тула", "сроки ремонта техники Тула", "ремонт техники стоимость", "вызов мастера Тула", "ремонт бытовой техники с гарантией"],
    lead: "Срок и цена ремонта зависят не только от вида техники, но и от причины поломки, доступа к узлам и наличия подходящих деталей.",
    sections: [
      ["Почему цена называется после диагностики", "Одинаковые симптомы могут быть вызваны разными неисправностями. Например, отсутствие нагрева связано с ТЭНом, датчиком, проводкой или платой управления, поэтому точная цена возможна только после проверки."],
      ["Что влияет на срок ремонта", "На срок влияют тип техники, сложность разборки, наличие запчастей и возможность выполнить работу на месте. Простые замены обычно занимают меньше времени, чем ремонт электронных модулей или поиск утечки."],
      ["Как понять ориентир заранее", "По телефону можно назвать модель, возраст техники и симптомы. Мастер подскажет примерный диапазон, но окончательная сумма согласуется только после диагностики."],
      ["Как работает Remtehcom", "Мы объясняем причину поломки, называем стоимость до начала работ и не приступаем к ремонту без согласования. После выполнения работ техника проверяется в рабочих режимах."]
    ]
  },
  {
    slug: "profilaktika-bytovoy-tehniki-v-tule",
    h1: "Профилактика бытовой техники в Туле: как реже вызывать мастера",
    title: "Профилактика бытовой техники в Туле | Советы Remtehcom",
    description: "Профилактика бытовой техники в Туле: как продлить срок службы холодильника, стиральной машины, посудомойки, кондиционера и другой техники.",
    keywords: ["профилактика бытовой техники Тула", "обслуживание бытовой техники", "как продлить срок службы техники", "ремонт техники Тула", "советы мастера по ремонту"],
    lead: "Регулярный уход не отменяет ремонт, но помогает раньше заметить проблему и снизить риск серьезной поломки.",
    sections: [
      ["Холодильники и морозильники", "Следите за температурой, не перекрывайте вентиляцию, очищайте дренаж и не ставьте горячие продукты внутрь. При постоянной работе компрессора или намерзании льда лучше вызвать мастера."],
      ["Стиральные и посудомоечные машины", "Проверяйте фильтры, не перегружайте технику, используйте подходящие средства и обращайте внимание на шум, протечки и ошибки. Ранняя диагностика часто дешевле аварийного ремонта."],
      ["Кондиционеры и кухонная техника", "Кондиционеру нужна чистка фильтров, а плитам, духовкам и варочным панелям - исправные контакты и аккуратное подключение. Запах гари или выбивание автомата нельзя игнорировать."],
      ["Когда нужна диагностика", "Если техника стала работать громче, хуже выполнять основную функцию или периодически отключаться, лучше проверить ее до полной остановки. Remtehcom помогает с диагностикой и ремонтом в Туле."]
    ]
  }
];

function articleIntro(service, topic) {
  return `${service.name} в Туле: ${topic.suffix}. Разбираем типовые причины, порядок диагностики, ориентиры по стоимости и ситуации, когда лучше сразу вызвать мастера Remtehcom.`;
}

function articleKeywords(service, topic) {
  return [
    `${service.name.toLowerCase()} в Туле`,
    `${service.name.toLowerCase()} ${topic.suffix}`,
    `${service.name.toLowerCase()} Тула`,
    `мастер ${service.short.toLowerCase()} Тула`,
    "ремонт бытовой техники в Туле",
    "вызов мастера Тула",
    "ремонт техники Тульская область"
  ];
}

function articleSections(service, topic) {
  const firstFaults = service.faults.slice(0, 3).join(", ");
  const prices = service.priceRows.slice(0, 3).map(([name, price]) => `${name.toLowerCase()} - ${price}`).join("; ");
  return [
    [
      "Когда стоит обратить внимание на проблему",
      `Для услуги «${service.name}» частая ситуация выглядит так: ${topic.angle}. Иногда техника продолжает работать, но нагрузка на узлы растет, поэтому откладывать диагностику надолго не стоит. В Туле такие обращения часто начинаются с поиска «ремонт рядом» или «вызов мастера», когда техника нужна каждый день.`
    ],
    [
      "Что проверяет мастер",
      `Специалист Remtehcom оценивает ${topic.focus}. Для точной диагностики важны модель, возраст техники, условия эксплуатации и симптомы. По телефону можно назвать ориентир, но окончательное решение принимается после проверки на месте.`
    ],
    [
      "Типовые признаки неисправности",
      `Клиенты чаще всего описывают такие признаки: ${firstFaults}. Если симптомы повторяются после перезапуска или отключения от сети, лучше не экспериментировать, а согласовать диагностику. Это снижает риск дорогого ремонта и помогает быстрее вернуть технику в работу.`
    ],
    [
      "Сколько может стоить ремонт",
      `Цены зависят от модели, доступа к узлам и необходимости деталей. Для ориентира по этой услуге: ${prices}. Точная стоимость называется до начала ремонта после диагностики, чтобы клиент понимал итоговую сумму и мог принять решение.`
    ],
    [
      "Как подготовиться к приезду мастера",
      `Освободите доступ к технике, подготовьте документы или название модели, вспомните, когда появилась неисправность и что происходило перед поломкой. Если есть протечка, запах гари или выбивает автомат, технику лучше отключить до диагностики.`
    ],
    [
      "Почему удобно обратиться в Remtehcom",
      `Мы работаем по Туле и согласовываем выезд по Тульской области, объясняем причину поломки простым языком и приступаем к ремонту только после согласования цены. На выполненные работы и установленные детали предоставляется гарантия.`
    ]
  ];
}

function buildArticles() {
  const serviceArticles = services.flatMap((service) =>
    articleTopics.map((topic) => ({
      slug: `${service.slug}-${topic.key}`,
      title: `${service.name} в Туле: ${topic.suffix} | Remtehcom`,
      description: `${service.name} в Туле: ${topic.suffix}. Причины, диагностика, стоимость, вызов мастера Remtehcom и ремонт с гарантией.`,
      keywords: articleKeywords(service, topic),
      h1: `${service.name} в Туле: ${topic.suffix}`,
      lead: articleIntro(service, topic),
      image: service.image || assetImage,
      service,
      sections: articleSections(service, topic)
    }))
  );

  return [
    ...serviceArticles,
    ...generalArticleIdeas.map((article) => ({
      ...article,
      image: assetImage,
      service: services[0]
    }))
  ];
}

const articles = buildArticles();

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
        <a href="${pageHref("contact.html#request")}" class="btn btn-outline-primary">Оставить заявку</a>
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
            .map((service) => `<tr><td>${escapeHtml(service.name)}</td><td>${escapeHtml(service.priceRows[1][1])}</td><td><a href="${pageHref(serviceFile(service))}">Подробнее</a></td></tr>`)
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
${semanticClusterBlock(homeSemanticGroupsData, "Семантика спроса по Туле", "Разделили основные поисковые формулировки на коммерческие запросы по услугам и информационные запросы по симптомам и неисправностям.")}
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
${mapRatingsBlock()}
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
    <h2>Что видно по открытым источникам</h2>
    <p>В публичной выдаче Remtehcom чаще всего фигурирует как сервисный центр в Туле по адресу улица Октябрьская, 1. В карточке 2ГИС указаны сайт remtehcom.ru, телефоны компании, рейтинг 5 и две оценки, а в разделе цен опубликован перечень из 51 позиции, обновленный 13 марта 2026 года.</p>
    <p>Старые каталоги и справочники описывают компанию шире, чем только бытовой ремонт: встречаются категории по телефонам, ноутбукам, планшетам, телевизорам и другой цифровой технике. Это полезно для раздела о компании, потому что показывает не разовое размещение, а долгий след в локальных каталогах Тулы.</p>
    <p>При этом заметных редакционных новостей, пресс-релизов или публикаций СМИ именно о Remtehcom в открытой выдаче сейчас не найдено. Основной массив публичной информации о компании - это карты, городские справочники, сервисные каталоги и карточки с контактами.</p>
  </div>
</section>
<section class="section soft-section">
  <div class="container">
    ${sectionHeader("Remtehcom в картах и каталогах", "Собрали открытые источники, где можно проверить адрес, контакты, профиль сервиса и карточки компании в Туле.")}
    <div class="columns is-multiline">
      <div class="column is-6-desktop">
        <article class="semantic-card match-height">
          <h3>2ГИС</h3>
          <p>Карточка сервисного центра на Октябрьской, 1. В открытой выдаче указаны рейтинг 5, две оценки, сайт компании и перечень услуг.</p>
          <a href="https://2gis.ru/tula/firm/5067077861936712" class="card-link" target="_blank" rel="noopener">Открыть 2ГИС</a>
        </article>
      </div>
      <div class="column is-6-desktop">
        <article class="semantic-card match-height">
          <h3>ServiceBox</h3>
          <p>Один из старых сервисных каталогов по Туле. В карточке Remtehcom указаны адрес, телефоны и профиль по ремонту портативной цифровой техники.</p>
          <a href="https://www.servicebox.ru/Tula/remtehcom/" class="card-link" target="_blank" rel="noopener">Открыть ServiceBox</a>
        </article>
      </div>
      <div class="column is-6-desktop">
        <article class="semantic-card match-height">
          <h3>Poisk-firm</h3>
          <p>Справочная карточка организации в Туле с адресом, телефоном, графиком и категориями ремонта компьютеров, планшетов и ноутбуков.</p>
          <a href="https://poisk-firm.ru/company/668200" class="card-link" target="_blank" rel="noopener">Открыть Poisk-firm</a>
        </article>
      </div>
      <div class="column is-6-desktop">
        <article class="semantic-card match-height">
          <h3>AskTel</h3>
          <p>Публичная карточка компании с адресом, городским и мобильным номером, электронной почтой и ссылкой на официальный сайт Remtehcom.</p>
          <a href="https://asktel.ru/tula/remont_kompyuterov_noutbukov_planshetov/remtehcom/" class="card-link" target="_blank" rel="noopener">Открыть AskTel</a>
        </article>
      </div>
    </div>
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
${semanticClusterBlock(homeSemanticGroupsData, "Коммерческие и информационные кластеры", "Эти формулировки закрывают и коммерческий спрос по услугам, и информационные запросы по симптомам, ошибкам и типовым неисправностям.")}
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

function relatedArticles(service, limit = 6) {
  return articles.filter((article) => article.service.slug === service.slug).slice(0, limit);
}

function articleCards(list = articles) {
  return `
<div class="columns is-multiline article-grid">
${list
    .map(
      (article) => `
  <div class="column is-4-widescreen is-4-desktop is-6-tablet">
    <article class="card article-card match-height">
      <div class="card-body">
        <span class="article-tag">${escapeHtml(article.service.short)}</span>
        <h3 class="card-title h4">${escapeHtml(article.h1)}</h3>
        <p class="card-text">${escapeHtml(article.lead)}</p>
        <a href="${pageHref(articleFile(article))}" class="card-link">Подробнее об услуге</a>
      </div>
    </article>
  </div>`
    )
    .join("\n")}
</div>`;
}

function serviceArticlesBlock(service) {
  const items = relatedArticles(service, 6);
  if (!items.length) {
    return "";
  }

  return `
<section class="section soft-section">
  <div class="container">
${sectionHeader(`Статьи по теме «${service.short}»`, "Подобрали материалы о диагностике, типовых симптомах, стоимости и срочном ремонте этой техники в Туле.")}
${articleCards(items)}
  </div>
</section>`;
}

function mapRatingsBlock() {
  return `
<section class="section soft-section">
  <div class="container">
    ${sectionHeader("Рейтинги на картах и в справочниках", "Показываем публичные карточки Remtehcom в геосервисах и каталогах, где пользователи оставляют оценки и отзывы о сервисном центре в Туле.")}
    <div class="columns is-multiline">
      ${mapRatings
        .map(
          (item) => `
      <div class="column is-6-desktop">
        <article class="rating-card match-height">
          <div class="rating-card-head">
            <h3>${escapeHtml(item.service)}</h3>
            <span class="rating-badge">${escapeHtml(item.rating)}</span>
          </div>
          <p class="rating-count">${escapeHtml(item.count)}</p>
          <p>${escapeHtml(item.text)}</p>
          <a href="${attr(item.url)}" class="card-link" target="_blank" rel="noopener">Открыть карточку</a>
        </article>
      </div>`
        )
        .join("\n")}
    </div>
    <p class="source-note">Данные собраны по открытым карточкам компании и поисковой выдаче 22.04.2026. В блок включены только сервисы, где по открытым данным видна публичная оценка Remtehcom.</p>
  </div>
</section>`;
}

function renderArticles() {
  const body = `
${hero({
  h1: "Статьи о ремонте бытовой техники в Туле",
  lead: "Полезный раздел Remtehcom: 102 SEO-статьи о ремонте холодильников, стиральных машин, посудомоек, телевизоров, кондиционеров и другой техники.",
  kicker: "Полезные статьи",
  compact: true,
  imageAlt: "Статьи о ремонте бытовой техники в Туле"
})}
<section class="section">
  <div class="container">
${sectionHeader("Все статьи", "Материалы помогают понять симптомы неисправностей, ориентиры стоимости, диагностику и порядок вызова мастера в Туле.")}
${articleCards()}
  </div>
</section>
${contactCta("Нужна консультация по ремонту техники?")}`;

  return layout({
    file: "article.html",
    activeFile: "article.html",
    title: "Статьи о ремонте бытовой техники в Туле | Remtehcom",
    description: "102 полезные статьи Remtehcom о ремонте бытовой техники в Туле: холодильники, стиральные машины, телевизоры, кондиционеры, цены и диагностика.",
    keywords: ["статьи ремонт бытовой техники Тула", "ремонт техники советы", "ремонт холодильников статьи", "ремонт стиральных машин статьи", "мастер по ремонту техники Тула"],
    breadcrumbs: [
      { name: "Главная", file: "index.html" },
      { name: "Статьи", file: "article.html" }
    ],
    body
  });
}

function renderArticle(article) {
  const related = relatedServices(article.service).slice(0, 4);
  const nearby = articles
    .filter((item) => item.slug !== article.slug && item.service.slug === article.service.slug)
    .slice(0, 4);
  const body = `
${hero({
  h1: article.h1,
  lead: article.lead,
  kicker: "Советы мастера Remtehcom",
  compact: true,
  image: article.image,
  imageAlt: article.h1
})}
<section class="section">
  <div class="container">
    <div class="columns is-multiline">
      <article class="column is-8-desktop content commercial-content article-content">
        ${article.sections.map(([title, text]) => `<h2>${escapeHtml(title)}</h2>\n<p>${escapeHtml(text)}</p>`).join("\n")}
        <h2>Куда перейти дальше</h2>
        <p>Если проблема похожа на вашу, откройте страницу услуги «<a href="${pageHref(serviceFile(article.service))}">${escapeHtml(article.service.name)}</a>» или оставьте заявку на диагностику в Туле. Также полезно посмотреть ориентировочные цены и FAQ по ремонту.</p>
      </article>
      <aside class="column is-4-desktop">
        <div class="side-panel">
          <h2 class="h4">Услуга по теме</h2>
          <p>${escapeHtml(article.service.lead)}</p>
          <a href="${pageHref(serviceFile(article.service))}" class="btn btn-primary">${escapeHtml(article.service.name)}</a>
        </div>
        <div class="side-panel">
          <h2 class="h4">Еще по этой теме</h2>
          <ul class="side-links">
            ${nearby.map((item) => `<li><a href="${pageHref(articleFile(item))}">${escapeHtml(item.h1)}</a></li>`).join("\n")}
          </ul>
        </div>
        <div class="side-panel">
          <h2 class="h4">Смежные услуги</h2>
          <ul class="side-links">
            ${related.map((service) => `<li><a href="${pageHref(serviceFile(service))}">${escapeHtml(service.name)}</a></li>`).join("\n")}
          </ul>
        </div>
      </aside>
    </div>
  </div>
</section>
${contactCta(`Заказать ${article.service.name.toLowerCase()} в Туле`)}`;

  return layout({
    file: articleFile(article),
    activeFile: "article.html",
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    image: article.image,
    breadcrumbs: [
      { name: "Главная", file: "index.html" },
      { name: "Статьи", file: "article.html" },
      { name: article.h1, file: articleFile(article) }
    ],
    schemas: [articleSchema(article)],
    body
  });
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
          <a href="${pageHref("contact.html#request")}" class="btn btn-outline-primary">Заявка онлайн</a>
        </div>
        <div class="side-panel">
          <h2 class="h4">Другие услуги</h2>
          <ul class="side-links">
            ${related.map((item) => `<li><a href="${pageHref(serviceFile(item))}">${escapeHtml(item.name)}</a></li>`).join("\n")}
          </ul>
        </div>
      </aside>
    </div>
  </div>
</section>
${benefitsBlock(`Преимущества услуги «${service.short}»`)}
${processBlock()}
${serviceArticlesBlock(service)}
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
          <h2 class="h4"><a href="${pageHref(serviceFile(service))}">${escapeHtml(service.name)}</a></h2>
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
${mapRatingsBlock()}
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
      <a href="${pageHref("services.html")}" class="btn btn-primary">Все услуги</a>
      <a href="${pageHref("contact.html#request")}" class="btn btn-outline-primary">Связаться</a>
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
    "article.html",
    "prices.html",
    "reviews.html",
    "faq.html",
    "contact.html",
    "privacy.html",
    ...services.map(serviceFile),
    ...articles.map(articleFile)
  ];

  const origin = siteOrigin();
  const loc = (file) => `${origin}${publicPath(routePath(file))}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((file) => `  <url><loc>${loc(file)}</loc></url>`)
  .join("\n")}
</urlset>
`;
}

function robots() {
  return `User-agent: *
Allow: /
${siteOrigin() || siteBasePath() ? `\nSitemap: ${siteOrigin()}${publicPath("/sitemap.xml")}` : ""}
`;
}

function htaccess() {
  return `Options -Indexes
RewriteEngine On

RewriteCond %{THE_REQUEST} \\s/+(.+?)\\.html[\\s?] [NC]
RewriteRule ^ /%1/ [R=301,L,NE]

ErrorDocument 404 /404.html
`;
}

function write(file, content) {
  writeRaw(outputPath(file), content);
}

function writeRaw(file, content) {
  const fullPath = path.join(outDir, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
}

function legacyRedirect(file) {
  const target = canonicalUrl(file);
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${attr(target)}">
  <link rel="canonical" href="${attr(target)}">
  <meta name="robots" content="noindex, follow">
  <script>location.replace(${JSON.stringify(target)});</script>
  <title>Переадресация | Remtehcom</title>
</head>
<body>
  <p>Переадресация на <a href="${attr(target)}">${escapeHtml(target)}</a>.</p>
</body>
</html>
`;
}

function build() {
  write("index.html", renderHome());
  write("about.html", renderAbout());
  write("services.html", renderServices());
  write("article.html", renderArticles());
  write("prices.html", renderPrices());
  write("reviews.html", renderReviews());
  write("faq.html", renderFaqPage());
  write("contact.html", renderContactPage());
  write("privacy.html", renderPrivacy());
  write("404.html", renderNotFound());

  services.forEach((service) => {
    write(serviceFile(service), renderService(service));
  });

  articles.forEach((article) => {
    write(articleFile(article), renderArticle(article));
  });

  const legacyFiles = [
    "about.html",
    "services.html",
    "article.html",
    "prices.html",
    "reviews.html",
    "faq.html",
    "contact.html",
    "privacy.html",
    ...services.map(serviceFile),
    ...articles.map(articleFile)
  ];
  legacyFiles.forEach((file) => {
    writeRaw(file, legacyRedirect(file));
  });

  writeRaw("sitemap.xml", sitemap());
  writeRaw("robots.txt", robots());
  writeRaw(".htaccess", htaccess());
}

build();
console.log(`Generated ${services.length + articles.length + 10} pages for ${company.name}`);
