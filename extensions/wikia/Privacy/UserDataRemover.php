<?php

use Wikia\Logger\Loggable;

class UserDataRemover {
	use Loggable;

	public function removeGlobalData( int $userId, User $fakeUser = null ) {
		$user = User::newFromId( $userId );
		if ( $user->isAnon() ) {
			return false;
		}

		if ( !empty( $fakeUser ) ) {
			$this->removeRenamedUserData( $userId, $fakeUser );
		}

		$this->removeUserData( $user );
	}

	private function removeUserData( User $user ) {
		try {
			$userId = $user->getId();
			$userName = $user->getName();
			$newUserName = uniqid( 'Anonymous ' );

			$userIdentityBox = new UserIdentityBox( $user );
			$userIdentityBox->clearMastheadContents();
			Wikia::invalidateUser( $user, true, false );

			$dbMaster = wfGetDB( DB_MASTER, [], 'wikicities' );

			// commit changes performed by Wikia::invalidateUser
			$dbMaster->commit( __METHOD__ );
			wfWaitForSlaves( $dbMaster->getDBname() );

			// invalidate the old user name -> user ID mapping
			$this->invalidateUser( $userName );

			$dbMaster->update( 'user', [
					'user_name' => $newUserName,
					'user_birthdate' => null,
				], [ 'user_id' => $userId ], __METHOD__ );

			$dbMaster->delete( 'user_email_log', [ 'user_id' => $userId ] );
			$dbMaster->delete( 'user_properties', [ 'up_user' => $userId ] );

			// commit early so that cache is properly invalidated
			$dbMaster->commit( __METHOD__ );
			wfWaitForSlaves( $dbMaster->getDBname() );

			// invalidate user cache
			$user = User::newFromId( $userId );

			$this->invalidateUser( $user );
			$this->invalidateUser( $newUserName );

			$this->removeUserDataFromStaffLog( $userId );

			$this->info( "Removed user's global data",
				[ 'user_id' => $userId, 'new_user_name' => $newUserName ] );

			return true;
		}
		catch ( Exception $error ) {
			$this->error( "Couldn't remove global user data",
				[ 'exception' => $error, 'user_id' => $userId ] );

			return false;
		}
	}

	private function removeRenamedUserData( int $userId, User $fakeUser ) {
		$this->removeUserData( $fakeUser );

		$dbMaster = wfGetDB( DB_MASTER, [], 'wikicities' );

		$dbMaster->insert( 'user_properties', [
			[
				'up_user' => $fakeUser->getId(),
				'up_property' => 'removedRenamedUser',
				'up_value' => $userId,
			],
		] );
	}

	private function removeUserDataFromStaffLog( int $userId ) {
		$dbMaster = wfGetDB( DB_MASTER, [], 'dataware' );

		$dbMaster->delete( 'wikiastaff_log', [
			'slog_user' => $userId,
		] );
	}

	/**
	 * Borrowed from RenameUserProcess class
	 *
	 * @param User|string $user
	 * @throws InvalidArgumentException
	 */
	private function invalidateUser( $user ) {
		if ( is_string( $user ) ) {
			$user = User::newFromName( $user );
		} elseif ( !is_object( $user ) ) {
			throw new InvalidArgumentException(__METHOD__ . ' method should be called with string or User provided');
		}

		if ( is_object( $user ) ) {
			$user->invalidateCache( false );
		}
	}

	protected function getLoggerContext() {
		// make right to be forgotten logs more searchable
		return ['right_to_be_forgotten' => 1];
	}

}