<?php

class ArticleVideoContext {

	const ARTICLE_VIDEO_ERROR_MESSAGE = 'JWPlayer: Could not find mediaId in article-video service';
	const JWPLAYER_API_ERROR_MESSAGE = 'JWPlayer: Could not find enough playback info in JW API to play the video';

	/**
	 * Checks if featured video is embedded on given article
	 *
	 * @param $pageId
	 *
	 * @return bool
	 *
	 */
	public static function isFeaturedVideoEmbedded( string $pageId ) {
		$wg = F::app()->wg;

		if ( !$wg->enableArticleFeaturedVideo || WikiaPageType::isActionPage()) {
			return false;
		}

		$mediaId = ArticleVideoService::getFeatureVideoForArticle( $wg->cityId, $pageId );

		return !empty( $mediaId );
	}

	/**
	 * Gets video id and labels for featured video
	 *
	 * @param $pageId
	 *
	 * @return array
	 *
	 */
	public static function getFeaturedVideoData( string $pageId ) {
		$wg = F::app()->wg;

		if ( self::isFeaturedVideoEmbedded( $pageId ) ) {
			$videoData = [];
			$videoData['mediaId'] = ArticleVideoService::getFeatureVideoForArticle( $wg->cityId, $pageId );
			$logger = Wikia\Logger\WikiaLogger::instance();

			if ( empty( $videoData['mediaId'] ) ) {
				$logger->error( self::ARTICLE_VIDEO_ERROR_MESSAGE );
			}

			$jwPlayerRequest = Http::get(
				'https://cdn.jwplayer.com/v2/media/' . $videoData['mediaId'],
				2,
				[ 'returnInstance' => true ]
			);

			$isOK = $jwPlayerRequest->status->isOK();
			$memCacheKey = wfMemcKey( 'featured-video', $wg->cityId, $pageId );

			$content = $jwPlayerRequest->getContent();

			if ( !$isOK ) {
				$content = F::app()->wg->Memc->get( $memCacheKey );
			} else {
				F::app()->wg->Memc->set( $memCacheKey, $content );
			}

			$details = json_decode( $content, true );

			if ( empty( $details ) || empty( $details['playlist'] ) ||
			     empty( $details['playlist'][0] )
			) {
				$logger->error( self::JWPLAYER_API_ERROR_MESSAGE,
					[ 'isOK' => $isOK, 'statusCode' => $jwPlayerRequest->getStatus(), 'content' => $content ] );
			} else {
				$videoData = array_merge( $videoData, $details );

				$videoData['duration'] = WikiaFileHelper::formatDuration( $details['playlist'][0]['duration'] );
				$videoData['videoTags'] = $details['playlist'][0]['tags'];
				$videoData['metadata'] = self::getVideoMetaData( $videoData );
				$videoData['recommendedLabel'] = $wg->featuredVideoRecommendedVideosLabel;
				$videoData['recommendedVideoPlaylist'] = $wg->recommendedVideoPlaylist;

				$videoData = self::getVideoDataWithAttribution( $videoData );

				return $videoData;
			}
		}

		return [];
	}

	private static function getVideoDataWithAttribution( $videoData ) {
		$playlistVideo = $videoData['playlist'][0];

		if ( !empty( $playlistVideo['username'] ) ) {
			$videoData['username'] = $playlistVideo['username'];
		}

		if ( !empty( $playlistVideo['userUrl'] ) ) {
			$videoData['userUrl'] = $playlistVideo['userUrl'];
		}

		if ( !empty( $playlistVideo['userAvatarUrl'] ) ) {
			$videoData['userAvatarUrl'] = $playlistVideo['userAvatarUrl'];
		}

		return $videoData;
	}

	private static function getVideoMetaData( $videoDetails ) {
		$playlistItem = $videoDetails['playlist'][0];

		return [
			'name' => $videoDetails['title'],
			'thumbnailUrl' => $playlistItem['image'],
			'uploadDate' => date( 'c', $playlistItem['pubdate'] ),
			'duration' => self::getIsoTime( $videoDetails['duration'] ),
			'description' => $videoDetails['description'] ?? '',
			'contentUrl' => self::getVideoContentUrl( $playlistItem['sources'] )
		];
	}

	private static function getVideoContentUrl( $sources ) {
		return $sources[count( $sources ) - 1]['file'];
	}

	private static function getIsoTime( $colonDelimitedTime ) {
		$segments = explode( ':', $colonDelimitedTime );
		$isoTime = '';

		if ( count( $segments ) > 2 ) {
			$isoTime = 'H' . $segments[0] . 'M' . $segments[1] . 'S' . $segments[2];
		} else if ( count( $segments ) > 1 ) {
			$isoTime = 'M' . $segments[0] . 'S' . $segments[1];
		} else if ( count( $segments ) > 0 ) {
			$isoTime = 'S' . $segments[0];
		}

		return $isoTime;
	}

	public static function isRecommendedVideoAvailable( int $pageId ): bool {
		$wg = F::app()->wg;

		return !$wg->user->isLoggedIn() &&
			$wg->Title->isContentPage() &&
			!empty( $wg->RecommendedVideoABTestPlaylist ) &&
			!WikiaPageType::isActionPage() &&
			empty( self::isFeaturedVideoEmbedded( $pageId ) );
	}

	public static function getRelatedMediaIdForRecommendedVideo(): string {
		$wg = F::app()->wg;

		$relatedMediaId = [
			'b2tPs4we' => 'BfX1X16j',
			'ufzLA79x' => 'hpBoYVlX',
			'BQwrCCwR' => 'O2hLKIci',
			'PzmSVrS5' => 'MXqX3hnr',
			'Z3Vzra8s' => 'Q31xhSnO',
			'qYUWMfZP' => 'yesrrkst',
			'X3TqEV0w' => 'Xw333ob1',
			'KhkQyQT3' => 'WNcPjgNz',
		];

		// returns hardcoded mediaId or use `WNcPjgNz` if mapping doesn't exist
		// this hack is only for AB test
		return !empty( $relatedMediaId[$wg->RecommendedVideoABTestPlaylist] )
			? $relatedMediaId[$wg->RecommendedVideoABTestPlaylist] : 'WNcPjgNz';
	}
}
