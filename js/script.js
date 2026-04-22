(function ($) {
	'use strict';

	// Preloader js    
	$(window).on('load', function () {
		$('.preloader').fadeOut(100);

		// masonry
		$('.masonry-wrapper').masonry({
			columnWidth: 1
		});
	});


	// navfixed
	$(window).scroll(function () {
		if ($('.navigation').offset().top > 50) {
			$('.navigation').addClass('nav-bg');
		} else {
			$('.navigation').removeClass('nav-bg');
		}
	});

	// clipboard
	var clipInit = false;
	$('code').each(function () {
		var code = $(this),
			text = code.text();
		if (text.length > 2) {
			if (!clipInit) {
				var text, clip = new ClipboardJS('.copy-to-clipboard', {
					text: function (trigger) {
						text = $(trigger).prev('code').text();
						return text.replace(/^\$\s/gm, '');
					}
				});
				clipInit = true;
			}
			code.after('<span class="copy-to-clipboard">copy</span>');
		}
	});
	$('.copy-to-clipboard').click(function () {
		$(this).html('copied');
	});


	// match height
	$(function () {
		$('.match-height').matchHeight({
			byRow: true,
			property: 'height',
			target: null,
			remove: false
		});
	});

	// search
	$('#search-by').keyup(function () {
		if (this.value) {
			$(this).addClass('active');
		} else {
			$(this).removeClass('active');
		}
	});

   // navbar
   $('.navbar-burger').click(function() {
      $('.navbar-burger').toggleClass('is-active');
      $('.navbar-menu').toggleClass('is-active');

      $(this).attr('data-hidden', $(this).attr('data-hidden') === 'true' ? 'false' : 'true');
	});
	
	
	// tab
	$('.tab-content').find('.tab-pane').each(function (idx, item) {
		var navTabs = $(this).closest('.code-tabs').find('.nav-tabs'),
			title = $(this).attr('title');
		navTabs.append('<li class="control"><a class="button" href="#">' + title + '</a></li>');
	});

	$('.code-tabs ul.nav-tabs').each(function () {
		$(this).find('li:first').addClass('active');
	});

	$('.code-tabs .tab-content').each(function () {
		$(this).find('div:first').addClass('active').show();
	});

	$('.nav-tabs a').click(function (e) {
		e.preventDefault();
		var tab = $(this).parent(),
			tabIndex = tab.index(),
			tabPanel = $(this).closest('.code-tabs'),
			tabPane = tabPanel.find('.tab-pane').eq(tabIndex);
		tabPanel.find('.active').removeClass('active');
		tab.addClass('active');
		tabPane.addClass('active');
	});
	
   // JSAccordion/Collapse
	$.fn.collapsible = function() {
		var ns = {
			open: function (me, bypass) { // Open the target
				var conf = me[0].__collapsible;
				if (!conf) { return; }
				if (bypass !== true) {
					if (typeof conf.group === 'string') {
							if (String(conf.allowMultiple).toLowerCase() !== 'true') {
								window['collapsibleAnimations_'+conf.group] = 0;
								window['collapsibleGroup_'+conf.group] 		= $('[data-group="'+conf.group+'"]').not(me);
								var group = window['collapsibleGroup_'+conf.group];
									group.each(function () { ns.close($(this)); });
								ns.open(me, true);
								return;
							}
					}
				}
				me.trigger('before:open');
				me.attr('aria-expanded', true);
				conf.target.attr('aria-expanded', true);
				conf.expanded = true;
				me.trigger('open');
				if (conf.init !== true) {
					setTimeout(function () {
					conf.init = true;
					me.__collapsible = conf;
					}, conf.speed + 100);
				}
			},
			close: function (me) { // Close the target
				var conf = me[0].__collapsible;
				if (!conf) { return; }
				me.trigger('before:close');
				me.attr('aria-expanded', false);
				conf.target.attr('aria-expanded', false);
				conf.expanded = false;
				me.trigger('close');
				if (conf.init !== true) {
					setTimeout(function () {
					conf.init = true;
					me.__collapsible = conf;
					}, conf.speed + 100);
				}
			},
			toggle: function (me) { // Toggle the target open/close
				var conf = me[0].__collapsible;
				if (!conf) { return; }
				me.trigger('before:toggle');
				var active = String(me.attr('aria-expanded')).toLowerCase();
					active = (active === 'true') ? true : false;
				if (active === true) {
					ns.close(me);
				} else {
					ns.open(me);
				}
				me.trigger('toggle');
			},
			onClick: function (e) { // On click handler
				if (!e.target.__collapsible) { return; }
				if ($(e.target).is('a')) {
					e.preventDefault();
				}
				ns.toggle($(e.target));
			},
			onClose: function (e) { // On close handler
				if (!e.target.__collapsible) { return; }
				var me = e.target;
				var targ = me.__collapsible.target;
				targ.stop().slideUp(me.__collapsible.speed, function () {
					$(me).trigger('after:close');
					$(me).trigger('animation:complete', ['close']);
					window['collapsibleAnimations_'+me.__collapsible.group] += 1;
					var count = window['collapsibleAnimations_'+me.__collapsible.group];
					var group = window['collapsibleGroup_'+me.__collapsible.group];
					if (!group) { return; }
					if (count >= group.length) {
							$('[data-group="'+me.__collapsible.group+'"]:focus').trigger('animations:complete', ['close']);
					}
				});
			},
			onOpen: function (e) { // On open handler
				if (!e.target.__collapsible) { return; }
				var me = e.target;
				var targ = me.__collapsible.target;
				targ.stop().slideDown(me.__collapsible.speed, function () {
					$(me).trigger('after:open');
					$(me).trigger('animation:complete', ['open']);

					if (me.__collapsible.init === true) {
							if (String(me.__collapsible.allowMultiple).toLowerCase() === 'true') {
								$(me).trigger('animations:complete', ['open']);
							}
					}
				});
			}
		};

		if (typeof arguments[0] === 'string') { // Public Methods
				switch (String(arguments[0]).toLowerCase()) {
					case 'open':
					case 'show':
						this.each(function () { ns.open($(this)); });
						break;
					case 'close':
					case 'hide':
						this.each(function () { ns.close($(this)); });
						break;
					case 'toggle':
						this.each(function () { ns.toggle($(this)); });
						break;
				}
				return this;
		} else { // Initialization
				// Event listeners
				this.on('click', ns.onClick);
				this.on('open', ns.onOpen);
				this.on('close', ns.onClose);
				var defaultConfig = $.extend({
					allowMultiple: false,
					expanded: false,
					group: null,
					init: false,
					speed: 250,
					target: null,
					temp: {}
				}, arguments[0]);

				// Constructor
				this.each(function (i) {
					// Default config
					var config = $.extend({}, defaultConfig);
					// update the config with data attributes
					var data = $(this).data();
					for (var prop in defaultConfig) {
						if (data[prop]) { config[prop] = data[prop]; }
					}
					// If the element is an <a> tag -> use the href attribute
					if ($(this).is('a')) {
						config.target = $(this).attr('href') || config.target;
					}
					// Exit if no target specified
					if (!config.target || config.target === null) { return; }
					// Convert the target into a jQuery object
					config.target = $(config.target);
					// Set the expanded value
					config.expanded = $(this).attr('aria-expanded') || config.expanded;
					config.expanded = (typeof config.expanded === 'string') ? config.expanded.toLowerCase() : config.expanded;
					config.expanded = (config.expanded === 'true') ? true : config.expanded;
					// temp storage object
					config.temp = {animations: 0, group: null};
					// Initialize
					this.__collapsible = config;
					// Open/close any elements
					if (config.expanded === true) {
						ns.open($(this));
					} else {
						ns.close($(this));
					}
				});
				// Return the query
				return this;
		}
	};
	// Default initializer
	$('[data-toggle="collapse"]').collapsible();

	// Accordions
	$('[data-toggle="collapse"]').on('click', function() {
		if( $(this).attr('aria-expanded') === 'true' ) {
			$(this).children('.ti-plus').removeClass('ti-plus').addClass('ti-minus');
		} else {
			$(this).children('.ti-minus').removeClass('ti-minus').addClass('ti-plus');
		}
	});

})(jQuery);

