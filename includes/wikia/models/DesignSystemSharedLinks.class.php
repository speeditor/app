<?php

class DesignSystemSharedLinks {

	/** @var DesignSystemSharedLinks */
	private static $instance;

	private function __construct() {
	}

	public static function getInstance() {
		if ( !isset( static::$instance ) ) {
			static::$instance = new DesignSystemSharedLinks();
		}
		return static::$instance;
	}

	public function setHrefs( $hrefs ) {
		$this->hrefs = $hrefs;
		return $this;
	}

	/**
	 * @param $name string key for href
	 * @param $lang string two letter language code
	 * @return string full URL, in case of lang specific URL missing, default one is returned
	 */
	public function getHref( $name, $lang ) {
		$lang = $this->getLangWithFallback( $lang );

		$href = $this->hrefs[$lang][$name] ?? $this->hrefs['default'][$name];

		return WikiFactory::getLocalEnvURL( $href );
	}

	/**
	 * @param $name string key for href
	 * @param $lang string two letter language code
	 * @param $cityId int
	 * @return string full URL, in case of lang specific URL missing, default one is returned
	 */
	public function getLocalHref( $name, $lang, $cityId) {
		$lang = $this->getLangWithFallback( $lang );

		$href = $this->hrefs[$lang][$name] ?? $this->hrefs['default'][$name];

		return WikiFactory::cityIdToLanguagePath( $cityId ) . $href;
	}

	/**
	 * @param $lang string two letter language code
	 * @return array list of social urls for given language. In case of no url is defined for given language, english urls are returned.
	 */
	public function getSocialHrefs( $lang ) {
		$lang = $this->getLangWithFallback( $lang );

		return $this->socialHrefs[ $lang ] ?? $this->socialHrefs[ 'en' ];
	}

	private function getLangWithFallback( $lang ) {
		if ( isset( $this->hrefs[ $lang ] ) ) {
			return $lang;
		}

		$fallbacks = Language::getFallbacksFor( $lang );
		foreach ( $fallbacks as $fallbackCode ) {
			// All languages fallback to en, but we use that for English-specific
			// URLs, so we want to fallback only to default, rather than en
			if ( $fallbackCode !== 'en' && isset( $this->hrefs[ $fallbackCode ] ) ) {
				return $fallbackCode;
			}
		}

		return 'default';
	}

