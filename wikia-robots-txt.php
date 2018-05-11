<?php

use Wikia\RobotsTxt\PathBuilder;
use Wikia\RobotsTxt\RobotsTxt;
use Wikia\RobotsTxt\WikiaRobots;

require_once( __DIR__ . '/includes/WebStart.php' );

$wikiaRobots = new WikiaRobots( new PathBuilder() );
$robots = $wikiaRobots->configureRobotsBuilder( new RobotsTxt() );

header( 'Content-Type: text/plain' );
header( 'Cache-Control: s-maxage=' . $wikiaRobots->getRobotsTxtCachePeriod() );
header( 'X-Pass-Cache-Control: public, max-age=' . $wikiaRobots->getRobotsTxtCachePeriod() );

global $wgServer;
$url = $wgServer . '/wikia.php?controller=MercuryApi&method=getWikiVariables';
echo $url."\n";
$resp = \Http::get( $url, 10, [] );
echo "Resonse is ".json_encode($resp)."\n\n";

echo join( PHP_EOL, $robots->getContents() ) . PHP_EOL;
