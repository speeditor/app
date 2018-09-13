<?php
/*
 * Testing autologin-mock on Safari:
 * go to https://muppet.mech.wikia-dev.pl/wiki/Kermit_the_Frog
 * iframe will use http://poznan.mech.(wikia-dav|fandom-dev) domain to set the cookie on fandom-dev.pl
 * visit https://muppet.mech.fandom-dev.pl/wiki/Kermit_the_Frog to check if the cookie was set
 */
use Wikia\RobotsTxt\PathBuilder;
use Wikia\RobotsTxt\RobotsRedirect;
use Wikia\RobotsTxt\RobotsTxt;
use Wikia\RobotsTxt\WikiaRobots;

// This will prevent WFL from redirecting
$wgSkipWFLRedirect = true;

require_once( __DIR__ . '/includes/WebStart.php' );

$output = RequestContext::getMain()->getOutput();

Hooks::run( 'WikiaRobotsBeforeOutput', [ $wgRequest, $wgUser, $output ] );

$robotsRedirect = new RobotsRedirect();

if ( $output->isRedirect() ) {
	$wgHooks['BeforePageRedirect'][] = [ $robotsRedirect, 'onBeforePageRedirect' ];
	$output->output();
}

if ( !$output->isRedirect() || $robotsRedirect->redirectCancelled ) {
    echo '';
	if ( !empty( $_GET['step'] ) ) {
		if ( $_GET['step'] == 'frame' ) {
			header( 'content-security-policy: sandbox allow-same-origin allow-scripts; frame-ancestors http://*.wikia-dev.pl https://*.wikia-dev.pl http://*.fandom-dev.pl https://*.fandom-dev.pl;');
			header('content-type: application/xhtml+xml');
			echo '<?xml version="1.0" encoding="UTF-8"?>';
?>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<script><![CDATA[
		console.log('Starting iframe JS');
		var xmlHttpRequest = new XMLHttpRequest();
        var cookieValue = new Date().getTime();
		xmlHttpRequest.open('POST', 'https://poznan.mech.wikia-dev.pl/robots.txt?step=session_wikia&cookieValue='+cookieValue);
		xmlHttpRequest.setRequestHeader('X-Wikia-AutoLogin', '1');

		xmlHttpRequest.withCredentials = true;
		console.log('Sending POST request');

		if (window.parent !== window) {
			xmlHttpRequest.onreadystatechange = function () {
				if (xmlHttpRequest.readyState === XMLHttpRequest.DONE) {
					console.log('Iframe request done, status is '+xmlHttpRequest.status);
					// In iframes, the Referer header will always be the URL
					if (xmlHttpRequest.status === 200) {
						window.parent.postMessage('is_authed', document.referrer);

						// set cookie to stop rendering this iframe
						var d = new Date();
						d.setTime(d.getTime() + (31536000*1000));
						var expires = "expires="+ d.toUTCString();
                        window.document.cookie =  "sync_done=1;" + expires + ";path=/; domain=.wikia-dev.pl;";
					} else {
						window.parent.postMessage('is_anon', document.referrer);
					}
				}
			};
		}

		xmlHttpRequest.send();
		]]>
	</script>
</head>
</html>
<?php
		} elseif ( $_REQUEST['step'] == 'session_wikia' ) {
			header( 'HTTP/1.1 308 See Other' );
			header('access-control-allow-credentials: true');
			header('access-control-allow-origin: https://poznan.mech.wikia-dev.pl');
			header('cache-control: private, no-store, no-transform');
			header('content-security-policy: sandbox allow-same-origin allow-scripts; frame-ancestors http://*.wikia-dev.pl https://*.wikia-dev.pl http://*.fandom-dev.pl https://*.fandom-dev.pl;');
			header('location: https://poznan.mech.fandom-dev.pl/robots.txt?step=session_fandom&cookieValue=' . $_REQUEST['cookieValue'] );
		} elseif  ( $_GET['step'] == 'session_fandom' ) {
			header('access-control-allow-credentials: true');
			header('access-control-allow-origin: https://poznan.mech.wikia-dev.pl');
			if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
			    header('access-control-allow-methods: POST,GET,OPTIONS,PUT,DELETE,PATCH');
			    header('access-control-max-age: 1800');
			    header('access-control-allow-headers: Origin,Content-Type,Accept,X-Wikia-AccessToken,X-Proof-Of-Work,Cache-Control,Referer,User-Agent,X-Wikia-AutoLogin');
			}
		    if ($_SERVER['REQUEST_METHOD'] == 'GET') {
				header('content-security-policy: sandbox allow-same-origin allow-scripts; frame-ancestors http://*.wikia-dev.pl https://*.wikia-dev.pl http://*.fandom-dev.pl https://*.fandom-dev.pl;');
				header('set-cookie: sync_done=1;Version=1;Comment=;Domain=.fandom-dev.pl;Path=/;Max-Age=31536000', false);
				header('set-cookie: cookieValue='. $_GET['cookieValue'].';Version=1;Comment=;Domain=.fandom-dev.pl;Path=/;Max-Age=31536000;Secure;HttpOnly', false);
            }
		} else {
			header( 'HTTP/1.1 400 Bad Request' );
			echo 'Unknown step';
		}
	} else {
		$wikiaRobots = new WikiaRobots( new PathBuilder() );
		$robots = $wikiaRobots->configureRobotsBuilder( new RobotsTxt() );

		header( 'Content-Type: text/plain' );
		header( 'Cache-Control: s-maxage=' . $wikiaRobots->getRobotsTxtCachePeriod() );
		header( 'X-Pass-Cache-Control: public, max-age=' . $wikiaRobots->getRobotsTxtCachePeriod() );

		echo join( PHP_EOL, $robots->getContents() ) . PHP_EOL;
	}
}