(function () {
	'use strict';

	function textOrDash(value) {
		return String(value || '').trim() || 'не указано';
	}

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function buildTelegramMessage(formData) {
		var lines = [
			'<b>Новая заявка с сайта Remtehcom</b>',
			'',
			'<b>Имя:</b> ' + escapeHtml(textOrDash(formData.get('name'))),
			'<b>Телефон:</b> ' + escapeHtml(textOrDash(formData.get('phone'))),
			'<b>Техника:</b> ' + escapeHtml(textOrDash(formData.get('service'))),
			'<b>Описание:</b> ' + escapeHtml(textOrDash(formData.get('message'))),
			'<b>Страница:</b> ' + escapeHtml(window.location.href),
			'<b>Время:</b> ' + escapeHtml(new Date().toLocaleString('ru-RU'))
		];

		return lines.join('\n');
	}

	function setStatus(statusNode, message, kind) {
		if (!statusNode) {
			return;
		}

		statusNode.textContent = message;
		statusNode.className = 'form-status is-' + kind;
	}

	function setupTelegramForm(form) {
		var config = window.REMTEHCOM_TELEGRAM || {};
		var statusNode = form.querySelector('[data-form-status]');
		var submitButton = form.querySelector('button[type="submit"]');
		var submitLabel = submitButton ? (submitButton.getAttribute('data-submit-label') || submitButton.textContent) : '';

		form.addEventListener('submit', function (event) {
			event.preventDefault();

			if (!config.enabled || !config.botToken || !config.chatId) {
				setStatus(statusNode, 'Отправка пока не настроена. Добавьте токен бота и chat_id в js/telegram-form-config.js.', 'error');
				return;
			}

			var formData = new FormData(form);
			if (!String(formData.get('phone') || '').trim()) {
				setStatus(statusNode, 'Укажите телефон для связи.', 'error');
				return;
			}

			if (submitButton) {
				submitButton.disabled = true;
				submitButton.textContent = 'Отправляем...';
			}
			setStatus(statusNode, 'Отправляем заявку в Telegram...', 'pending');

			fetch('https://api.telegram.org/bot' + encodeURIComponent(config.botToken) + '/sendMessage', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					chat_id: config.chatId,
					text: buildTelegramMessage(formData),
					parse_mode: 'HTML',
					disable_web_page_preview: true
				})
			})
				.then(function (response) {
					if (!response.ok) {
						throw new Error('HTTP ' + response.status);
					}
					return response.json();
				})
				.then(function (payload) {
					if (!payload.ok) {
						throw new Error(payload.description || 'Telegram API error');
					}
					form.reset();
					setStatus(statusNode, 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
				})
				.catch(function () {
					setStatus(statusNode, 'Не удалось отправить заявку. Проверьте настройки Telegram или попробуйте ещё раз.', 'error');
				})
				.finally(function () {
					if (submitButton) {
						submitButton.disabled = false;
						submitButton.textContent = submitLabel;
					}
				});
		});
	}

	Array.prototype.forEach.call(document.querySelectorAll('[data-telegram-form]'), setupTelegramForm);
})();