	private $hrefs = [
		'default' => [
			'explore-wikis' => '//www.wikia.com',
			'about' => '//www.fandom.com/about',
			'careers' => 'https://careers.wikia.com',
			'press' => '//www.fandom.com/press',
			'contact' => '//www.fandom.com/about#contact',
			'terms-of-use' => '//www.wikia.com/Terms_of_use',
			'privacy-policy' => '//www.wikia.com/Privacy_Policy',
			'global-sitemap' => '//www.wikia.com/Sitemap',
			'local-sitemap' => '/wiki/Local_Sitemap',
			'local-sitemap-fandom' => '//www.fandom.com/local-sitemap',
			'community-central' => '//community.wikia.com/wiki/Community_Central',
			'support' => '//community.wikia.com/wiki/Special:Contact',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki',
			'fan-contributor' => null,
			'wam' => '//community.wikia.com/wiki/WAM',
			'help' => '//community.wikia.com/wiki/Help:Contents',
			'media-kit' => '//www.fandom.com/mediakit',
			'media-kit-contact' => null,
			'app-store' => 'https://itunes.apple.com/us/app/fandom-videos-news-reviews/id1230063803?ls=1&mt=8',
			'google-play' => 'https://play.google.com/store/apps/details?id=com.fandom.app',
			'fandom-logo' => '//www.fandom.com/',
			'games' => '//www.fandom.com/topics/games',
			'movies' => '//www.fandom.com/topics/movies',
			'tv' => '//www.fandom.com/topics/tv',
			'video' => '//www.fandom.com/video',
			'user-signin' => 'https://www.wikia.com/signin',
			'user-logout' => 'https://www.wikia.com/logout',
			'user-register' => 'https://www.wikia.com/register',
			'user-author-profile' => '//www.fandom.com/u/',
		],
		'de' => [
			'explore-wikis' => '//www.wikia.com/explore-de?uselang=de',
			'fandom-logo' => '//www.wikia.com/explore-de?uselang=de',
			'about' => '//www.fandom.com/about?uselang=de',
			'press' => '//www.fandom.com/press?uselang=de',
			'contact' => '//www.fandom.com/about?uselang=de',
			'terms-of-use' => 'http://de.wikia.com/Nutzungsbedingungen',
			'privacy-policy' => 'http://de.wikia.com/Datenschutz',
			'community-central' => 'http://de.community.wikia.com/wiki/Community_Deutschland',
			'support' => 'http://de.community.wikia.com/wiki/Spezial:Kontakt',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=de',
			'wam' => '//community.wikia.com/wiki/WAM?langCode=de',
			'help' => 'http://de.community.wikia.com/wiki/Hilfe:%C3%9Cbersicht',
			'media-kit' => '//www.fandom.com/mediakit?uselang=de',
			'app-store' => 'https://itunes.apple.com/de/developer/wikia-inc./id422467077',
			'google-play' => 'https://play.google.com/store/apps/developer?id=FANDOM+powered+by+Wikia&hl=de',
			'user-signin' => 'https://www.wikia.com/signin?uselang=de',
			'user-register' => 'https://www.wikia.com/register?uselang=de',
			'games' => '//www.wikia.com/explore-de?uselang=de#Videospiele',
			'movies' => '//www.wikia.com/explore-de?uselang=de#Filme',
			'tv' => '//www.wikia.com/explore-de?uselang=de#TV',
		],
		'en' => [
			'fan-contributor' => '//www.fandom.com/fan-contributor',
			'media-kit-contact' => '//www.fandom.com/mediakit#contact',
		],
		'es' => [
			'explore-wikis' => '//www.wikia.com/explore-es?uselang=es',
			'fandom-logo' => '//www.wikia.com/explore-es?uselang=es',
			'about' => '//www.fandom.com/about?uselang=es',
			'press' => '//www.fandom.com/press?uselang=es',
			'contact' => '//www.fandom.com/about?uselang=es',
			'terms-of-use' => 'http://es.wikia.com/T%C3%A9rminos_de_uso',
			'privacy-policy' => 'http://es.wikia.com/Pol%C3%ADtica_de_privacidad',
			'community-central' => 'http://comunidad.wikia.com/wiki/Wikia',
			'support' => 'http://comunidad.wikia.com/wiki/Especial:Contactar',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=es',
			'wam' => '//community.com/wiki/WAM?langCode=es',
			'help' => 'http://comunidad.wikia.com/wiki/Ayuda:Contenidos',
			'media-kit' => '//www.fandom.com/mediakit?uselang=es',
			'app-store' => 'https://itunes.apple.com/es/developer/wikia-inc./id422467077',
			'google-play' => 'https://play.google.com/store/apps/developer?id=FANDOM+powered+by+Wikia&hl=es',
			'user-signin' => 'https://www.wikia.com/signin?uselang=es',
			'user-register' => 'https://www.wikia.com/register?uselang=es',
			'games' => '//www.wikia.com/explore-es?uselang=es#Juegos',
			'movies' => '//www.wikia.com/explore-es?uselang=es#Películas',
			'tv' => '//www.wikia.com/explore-es?uselang=es#TV',
		],
		'fr' => [
			'explore-wikis' => '//www.wikia.com/explore-fr?uselang=fe',
			'fandom-logo' => '//www.wikia.com/explore-fr?uselang=fr',
			'about' => '//www.fandom.com/about?uselang=fr',
			'press' => '//www.fandom.com/press?uselang=fr',
			'contact' => '//www.fandom.com/about?uselang=fr',
			'terms-of-use' => 'http://fr.wikia.com/Conditions_d\'utilisation',
			'privacy-policy' => 'http://fr.wikia.com/Politique_de_confidentialit%C3%A9',
			'community-central' => 'http://communaute.wikia.com/wiki/Centre_des_communaut%C3%A9s',
			'support' => 'http://communaute.wikia.com/wiki/Sp%C3%A9cial:Contact',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=fr',
			'wam' => '//community.com/wiki/WAM?langCode=fr',
			'help' => 'http://communaute.wikia.com/wiki/Aide:Contenu',
			'app-store' => 'https://itunes.apple.com/fr/developer/wikia-inc./id422467077',
			'google-play' => 'https://play.google.com/store/apps/developer?id=FANDOM+powered+by+Wikia&hl=fr',
			'user-signin' => 'https://www.wikia.com/signin?uselang=fr',
			'user-register' => 'https://www.wikia.com/register?uselang=fr',
			'games' => '//www.wikia.com/explore-fr?uselang=fr#Jeux_vidéo',
			'movies' => '//www.wikia.com/explore-fr?uselang=fr#Cinéma',
			'tv' => '//www.wikia.com/explore-fr?uselang=fr#Télévision',
		],
		'it' => [
			'explore-wikis' => '//www.wikia.com/explore-it?uselang=it',
			'fandom-logo' => '//www.wikia.com/explore-it?uselang=it',
			'about' => '//www.fandom.com/about?uselang=it',
			'press' => '//www.fandom.com/press?uselang=it',
			'contact' => '//www.fandom.com/about?uselang=it',
			'terms-of-use' => 'http://it.community.wikia.com/wiki/Wiki_della_Community:Termini_di_utilizzo',
			'privacy-policy' => 'http://it.community.wikia.com/wiki/Wiki_della_Community:Privacy',
			'community-central' => 'http://it.community.wikia.com/wiki/Wiki_della_Community',
			'support' => 'http://it.community.wikia.com/wiki/Speciale:Contatta',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=it',
			'wam' => '//community.wikia.com/wiki/WAM?langCode=it',
			'help' => 'http://it.community.wikia.com/wiki/Aiuto:Contenuti',
			'app-store' => 'https://itunes.apple.com/it/developer/wikia-inc./id422467077',
			'google-play' => 'https://play.google.com/store/apps/developer?id=FANDOM+powered+by+Wikia&hl=it',
			'user-signin' => 'https://www.wikia.com/signin?uselang=it',
			'user-register' => 'https://www.wikia.com/register?uselang=it',
			'games' => '//www.wikia.com/explore-it?uselang=it#Giochi',
			'movies' => '//www.wikia.com/explore-it?uselang=it#Cinema',
			'tv' => '//www.wikia.com/explore-it?uselang=it#TV',
		],
		'ja' => [
			'explore-wikis' => '//www.wikia.com/explore-ja?uselang=ja',
			'fandom-logo' => '//www.wikia.com/explore-ja?uselang=ja',
			'about' => '//www.fandom.com/about?uselang=ja',
			'press' => '//www.fandom.com/press?uselang=ja',
			'contact' => '//www.fandom.com/about?uselang=ja',
			'terms-of-use' => 'http://ja.wikia.com/%E5%88%A9%E7%94%A8%E8%A6%8F%E7%B4%84',
			'privacy-policy' => 'http://ja.wikia.com/%E3%83%97%E3%83%A9%E3%82%A4%E3%83%90%E3%82%B7%E3%83%BC%E3%83%9D%E3%83%AA%E3%82%B7%E3%83%BC',
			'community-central' => 'http://ja.community.wikia.com/wiki/%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%9A%E3%83%BC%E3%82%B8',
			'support' => 'http://ja.community.wikia.com/wiki/%E7%89%B9%E5%88%A5:%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=ja',
			'wam' => '//community.wikia.com/wiki/WAM?langCode=ja',
			'help' => 'http://ja.community.wikia.com/wiki/%E3%83%98%E3%83%AB%E3%83%97:%E3%82%B3%E3%83%B3%E3%83%86%E3%83%B3%E3%83%84',
			'media-kit' => '//www.fandom.com/mediakit',
			'app-store' => 'https://itunes.apple.com/jp/developer/wikia-inc./id422467077',
			'google-play' => 'https://play.google.com/store/apps/developer?id=FANDOM+powered+by+Wikia&hl=ja',
			'user-signin' => 'https://www.wikia.com/signin?uselang=ja',
			'user-register' => 'https://www.wikia.com/register?uselang=ja',
			'games' => '//www.wikia.com/explore-ja?uselang=ja#ゲーム',
			'movies' => '//www.wikia.com/explore-ja?uselang=ja#映画',
			'tv' => '//www.wikia.com/explore-ja?uselang=ja#TV',
		],
		'pl' => [
			'explore-wikis' => '//www.wikia.com/explore-pl?uselang=pl',
			'fandom-logo' => '//www.wikia.com/explore-pl?uselang=pl',
			'about' => '//www.fandom.com/about?uselang=pl',
			'press' => '//www.fandom.com/press?uselang=pl',
			'contact' => '//www.fandom.com/about?uselang=pl',
			'terms-of-use' => 'http://pl.wikia.com/Zasady_U%C5%BCytkowania',
			'privacy-policy' => 'http://pl.wikia.com/Polityka_Prywatno%C5%9Bci',
			'community-central' => 'http://spolecznosc.wikia.com/wiki/Centrum_Spo%C5%82eczno%C5%9Bci',
			'support' => 'http://spolecznosc.wikia.com/wiki/Specjalna:Kontakt',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=pl',
			'wam' => '//community.wikia.com/wiki/WAM?langCode=pl',
			'help' => 'http://spolecznosc.wikia.com/wiki/Pomoc:Zawarto%C5%9B%C4%87',
			'app-store' => 'https://itunes.apple.com/pl/developer/wikia-inc./id422467077',
			'google-play' => 'https://play.google.com/store/apps/developer?id=FANDOM+powered+by+Wikia&hl=pl',
			'user-signin' => 'https://www.wikia.com/signin?uselang=pl',
			'user-register' => 'https://www.wikia.com/register?uselang=pl',
			'games' => '//www.wikia.com/explore-pl?uselang=pl#Gry',
			'movies' => '//www.wikia.com/explore-pl?uselang=pl#Filmy',
			'tv' => '//www.wikia.com/explore-pl?uselang=pl#TV',
		],
		'pt-br' => [
			'explore-wikis' => '//www.wikia.com/explore-pt-br?uselang=pt-br',
			'fandom-logo' => '//www.wikia.com/explore-pt-br?uselang=pt-br',
			'about' => '//www.fandom.com/about?uselang=pt-br',
			'press' => '//www.fandom.com/press?uselang=pt-br',
			'contact' => '//www.fandom.com/about?uselang=pt-br',
			'terms-of-use' => 'http://pt-br.wikia.com/wiki/Termos_de_Uso',
			'privacy-policy' => 'http://pt-br.wikia.com/wiki/Pol%C3%ADtica_de_Privacidade',
			'community-central' => 'http://comunidade.wikia.com/wiki/Central_da_Comunidade',
			'support' => 'http://comunidade.wikia.com/wiki/Especial:Contact',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=pt-br',
			'wam' => '//community.wikia.com/wiki/WAM?langCode=pt-br',
			'help' => 'http://comunidade.wikia.com/wiki/Ajuda:Conte%C3%BAdos',
			'app-store' => 'https://itunes.apple.com/br/developer/wikia-inc./id422467077',
			'google-play' => 'https://play.google.com/store/apps/developer?id=FANDOM+powered+by+Wikia&hl=pt-br',
			'user-signin' => 'https://www.wikia.com/signin?uselang=pt-br',
			'user-register' => 'https://www.wikia.com/register?uselang=pt-br',
			'games' => '//www.wikia.com/explore-pt-br?uselang=pt-br#Jogos',
			'movies' => '//www.wikia.com/explore-pt-br?uselang=pt-br#Filmes',
			'tv' => '//www.wikia.com/explore-pt-br?uselang=pt-br#TV',
		],
		'ru' => [
			'explore-wikis' => '//www.wikia.com/explore-ru?uselang=ru',
			'fandom-logo' => '//www.wikia.com/explore-ru?uselang=ru',
			'about' => '//www.fandom.com/about?uselang=ru',
			'press' => '//www.fandom.com/press?uselang=ru',
			'contact' => '//www.fandom.com/about?uselang=ru',
			'terms-of-use' => 'http://ru.wikia.com/wiki/%D0%A3%D1%81%D0%BB%D0%BE%D0%B2%D0%B8%D1%8F_%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F',
			'privacy-policy' => 'http://ru.wikia.com/wiki/%D0%9A%D0%BE%D0%BD%D1%84%D0%B8%D0%B4%D0%B5%D0%BD%D1%86%D0%B8%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D1%81%D1%82%D1%8C',
			'community-central' => 'http://ru.community.wikia.com/',
			'support' => 'http://ru.community.wikia.com/wiki/%D0%A1%D0%BB%D1%83%D0%B6%D0%B5%D0%B1%D0%BD%D0%B0%D1%8F:Contact',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=ru',
			'wam' => '//community.wikia.com/wiki/WAM?langCode=ru',
			'help' => 'http://ru.community.wikia.com/wiki/%D0%A1%D0%BF%D1%80%D0%B0%D0%B2%D0%BA%D0%B0:%D0%A1%D0%BE%D0%B4%D0%B5%D1%80%D0%B6%D0%B0%D0%BD%D0%B8%D0%B5',
			'app-store' => 'https://itunes.apple.com/ru/developer/wikia-inc./id422467077',
			'google-play' => 'https://play.google.com/store/apps/developer?id=FANDOM+powered+by+Wikia&hl=ru',
			'user-signin' => 'https://www.wikia.com/signin?uselang=ru',
			'user-register' => 'https://www.wikia.com/register?uselang=ru',
			'games' => '//www.wikia.com/explore-ru?uselang=ru#Видеоигры',
			'movies' => '//www.wikia.com/explore-ru?uselang=ru#Кино',
			'tv' => '//www.wikia.com/explore-ru?uselang=ru#ТВ',
		],
		'zh-hans' => [
			'explore-wikis' => '//www.wikia.com/explore-zh?uselang=zh',
			'fandom-logo' => '//www.wikia.com/explore-zh?uselang=zh',
			'about' => '//www.fandom.com/about?uselang=zh',
			'press' => '//www.fandom.com/press?uselang=zh',
			'contact' => '//www.fandom.com/about?uselang=zh',
			'terms-of-use' => 'http://zh.wikia.com/wiki/%E4%BD%BF%E7%94%A8%E6%9D%A1%E6%AC%BE',
			'privacy-policy' => 'http://zh.wikia.com/wiki/Privacy_Policy',
			'community-central' => 'http://zh.community.wikia.com/',
			'support' => 'http://zh.community.wikia.com/wiki/Special:Contact',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=zh',
			'wam' => '//community.wikia.com/wiki/WAM?langCode=zh',
			'help' => 'http://zh.community.wikia.com/wiki/Help:%E5%86%85%E5%AE%B9',
			'app-store' => 'https://itunes.apple.com/cn/developer/wikia-inc./id422467077',
			'google-play' => 'https://play.google.com/store/apps/developer?id=FANDOM+powered+by+Wikia&hl=zh',
			'user-signin' => 'https://www.wikia.com/signin?uselang=zh',
			'user-register' => 'https://www.wikia.com/register?uselang=zh',
			'games' => '//www.wikia.com/explore-zh?uselang=zh#游戏',
			'movies' => '//www.wikia.com/explore-zh?uselang=zh#电影',
			'tv' => '//www.wikia.com/explore-zh?uselang=zh#电视',
		],
		'zh-hant' => [
			'explore-wikis' => '//www.wikia.com/explore-zh-tw?uselang=zh-tw',
			'fandom-logo' => '//www.wikia.com/explore-zh-tw?uselang=zh-tw',
			'about' => '//www.fandom.com/about?uselang=zh-tw',
			'press' => '//www.fandom.com/press?uselang=zh-tw',
			'contact' => '//www.fandom.com/about?uselang=zh-tw',
			'terms-of-use' => 'http://zh-tw.wikia.com/wiki/%E4%BD%BF%E7%94%A8%E6%A2%9D%E6%AC%BE',
			'privacy-policy' => 'http://zh-tw.wikia.com/wiki/Privacy_Policy',
			'community-central' => 'http://zh.community.wikia.com/',
			'support' => 'http://zh.community.wikia.com/wiki/Special:Contact',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=zh-tw',
			'wam' => '//community.wikia.com/wiki/WAM?langCode=zh-tw',
			'help' => 'http://zh.community.wikia.com/wiki/Help:%E5%86%85%E5%AE%B9',
			'app-store' => 'https://itunes.apple.com/tw/developer/wikia-inc./id422467077',
			'google-play' => 'https://play.google.com/store/apps/developer?id=FANDOM+powered+by+Wikia&hl=zh-tw',
			'user-signin' => 'https://www.wikia.com/signin?uselang=zh-tw',
			'user-register' => 'https://www.wikia.com/register?uselang=zh-tw',
			'games' => '//www.wikia.com/explore-zh-tw?uselang=zh-tw#遊戲',
			'movies' => '//www.wikia.com/explore-zh-tw?uselang=zh-tw#電影',
			'tv' => '//www.wikia.com/explore-zh-tw?uselang=zh-tw#電視',
		],
		'vi' => [
			'community-central' => 'http://congdong.wikia.com/wiki/Trang_Ch%C3%ADnh',
			'support' => 'http://congdong.wikia.com/wiki/%C4%90%E1%BA%B7c_bi%E1%BB%87t:Li%C3%AAn_h%E1%BB%87',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=vi',
			'help' => 'http://congdong.wikia.com/wiki/%C4%90%E1%BA%B7c_bi%E1%BB%87t:Li%C3%AAn_h%E1%BB%87',
		],
		'nl' => [
			'community-central' => 'http://nl.community.wikia.com/wiki/Centrale_Wikia_community',
			'support' => 'http://nl.community.wikia.com/wiki/Speciaal:Contact',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=nl',
			'help' => 'http://nl.community.wikia.com/wiki/Speciaal:Contact',
		],
		'fi' => [
			'community-central' => 'http://yhteiso.wikia.com/wiki/Yhteis%C3%B6wiki',
			'support' => 'http://yhteiso.wikia.com/wiki/Toiminnot:Contact',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=fi',
			'help' => 'http://yhteiso.wikia.com/wiki/Toiminnot:Contact',
		],
		'ko' => [
			'community-central' => 'http://ko.community.wikia.com/wiki/%EB%8C%80%EB%AC%B8',
			'support' => 'http://ko.community.wikia.com/wiki/%ED%8A%B9%EC%88%98%EA%B8%B0%EB%8A%A5:%EB%AC%B8%EC%9D%98',
			'create-new-wiki' => '//community.wikia.com/wiki/Special:CreateNewWiki?uselang=ko',
			'help' => 'http://ko.community.wikia.com/wiki/%ED%8A%B9%EC%88%98%EA%B8%B0%EB%8A%A5:%EB%AC%B8%EC%9D%98',
		],
	];

