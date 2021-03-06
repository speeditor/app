<?php
$wgExtensionCredits[ 'other' ][ ] = [
	'name' => 'WallNotifications',
	'author' => 'Wikia',
	'descriptionmsg' => 'wallnotifications-desc',
	'url' => 'https://github.com/Wikia/app/tree/dev/extensions/wikia/WallNotifications',
];

// i18n
$wgExtensionMessagesFiles['WallNotifications'] = __DIR__ . '/i18n/WallNotifications.i18n.php';

$wgAutoloadClasses['WallNotifications'] =  __DIR__ . '/WallNotifications.class.php';

$wgAutoloadClasses['WallNotificationsAdmin'] =  __DIR__ . '/WallNotificationsAdmin.class.php';
$wgAutoloadClasses['WallNotificationAdminEntity'] =  __DIR__ . '/WallNotificationAdminEntity.class.php';

$wgAutoloadClasses['WallNotificationsOwner'] =  __DIR__ . '/WallNotificationsOwner.class.php';
$wgAutoloadClasses['WallNotificationOwnerEntity'] =  __DIR__ . '/WallNotificationOwnerEntity.class.php';

$wgAutoloadClasses['WallNotificationEntity'] =  __DIR__ . '/WallNotificationEntity.class.php';
$wgAutoloadClasses['WallNotificationsExternalController'] =  __DIR__ . '/WallNotificationsExternalController.class.php';

// Notifications are required on NonWall Wikis in order to show proper
// lower-left corner notification bubbles from Wall Wikis
$wgAutoloadClasses['WallHelper'] =  __DIR__ . '/../Wall/WallHelper.class.php';
$wgAutoloadClasses['WallMessage'] =  __DIR__ . '/../Wall/WallMessage.class.php';
$wgAutoloadClasses['CommentsIndex'] = __DIR__ . '/../Wall/index/CommentsIndex.class.php';
$wgAutoloadClasses['CommentsIndexEntry'] = __DIR__ . '/../Wall/index/CommentsIndexEntry.class.php';

