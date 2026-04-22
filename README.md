# Remtehcom SEO Site

Статический сайт сервисного центра Remtehcom для продвижения услуг ремонта бытовой техники в Туле и Тульской области.

## Структура

- `site-data.js` - основной редактируемый контент: контакты, услуги, цены, FAQ, отзывы, `title`, `description`, `keywords`, изображения.
- `build-site.js` - генератор HTML-страниц, Schema.org, Open Graph, sitemap, robots и `.htaccess`.
- `index.html`, `services.html`, `prices.html`, `contact.html` и страницы услуг - сгенерированные страницы в корне проекта.
- `articles.html` и страницы статей `*.html` - SEO-раздел со 100 статьями для продвижения услуг в Туле.
- `images/banner.jpg` - общий hero-баннер для главной и служебных страниц.
- `images/services/*.jpg` - уникальные изображения для SEO-страниц услуг.
- `css/style.css` - стили сайта поверх готовой Bulma/Themefisher-верстки.

## Генерация сайта

```bash
node build-site.js
```

Команда пересобирает все HTML-страницы, `sitemap.xml`, `robots.txt` и `.htaccess` в корне проекта.

## SEO

Для каждой услуги в `site-data.js` задаются:

- `title` - мета-заголовок страницы.
- `description` - мета-описание страницы.
- `keywords` - ключевые запросы для `meta keywords`.
- `h1` - единственный H1 на странице.
- `lead`, `intro`, `faults`, `priceRows`, `faq` - SEO-контент услуги.
- `image` - уникальная картинка услуги для hero-блока, Open Graph и Schema.org.

Генератор добавляет:

- canonical URL;
- Open Graph;
- LocalBusiness schema;
- Service schema на страницах услуг;
- BreadcrumbList schema;
- FAQPage schema;
- `meta description` и `meta keywords`;
- alt-тексты изображений.

## Статьи

Раздел статей генерируется в `build-site.js` из списка услуг и тематических SEO-шаблонов:

- 12 направлений услуг умножаются на 8 поисковых тем;
- добавляются 4 общие статьи по ремонту техники, диагностике, срочному ремонту и выбору мастера;
- итог: `articles.html` и 100 детальных страниц статей;
- каждая статья получает `title`, `description`, `keywords`, `h1`, Open Graph, Article schema и перелинковку на услугу.

## Изображения

Все рабочие изображения сайта лежат внутри `images/`.

Уникальные изображения услуг:

- `images/services/remont-holodilnikov-tula.jpg`
- `images/services/remont-stiralnyh-mashin-tula.jpg`
- `images/services/remont-posudomoechnyh-mashin-tula.jpg`
- `images/services/remont-televizorov-tula.jpg`
- `images/services/remont-mikrovolnovok-tula.jpg`
- `images/services/remont-kondicionerov-tula.jpg`
- `images/services/remont-elektroplit-tula.jpg`
- `images/services/remont-duhovyh-shkafov-tula.jpg`
- `images/services/remont-varochnyh-paneley-tula.jpg`
- `images/services/remont-kofemashin-tula.jpg`
- `images/services/remont-pylesosov-tula.jpg`
- `images/services/remont-melkoy-bytovoy-tehniki-tula.jpg`

## Публикация

Сайт хранится в корне репозитория и готов к публикации через GitHub Pages или обычный статический хостинг. После правок нужно пересобрать сайт, проверить изменения, сделать коммит и отправить ветку `main` на GitHub.