	private $socialHrefs = [
		'en' => [
			'facebook' => 'https://www.facebook.com/getfandom',
			'twitter' => 'https://twitter.com/getfandom',
			'youtube' => 'https://www.youtube.com/channel/UC988qTQImTjO7lUdPfYabgQ',
			'instagram' => 'https://www.instagram.com/getfandom/',
			'linkedin' => 'https://www.linkedin.com/company/157252',
		],
		'de' => [
			'facebook' => 'https://www.facebook.com/de.fandom',
			'twitter' => 'https://twitter.com/fandom_deutsch',
			'instagram' => 'https://www.instagram.com/de_fandom',
		],
		'es' => [
			'facebook' => 'https://www.facebook.com/Fandom.espanol/',
			'twitter' => 'https://twitter.com/es_fandom',
		],
		'fr' => [
			'facebook' => 'https://www.facebook.com/fandom.fr',
			'twitter' => 'https://twitter.com/fandom_fr',
		],
		'it' => [
			'facebook' => 'https://www.facebook.com/fandom.italy',
			'twitter' => 'https://twitter.com/fandom_italy',
		],
		'ja' => [
			'facebook' => 'https://www.facebook.com/FandomJP',
			'twitter' => 'https://twitter.com/FandomJP',
		],
		'pl' => [
			'facebook' => 'https://www.facebook.com/pl.fandom',
			'twitter' => 'https://twitter.com/pl_fandom',
		],
		'pt-br' => [
			'facebook' => 'https://www.facebook.com/getfandom.br',
			'twitter' => 'https://twitter.com/getfandom_br',
		],
		'ru' => [
			'facebook' => 'https://www.facebook.com/ru.fandom',
			'twitter' => 'https://twitter.com/ru_fandom',
			'vkontakte' => 'https://vk.com/ru_fandom',
		],
		'zh-hans' => [
			'facebook' => 'https://www.facebook.com/fandom.zh',
		],
		'zh-hant' => [
			'facebook' => 'https://www.facebook.com/fandom.zh',
		],
	];
}
