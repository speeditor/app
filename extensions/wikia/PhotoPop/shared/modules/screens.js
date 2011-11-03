var exports = exports || {};

define.call(exports, function(){
	var screens = {},
	lastScreen;

	Screen = my.Class({
		_screenId: '',
		_domElement: null,
		_origDisplay: '',
		_manager: null,
		_this: this,

		constructor: function(id, manager){
			this._domElement = document.getElementById(id + 'Screen');

			if(!this._domElement) throw "Couldn't find screen '" + id + "'";

			this._manager = manager;
			this._screenId = id;
			this._origDisplay = (this._domElement.style.display && this._domElement.style.display != 'none') ? this._domElement.style.display : 'block';
			Observe(this);

			switch(id){
				case 'game':
					return new GameScreen(this);
				case 'home':
					return new HomeScreen(this);
				case 'highscore':
					return new HighscoreScreen(this);
			};
			return this;
		},
		
		getId: function(){
			return this._screenId;
		},

		hide: function(){
			this._domElement.style.display = 'none';
			this._manager.fire('hide', {id: this._screenId});
			return this;
		},

		show: function(){
			var modalWrapper = document.getElementById('modalWrapper');
			this._manager._currentId = this._screenId;
			
			if(Wikia.Platform.is('app'))
				Titanium.App.fireEvent('ScreenManager:showScreen', {id: this._screenId});
			
			if(this._screenId == 'game' && modalWrapper.state && !modalWrapper.isProgress) {
				this._manager.reopenModal();
			} else if(!modalWrapper.isProgress){
				this._manager.hideModal();
			}
			
			this._domElement.style.display = this._origDisplay;
			this._manager.fire('show', {id: this._screenId});
			return this;
		},

		getElement: function(){
			return this._domElement;
		}

	}),

	GameScreen = my.Class({

		_barWrapperHeight: 0,

		constructor: function(parent) {
			Observe(this);
			this._parent = parent;
		},

		show: function() {
			return this._parent.show();
		},
		hide: function() {
			return this._parent.hide();
		},
		getElement: function() {
			return this._parent.getElement();
		},

		init: function() {
			this._barWrapperHeight = document.getElementById('PhotoPopWrapper').clientHeight;

			this.addEventListener('prepareGameScreen', this.prepareGameScreen);
			this.addEventListener('tileClicked', this.tileClicked);
			this.addEventListener('answerDrawerButtonClicked', this.answerDrawerButtonClicked);
			this.addEventListener('rightAnswerClicked', this.rightAnswerClicked);
			this.addEventListener('wrongAnswerClicked', this.wrongAnswerClicked);
			this.addEventListener('timerEvent', this.timerEvent);
			this.addEventListener('muteButtonClicked', this.muteButtonClicked);
			this.addEventListener('answersPrepared', this.answersPrepared);
			this.addEventListener('roundStart', this.roundStart);
			this.addEventListener('tileClicked', this.tileClicked);
			this.addEventListener('timeIsUp', this.timeIsUp);
			this.addEventListener('continueClicked', this.continueClicked);
			this.addEventListener('endGame', this.endGame);
			this.addEventListener('paused', this.paused);
			this.addEventListener('resumed', this.resumed);
			this.addEventListener('goHomeClicked', this.goHomeClicked);
		},

		goHomeClicked: function(event, gameFinished) {
			if(gameFinished) {
				//this.prepareGameScreen();
			}
		},

		resumed: function() {
			document.getElementById('pauseButton').getElementsByTagName('img')[0].style.visibility = 'hidden';
			document.getElementById('pauseButton').getElementsByTagName('img')[1].style.visibility = 'visible';
		},

		paused: function() {
			document.getElementById('pauseButton').getElementsByTagName('img')[1].style.visibility = 'hidden';
			document.getElementById('pauseButton').getElementsByTagName('img')[0].style.visibility = 'visible';
		},

		endGame: function(event, options) {
			this.showEndGameScreen(options);
		},

		continueClicked: function() {
			this.showAnswerDrawer();
			this.showScoreBar();
			this.hideContinue();
		},

		timeIsUp: function(event, options) {
			var self = this;
			this.hideAnswerDrawer();
			this.hideScoreBar();
			this.showTimeUp();
			this.updateHudScore(options.totalPoints);
			setTimeout(function() {
				self.hideTimeUp(options.correct);
			}, options.timeout);
		},

		prepareGameScreen: function(event, options) {
			this.prepareMask(options.watermark);
			this.hideContinue();
			this.showScoreBar();
			this.hideAnswerDrawer();//puts the drawer back in place
			this.showAnswerDrawer();
			this.hideEndGameScreen();//needs to hide previously shown final screen
			this.updateScoreBar(100);//resets the scorebar
			this.updateMuteButton(options.mute);
		},

		roundStart: function(event, options) {
			this.showMask(options);
			this.updateHudProgress(options.currentRound, options.numRounds);
		},

		timerEvent: function(event, percent) {
			this.updateScoreBar(percent);
			//this.updateHudScore();
		},

		muteButtonClicked: function(event, mute) {
			this.updateMuteButton(mute.mute);
		},

		prepareMask: function( watermark, rows, cols ) {
			rows = rows || 4;
			cols = cols || 6;

			var tilesWrapper = document.getElementById('tilesWrapper'),
			screenElement = document.getElementById('PhotoPopWrapper'),
			table = "",
			tableWidth = screenElement.clientWidth,
			tableHeight = screenElement.clientHeight,
			rowHeight = Math.floor(tableHeight / rows),
			colWidth = Math.floor(tableWidth / cols),
			offsetY = offsetX = 0,
			self = this,
			numTiles = rows * cols;

			for(var i = 0; i < numTiles; i++) {
				table += "<div id='tile-" + i + "'></div>"
			}

			tilesWrapper.innerHTML = table;

			var divs = tilesWrapper.getElementsByTagName('div');

			for(var i = 0; i < numTiles; i++) {
				var div = divs[i],
				divStyle = div.style;

				divStyle.top = div.originalTop = offsetY;
				divStyle.backgroundImage = 'url(' + watermark + ')';
				divStyle.width = div.originalWidth = colWidth;
				divStyle.height = div.originalHeight = rowHeight;
				divStyle.backgroundPosition = '-'+ offsetX + 'px -' + offsetY + 'px';
				divStyle.left = div.originalLeft = offsetX;
				offsetX += colWidth;

				if((i+1) % cols == 0) {
					offsetX = 0;
					offsetY += rowHeight;
				}
			}

			document.getElementById('bgPic').style.display = "block";

		},

		tileClicked: function(event, tile) {
			tile.clicked = true;
			if(Wikia.Platform.is('app')) {
				tile.style.display = 'none';
			} else {
				tile.style.height = 0;
			}
		},

		answerDrawerButtonClicked: function(event, options) {
			var button = document.getElementById('answerButton'),
			buttonClassList = button.classList,
			imgs = button.getElementsByTagName('img');

			if (buttonClassList.contains('closed')) {
				imgs[0].style.visibility = 'hidden';
				imgs[1].style.visibility = 'visible';
				buttonClassList.remove('closed');
				document.getElementById('answerDrawer').style.right = 0;
			} else {
				imgs[1].style.visibility = 'hidden';
				imgs[0].style.visibility = 'visible';
				buttonClassList.add('closed');
				document.getElementById('answerDrawer').style.right = -document.getElementById('answerDrawer').offsetWidth+20;
			}
		},

		answersPrepared: function(event, options) {
			var answers = document.getElementById('answerList'),
			answerList = answers.getElementsByTagName('li'),
			answerListLength = answerList.length,
			answerDrawer = document.getElementById('answerDrawer'),
			answerButton = document.getElementById('answerButton');

			for(var i = 0; i < answerListLength; i++) {
				answerList[i].clicked = false;
				answerList[i].innerHTML = options.answers[i];
				answerList[i].classList.remove(options['class']);
			}

			setTimeout(function() {
				var width = document.getElementById('answerList').offsetWidth;

				document.getElementById('answerDrawer').style.width = width+20;
				document.getElementById('answerDrawer').style.right = -width;
				document.getElementById('answerButton').style.right = width;
			},100);


		},

		wrongAnswerClicked: function(event, options) {
			var li = options.li;
			li.className = options["class"];
			li.clicked = true;
			this.updateScoreBar(options.percent);
			//this.updateHudScore();
		},

		rightAnswerClicked: function(event, correct) {
			this.hideScoreBar();
			this.revealAll(correct);
			this.hideAnswerDrawer();
		},

		updateScoreBar: function(percent){
			var barHeight = Math.floor(percent * this._barWrapperHeight / 100),
			scoreBarStyle = document.getElementById('scoreBar').style,
			fgb = 0, fgg = 0, fgr = 0;

			// Will fade the colors from green to yellow to red as we go from full points, approaching no points.
			if(percent > 50){
				//in english: the top half of the bar should go from 0 red to 255 red between 100% and 50%.
				fgr = Math.min(255, (Math.floor( 255-((255*((percent-50)*2))/100))  + 127) );
				fgb = 64;
				fgg = 196;
			} else {
				//in english: the bottom half of the bar should go from 255 green to 0 green between 50% and 0%.
				fgg = Math.min(196, Math.floor( ((255*(percent*2))/100) ));
				fgr = 255;
			}

			scoreBarStyle.height = barHeight;
			scoreBarStyle.backgroundColor = 'rgb('+fgr+', '+fgg+', '+fgb+')';
			//incase we want to have gradient on scoreBar
			//scoreBarStyle.background = '-webkit-linear-gradient(left, rgba('+fgr+', '+fgg+', '+fgb+',.5) 0%, rgba('+fgr+', '+fgg+', '+fgb+',1) 50%, rgba('+fgr+', '+fgg+', '+fgb+',.5) 100%)';
		},

		hideScoreBar: function() {
			var scoreBarStyle = document.getElementById('scoreBar').style;

			document.getElementById('scoreBarWrapper').style.opacity = 0;

			scoreBarStyle.height = this._barWrapperHeight;
			scoreBarStyle.backgroundColor = 'rgba(137, 196, 64, 0.9)';
		},

		revealAll: function(correct) {
			var divs = document.getElementById('tilesWrapper').getElementsByTagName('div'),
			divsLength = divs.length,
			next = 0,
			self = this,
			div,
			t = setInterval(function() {
				div = divs[next++];
				div.style.left = "-400px";
				div.clicked = true;
				if(next == divsLength) {
					clearInterval(t);
					self.showContinue(correct);
				}
			}, 5);

		},

		showMask: function(options) {
			this.fire('displayingMask', options);

				var divs = document.getElementById('tilesWrapper').getElementsByTagName('div'),
				divsArray = Array.prototype.slice.call(divs),
				divsLength = divsArray.length,
				next = 0,
				self = this;

				divsArray.shuffle();

				var t = setInterval(function() {
					divsArray[next].clicked = false;
					divsArray[next].style.left = divsArray[next].originalLeft;
					if(Wikia.Platform.is('app')) {
						divsArray[next].style.display = 'block';
					} else {
						divsArray[next].style.height = divsArray[next].originalHeight;
					}

					next++;
					if(next == divsLength) {
						clearInterval(t);
						self.updateHudScore(options.totalPoints);
						setTimeout(function() {self.fire('maskDisplayed');}, 400);
					}
				}, 1);
			

		},

		hideAnswerDrawer: function(){
			var answerDrawerStyle = document.getElementById('answerDrawer').style,
			answerButton = document.getElementById('answerButton');

			answerDrawerStyle.display = 'none';
			answerDrawerStyle.right = -225;

			answerButton.classList.add('closed');
			answerButton.getElementsByTagName('img')[1].style.visibility = 'hidden';
			answerButton.getElementsByTagName('img')[0].style.visibility = 'visible';
		},

		showContinue: function(text) {
			var nextRoundStyle = document.getElementById('continue').style,
			hudStyle = document.getElementById('hud').style;
			document.getElementById('continueText').innerHTML = text;
			nextRoundStyle.right = '0%';
			hudStyle.left = '100%';
		},

		hideContinue: function() {
			var nextRoundStyle = document.getElementById('continue').style,
			hudStyle = document.getElementById('hud').style;

			nextRoundStyle.right = '100%';
			hudStyle.left = '0%';
		},

		showScoreBar: function() {
			document.getElementById('scoreBarWrapper').style.opacity = 1;
		},

		showEndGameScreen: function(options){
			//TODO: reset whole game
			document.getElementById('endGameOuterWrapper').style.display = 'block';

			document.querySelector('#endGameSummary .summaryText_completion').innerHTML = Wikia.i18n.Msg('photopop-game-yougot') + ' ' + options.numCorrect + ' ' + Wikia.i18n.Msg('photopop-game-outof') + ' ' + options.numTotal + ' ' + Wikia.i18n.Msg('photopop-game-correct');
			document.querySelector('#endGameSummary .summaryText_score').innerHTML =  Wikia.i18n.Msg('photopop-game-score') + ': ' + options.totalPoints;
		},

		hideEndGameScreen: function(){
			document.getElementById('endGameOuterWrapper').style.display = 'none';
		},

		updateHudScore: function(totalPoints){
			//document.getElementById('roundPoints').innerHTML = roundPoints;
			document.getElementById('totalPoints').innerHTML = totalPoints;
		},

		updateHudProgress: function(currentRound, numRounds) {
			document.getElementById('progress').getElementsByTagName('span')[0].innerHTML = currentRound + '/' + numRounds;
		},

		updateMuteButton: function(mute) {
			var button = document.getElementById('muteButton').getElementsByTagName('img');

			if(mute) {
				button[0].style.visibility = 'hidden';
				button[1].style.visibility = 'visible';
			} else {
				button[1].style.visibility = 'hidden';
				button[0].style.visibility = 'visible';
			}
		},

		showAnswerDrawer: function(){
			document.getElementById('answerDrawer').style.display = 'block';
		},

		showTimeUp: function() {
			var timeUpTextStyle = document.getElementById('timeUpText').style;

			timeUpTextStyle.zIndex = 40;
			timeUpTextStyle.margin = '-50px 0 0 -150px';
		},

		hideTimeUp: function(correct) {
			var timeUpTextStyle = document.getElementById('timeUpText').style,
			self = this;

			timeUpTextStyle.zIndex = 0;
			timeUpTextStyle.margin = '350px 0 0 -150px';

			setTimeout(function() {
				self.revealAll(document.getElementById(correct).innerHTML);
			}, 1001);
		}

	}),

	HomeScreen = my.Class({

		constructor: function(parent) {
			Observe(this);
			this._parent = parent;
		},

		show: function() {
			return this._parent.show();
		},
		hide: function() {
			return this._parent.hide();
		},
		getElement: function() {
			return this._parent.getElement();
		},

		init: function(mute) {
			this.addEventListener('muteButtonClicked', this.muteButtonClicked);
			this._muteButton =  document.getElementById('button_volume').getElementsByTagName('img');
			this.updateMuteButton(mute);
		},

		muteButtonClicked: function(event, mute) {
			this.updateMuteButton(mute.mute);
		},

		updateMuteButton: function(mute) {
			var imgs = this._muteButton;
			if(mute) {
				imgs[0].style.display = "none";
				imgs[1].style.display = "block";
			} else {
				imgs[1].style.display = "none";
				imgs[0].style.display = "block";
			}
		}

	}),

	HighscoreScreen = my.Class({

		constructor: function(parent) {
			Wikia.log('games: Highscore screen created');
			Observe(this);
			this._parent = parent;
		},

		show: function() {
			return this._parent.show();
		},
		hide: function() {
			return this._parent.hide();
		},
		getElement: function() {
			return this._parent.getElement();
		},

		init: function() {
			this.addEventListener('openHighscore', this.openHighscore);
		},

		openHighscore: function(event, highscore) {
			Wikia.log('games: Highscore - ' + highscore);
			var trs = document.getElementById('highscoreScreen').getElementsByTagName('tr');
			if(highscore.length > 0) {
				for(var i = 0, l = highscore.length; i < l; i++ ) {
					var tr = trs[i+1],
					tds = tr.getElementsByTagName('td'),
					date = highscore[i].date;

					tds[0].innerHTML = (i+1);
					tds[1].innerHTML = highscore[i].wiki;
					tds[2].innerHTML = date[0] + ' ' + Wikia.i18n.Msg('photopop-game-month-'+ date[1]) + ' ' + date[2];
					tds[3].innerHTML = highscore[i].score;
				};
			} else {
				trs[1].getElementsByTagName('td')[2].innerHTML = Wikia.i18n.Msg('photopop-game-no-highscore');
			}

		}
	}),

	ScreenManager = my.Class({
		_progressTotal: null,
		_progressStatus: 0,
		_isProgress: false,
		_currentId: null,
		
		constructor: function(){
			Observe(this);
		},

		get: function(id){
			return screens[id] = screens[id] || new Screen(id, this);
		},

		openModal: function(options) {
			Wikia.log('PROGRESS OPNENED: ' + options.progress);
			options = options || {};

			var modalWrapper = document.getElementById('modalWrapper'),
			modal = document.getElementById('modal'),
			self = this,
			html;

			if(options.fontSize) {
				modal.style.fontSize = options.fontSize;
			} else {
				modal.style.fontSize = "x-large";
			}

			if(options.triangle) {
				modal.classList.add('triangle');
				modal.classList.add(options.triangle);
			} else {
				modal.classList.remove('triangle');
			}


			if( options.clickThrough ) {
				modalWrapper.style.pointerEvents = 'none';
				modal.style.pointerEvents = 'auto';
			} else {
				modalWrapper.style.pointerEvents = 'auto';
			}

			if( options.leaveBottomBar ) {
				modalWrapper.style.top = -24;
			} else {
				modalWrapper.style.top = 0;
			}

			if(options.html) {
				document.getElementById('modalText').innerHTML = options.html;
			} else {
				document.getElementById('modalText').innerHTML = "";
			}

			if(options.progress){
				this._progressTotal = options.total || 100;
				this._progressStatus = 0;
				modalWrapper.isProgress = true;
				document.getElementById('jobProgress').classList.add('visible');
			}else{
				document.getElementById('jobProgress').classList.remove('visible');
			}

			modalWrapper.style.visibility = 'visible';
			modalWrapper.state = true;

			this.fire('modalOpened', {name: options.name});

			if(options.closeOnClick) {
				modalWrapper.onclick = function() {
					self.closeModal();
				}
			} else {
				modalWrapper.onclick = null;
			}
		},

		closeModal: function() {
			var modalWrapper = document.getElementById('modalWrapper'),
			modal = document.getElementById('modal');
			modal.classList.remove('triangle');
			document.getElementById('modalText').innerHTML = "";
			modalWrapper.style.visibility = 'hidden';
			modalWrapper.state = false;
			modalWrapper.isProgress = false;
		},

		updateModalProgress: function() {
			this._progressStatus++;
			
			if(this._progressStatus <= this._progressTotal) {
				document.getElementById('currentValue').innerHTML = this._progressStatus;
				document.getElementById('totalValue').innerHTML = this._progressTotal;
				document.getElementById('progressBar').style.width = document.getElementById('progressBarWrapper').offsetWidth / (this._progressTotal/this._progressStatus);
			}
		},

		reopenModal: function() {
			document.getElementById('modalWrapper').style.visibility = 'visible';
		},

		hideModal: function() {
			document.getElementById('modalWrapper').style.visibility = 'hidden';
		},

		getScreenIds: function() {
			var names = [];

			for(var id in screens) {
				names.push(id);
			}

			return names;
		},
		
		showsProgress: function(){
			Wikia.log('PROGRESSS ' + this._isProgress);
			return this._isProgress;
		},
		
		getCurrentId: function(){
			return this._currentId;
		}
	});

	return new ScreenManager();
});