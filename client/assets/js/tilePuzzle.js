
$(document).ready( function () {
	
	var canvas, 
	ctx, 
	mouseX, 
	mouseY;
	
	var img = {},
		soundElements = {},
		myGame = {},
		cellsList = {},
		promptList = {},
		buttonList = {},
		cellPosition = {},
		txtFieldList = {},
		endImageList = {};
		
	var playerPressingUp = false,
		playerPressingLeft = false,
		playerPressingRight = false,
		playerPressingDown= false,
		gameOver = false,
		clickDisable = false;

	var	cWidth = 0, 
		cHeight = 0,
		loadCounter = 0,
		loadFiles = 0,
		canvasWidth = 0,
		canvasHeight = 0,
		puzzleWidth = 0;
	
	
	preLoadGameEssentials();
	
	function preLoadGameEssentials () {
		
		initImages();
		initSounds ();
		
		var filesCount = 0, loadCount = 0;
		
		for ( var i in img ) {
			filesCount++;
			img[i].onload = function () {
				loadCount++;
			}
		}
		
		for ( var j in soundElements ) {
			filesCount++;
			$('#'+ j ).on('canplaythrough', function(){
				loadCount++; 
				
				$(this).get(0).volume=0;
				$(this).get(0).muted=true;
				$(this).get(0).pause();
				
				$(this).off();
				////console.log ('load', loadCount);
			});
		}
		
		var loader = setInterval (function () {
			
			var perc = Math.floor (loadCount/filesCount * 100);
			
			$("#game_progresstxt").html ("<strong>Loading game files... "+ perc +"%</strong>");
			
			//console.log ('perc', perc );
			
			if ( loadCount >= filesCount ) {
				
				$("#game_progresstxt").html ("<strong>All Files Loaded...</strong>");
				
				//console.log ('All files loaded..');
				
				clearInterval(loader);
				
				setTimeout( initGameEssentials, 1000 );
				
			}
			$('#game_progressbar').css( {width : perc+"%"});
			
		}, 40);
		
	}
	
	function initImages () {

		var images = ["image0", "image1", "image2"];
		for ( var i=0; i < images.length; i++) {
			img [ images[i] ] = new Image ();
			img [ images[i] ].src = "images/" +images[i]+".jpg";
		}	
	}

	function initSounds () {
		
		var sounds = ["xyloriff", "tick", "harp", "message", "error"];
		
		for( var i=0; i<sounds.length; i++) {
			
			var audio = $('<audio/>' , {
				'id' : sounds[i],
				'src' : 'sounds/'+ sounds[i] + '.wav',
				'autoplay' : true,
				'muted' : true
			}).appendTo('#game_sounds');
			
			soundElements[sounds[i]] = sounds[i];
		} 
		
	}
	
	function initCanvas () {
		
		var tempWidth = $("#game_maindiv").width();
		
		canvasWidth = tempWidth;
		canvasHeight = Math.floor((tempWidth*12)/10); //aspect ratio 10:12

		$('#game_canvas').prop ({
			'width' : tempWidth,
			'height' : canvasHeight
		});

		$('#game_canvas').focus()
		.mousemove ( function (evt) {
			////console.log ('mousemove');	
			mouseX = evt.pageX - $('#game_canvas').offset().left;
			mouseY = evt.pageY - $('#game_canvas').offset().top;
			
			$("#mouse_pos").text( mouseX + ":" + mouseY);
		})
		.mousedown ( function(evt) {
			////console.log ('mousedown');	
			
			mouseX = evt.pageX - $('#game_canvas').offset().left;
			mouseY = evt.pageY - $('#game_canvas').offset().top;
			
			for ( var j in buttonList) {
				if ( isClicked(buttonList[j]) ) {
					buttonList[j].click();
					return;
				}
			}
			
			for ( var i in cellsList) {
				if ( isClicked(cellsList[i]) ) {
					cellsList[i].click();
					return;
				}
			}
		});
		
		$(document).keyup ( function (e) {
			
			e.preventDefault();
			
			playerPressingUp = false;
			playerPressingLeft = false;
			playerPressingRight = false;
			playerPressingDown = false;
		})
		.keypress ( function (e) {
			
			e.preventDefault();
			
			//console.log ('keypress');	
			//console.log ( e.keyCode );
			if ( e.keyCode == 97 || e.keyCode == 52) {
				playerPressingLeft = true;
			}
			if ( e.keyCode == 115 || e.keyCode == 53) {
				playerPressingDown = true;
			}
			if ( e.keyCode == 100 || e.keyCode == 54) {
				playerPressingRight = true;
			}
			if ( e.keyCode == 119 || e.keyCode == 56) {
				playerPressingUp = true;
			}
		});
		
		
	};
	
	function initPrompt ( text ) {
	
		promptList = {};
		
		var width = canvasWidth * .6;
		var height = canvasHeight * .12;
		
		var startx = ( canvasWidth - width)/2;
		var starty = ( canvasHeight - height )/2;
		
		Prompt ("prompt", startx, starty, width, height, text );
			
		playAudio("message");
		
	}

	function initCells ( row, col ) {
		
		//var row = myGame.row, col = myGame.col;
		
		var puzzleSize = canvasWidth*.95, spacing = 2;
		
		var piecesSize = ( puzzleSize / row ) - spacing;
		
		var startx = ( canvasWidth - puzzleSize )/2, 
			starty = ( canvasHeight - puzzleSize )/2;
		
		puzzleWidth = puzzleSize;
		
		
		var imageSize = 478;
		
		var imgPieceSize = ( imageSize / row );
		
		var imgScale = ( piecesSize*row ) / imageSize ;
		
		var counter = 0;
		
		for ( var i=0; i< row; i++ ) {
			for ( var j=0; j< col; j++ ) {
				
				var xp = j * (piecesSize + spacing) + startx ;
				var yp = i * (piecesSize + spacing) + starty ;
				
				cellPosition[counter] = { 'x' : xp, 'y' : yp, 'row' : i, 'col' : j, 'isOpen' : false, 'resident' : counter };
					
				//if ( counter < (row*col-1) )
				Cells ( "cell"+counter, xp, yp, piecesSize, piecesSize, i, j, counter, imgPieceSize, imgScale );
					
				counter++;
			}
		}
		
		cellPosition[ row*col-1 ].isOpen = true;
	}
	
	function initButton () {
		
		var buts = [{ 'id' : 'changeImage', 'txt' : 'Next Image'}, 
					{ 'id' : 'startGame', 'txt' : 'Start Game'}];
					
		var remHeight = (canvasHeight - puzzleWidth)/2;
		
		var starty = canvasHeight - remHeight;
		
		var width = canvasWidth *0.35,
			height = canvasHeight *0.06,
			spacing = width * 0.06;
			
		var totalWidth = ( buts.length * width ) + (( buts.length - 1) * spacing );
		
		var x = (canvasWidth - totalWidth)/2;
			y = starty + ( remHeight-height)/2;
			
		for ( var i=0; i < buts.length; i++) {
			
			Button ( buts[i].id, x + i*(width+spacing), y, width, height, buts[i].txt )
		}
		
	}
	
	function initTextField () {
		
		var remHeight = (canvasHeight - puzzleWidth)/2;
		
		var width = canvasWidth *0.75,
			height = canvasHeight *0.07;
			
		var x = (canvasWidth - width)/2,
			y = ( remHeight - height )/2;
			
		var text = "00:00:00";
		
		TextFields ( 'timerField', x, y, width, height, text )
		
	}
	
	function initEndImage () {
		
		var size = puzzleWidth - ( myGame.col*2 );
		
		var imgScale = size / 478 ;
		
		var startx = (canvasWidth-size)/2,
			starty = (canvasHeight-size)/2;
			
		EndImage ( 'endimage', startx, starty, size, size, imgScale )
		
	}
	
	function initGameEssentials () {
		
		$('#d_loading').removeClass('d-flex');
		$('#d_loading').addClass('d-none');
		
		$('#d_game').addClass('d-flex h-100');
		$('#d_game').removeClass('d-none');
		
		
		initCanvas();
		initCells(5,5);
		initTextField();
		initButton();
		
		myGame = Game(5,5);

		setInterval ( updateGame, 40 );  //25fps 1000/40 = 25 :D
	}
	
	function startGame () {
		
		initPrompt("Initializing Game..");
		
		myGame.isInited = true;
		
		buttonList['startGame'].isDisabled = true;
		//buttonList['changeImage'].isDisabled = true;
		
		var lastTile = myGame.row * myGame.col;
		
		delete cellsList['cell' + (lastTile-1)];
		
	}
	
	//clicks..
	function btnIsClicked ( btnid ) {
		
		
		var btn = buttonList[btnid];
		
		playAudio("tick");
		
		//console.log ( btnid );
		
		switch ( btnid ){
						
			case "changeImage" :
			
				if ( myGame.img < 2 ) {
					myGame.img += 1;
				}else {
					myGame.img = 0;
				}
				
				gameRefresh();
				
				break;
				
			case "startGame" :
			
				startGame();
				break;
			case "playAgain" :
				
				gameRefresh();
				
				break;
			
		}
	}

	function cellIsClicked ( cellid ) {
		
		var cell = cellsList[cellid];
		
		var xp = cellPosition[cell.cellpost].col,
			yp = cellPosition[cell.cellpost].row;
			
		var objAdjacent = getAdjacent(xp, yp);
		
		var openCell = null, oldCell = cell.cellpost;
		
		for ( var i in objAdjacent ) {
			
			var cellNumber = objAdjacent[i].cellid;
			
			if ( cellPosition[cellNumber].isOpen ) openCell = cellNumber;
		}
		
		if ( openCell != null ) {
			
			cellPosition[oldCell].isOpen = true;
			
			cellPosition[openCell].isOpen = false;
			
			cell.desx = cellPosition[openCell].x;
			cell.desy = cellPosition[openCell].y;
			cell.cellpost = openCell;
			cell.isMoving = true;
			
			playAudio ('tick');
			
			if ( checkComplete() ) endGame();
			
		}else {
			playAudio ('error')
			
			cell.blink();
		}
		
		//...
	}
	
	function calculateGameBest () {
		
		
		var newsecs = ( myGame.timer.hr * 3600 ) + ( myGame.timer.min * 60 ) + myGame.timer.sec;
		
		var bestsecs = ( myGame.gameBest.hr * 3600 ) + ( myGame.gameBest.min * 60 ) + myGame.gameBest.sec;
		
		//console.log ( bestsecs, newsecs );
		
		
		if ( bestsecs == 0 || newsecs < bestsecs ) myGame.gameBest = myGame.timer;
		
		//console.log ( myGame.gameBest );
			
		
			
	}
	
	function endGame () {
		
		playAudio('harp');
		
		cellsList = {};
		
		myGame.isOver = true;
		myGame.stopTimer();	
		
		calculateGameBest();
		
		initEndImage();
		
		endPrompt();
		
		txtFieldList['timerField'].blink();
	}
	
	function endPrompt () {
		
		var width = canvasWidth * .7;
		var height = canvasHeight * .2;
		
		var startpx = ( canvasWidth - width)/2;
		var startpy = ( canvasHeight - height)/2;
		
		var txt = "Game Best : " + lessTen(myGame.gameBest.hr) + ":" + lessTen(myGame.gameBest.min)  + ":" +  lessTen(myGame.gameBest.sec);
		
		Prompt ("prompt", startpx, startpy, width, height, txt, true);
		
		
		var bwidth = width * 0.5;
		var bheight = height * 0.2;
		
		var startx = startpx + ( width - bwidth)/2;
		var starty = startpy + height*0.6;
		
		Button ( "playAgain", startx, starty, bwidth, bheight, "Play Again");
		
	}
	
	function checkComplete () {
		
		for ( var i in cellsList ) {
			
			var cell = cellsList[i];
			
			if ( cell.post != cell.cellpost ) return false;
		}
		
		return true;
		
	}
	
	function removePrompt() {
		
		promptList = {};
		
		playAudio("message");
	}
	
	function getReverse ( dir ) {
		
		var reverse = '';
		
		if ( dir == 'up') reverse = 'down';
		if ( dir == 'down') reverse = 'up';
		if ( dir == 'left') reverse = 'right';
		if ( dir == 'right') reverse = 'left';
		
		return reverse;
	}
	
	
	function jumblePiecesPosition () {
		
		var xp = cellPosition[myGame.openCell].col,
			yp = cellPosition[myGame.openCell].row;
			
		var adjacents = getAdjacent( xp, yp );
		
		var adjArr = [];
		
		var rev = getReverse(myGame.dir);
		
		if ( adjacents.hasOwnProperty ( rev ) ) {
			delete adjacents [rev];
		}
		
		var adjArr = Object.keys(adjacents);
		
		var indx = Math.floor ( Math.random() * adjArr.length );
		
		var cellToOpen = adjacents[ adjArr[indx] ].cellid;
		
		myGame.dir = adjArr[indx];
		
		// for ( var i in adjacents ) {
			// adjArr.push ( adjacents[i].cellid );
			
		// var indx = Math.floor ( Math.random() * adjArr.length );
		
		// var cellToOpen = adjArr[indx];
		
		for ( var j in cellsList ) {
			
			var cell = cellsList[j];
			
			if ( cellToOpen == cell.cellpost ) {
				
				var tempPost = cell.cellpost;
				
				cellPosition[myGame.openCell].isOpen = false;
				
				cellPosition[tempPost].isOpen = true;
				
				cell.desx = cellPosition[myGame.openCell].x;
				cell.desy = cellPosition[myGame.openCell].y;
				cell.cellpost = myGame.openCell;
				cell.isMoving = true;
				
				myGame.openCell = tempPost;
				
				//break;
			}
			
		}
		
		
	}
	
	function gameRefresh () {
		
		cellPosition = {};
		endImageList = {};
		cellsList = {};
		promptList = {};
		buttonList = {};
		
		txtFieldList['timerField'].reset();
		
		initCells(5,5);
		initButton();

		myGame.reset();

		//initPrompt("Initializing Game..");
		
	}

	function playAudio (str, vol=0.5) {
		
		$('#' + str ).get(0).muted = false;
		$('#' + str ).get(0).currentTime = 0;
		$('#' + str ).get(0).volume = vol;
		$('#' + str ).get(0).play();

	}

	function getMousePos (canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
		  x: evt.clientX - rect.left,
		  y: evt.clientY - rect.top
		};
	}
		  
	function isClicked ( obj ) {
		return mouseX >= obj.x 
			&& mouseX <= obj.x + obj.width
			&& mouseY >= obj.y
			&& mouseY <= obj.y + obj.height;
	}

	function getAdjacent ( x, y ) {
		
		var col = myGame.col,
			row = myGame.row;
			
		var tempAdj = {};
		
		if ( (x - 1) >= 0 ) tempAdj['left'] = { 'x' : x - 1, 'y' : y, 'cellid' : (x-1) + (y*col) };
		if ( (y - 1) >= 0 ) tempAdj['up'] = { 'x' : x, 'y' : y - 1, 'cellid' : x + ((y-1)*col)  };
		if ( (x + 1) < col ) tempAdj['right'] = { 'x' : x + 1, 'y' : y, 'cellid' : (x+1) + (y*col) };
		if ( (y + 1) < row ) tempAdj['down'] = { 'x' : x, 'y' : y + 1, 'cellid' : x + ((y+1)*col) };
		
		return tempAdj;
	}

	function lessTen ( num ) {
		
		if ( num < 10 ) {
			return '0' + num;
		}else {
			return num;
		}
	}


	function updateCellPositionsFieldResize () {

		var total = myGame.row * myGame.col;
	
		var counter = 0;

		for ( var i=0; i< total; i++ ) {
				
			var oldWidth = myGame.canvasSize.width;
			var oldHeight = myGame.canvasSize.height;

			var x_perc = cellPosition[counter].x/oldWidth;
			var y_perc = cellPosition[counter].y/oldHeight;

			//update..
			cellPosition[counter].x = canvasWidth * x_perc;
			cellPosition[counter].y = canvasHeight * y_perc;

			counter++;
			
		}
		//..
	}

	function updateAllElements() {
		console.log ('field has been resized..')

		updateCellPositionsFieldResize();

		Cells_FieldResize();
		EndImage_FieldResize();
		Prompt_FieldResize();
		Button_FieldResize();
		TextFields_FieldResize();

	}

	//update...
	function updateGame () {
		
		$('#game_canvas').clearCanvas();
		
		myGame.update();
		
		Cells_update();
		EndImage_update();
		Prompt_update();
		Button_update();
		TextFields_update();

	}

	/* 
		classes here..
	*/

	//Game
	function Game (r,c) {

		var gm = {

			row : r,
			col : c,
			img : 0,
			dir : '',
			frameCounter : 0,
			isInited : false,
			isOver : false,
			startTime : false,
			gameBest : {
				'hr' : 0,
				'min' : 0,
				'sec' : 0
			},
			timer : {
				'hr' : 0,
				'min' : 0,
				'sec' : 0
			},
			canvasSize : {
				'width' : canvasWidth,
				'height' : canvasHeight
			},
			openCell : r*c-1
		}
		
		gm.reset = function () {
			
			gm.timer.hr = 0;
			gm.timer.min = 0;
			gm.timer.sec = 0;
			
			gm.dir = '';
			gm.startTime = false;
			gm.frameCounter = 0;
			gm.isOver = false;
			gm.isInited = false;
			
			gm.openCell = (gm.row*gm.col)-1;
			
		}
		
		gm.startTimer = function () {
			gm.startTime = true;
			gm.frameCounter = 0;
		}
		
		gm.stopTimer = function () {
			gm.startTime = false;
		}
		
		gm.update = function () {
			
			var tempWidth = $("#game_maindiv").width();
		
			canvasWidth = tempWidth;
			canvasHeight = Math.floor((tempWidth*12)/10); //aspect ratio 10:12

			$('#game_canvas').prop ({
				'width' : tempWidth,
				'height' : canvasHeight
			});

			if ( gm.canvasSize.width !== canvasWidth ) {

				console.log (canvasWidth, canvasHeight, ":", gm.canvasSize.width, gm.canvasSize.height);

				updateAllElements();

				gm.canvasSize.width = canvasWidth;
				gm.canvasSize.height = canvasHeight;
			}

			if (gm.isInited) {
				
				if (gm.frameCounter == 50){
					
					initPrompt("Re-arranging Tiles..");
					
				}else if ( gm.frameCounter > 50 ) {
					
					//if ( gm.frameCounter%2==0) jumblePiecesPosition();
					
					jumblePiecesPosition();
							
				}
				
				gm.frameCounter++;
				
				if ( gm.frameCounter >= 250 ) { //250
					gm.frameCounter = 0;
					gm.isInited = false;
					
					removePrompt();
					Cells_disabled(false);
					
					//endGame();
					
					gm.startTimer();
				}
			}
			
			if (gm.startTime) {
				
				if ( gm.frameCounter % 25 == 0) {
					
					gm.timer.sec += 1;
					if ( gm.timer.sec >= 60) {
						gm.timer.min += 1;
						gm.timer.sec = 0;
					}
					if ( gm.timer.min >= 60) {
						gm.timer.hr += 1;
						gm.timer.min = 0;
					}
					
					var hr = lessTen(gm.timer.hr),
						min = lessTen(gm.timer.min),
						sec = lessTen(gm.timer.sec);
						
 					txtFieldList['timerField'].text = hr+":" +min+":" +sec; 
				}
				gm.frameCounter++;
				
			}
			
		}
		
		return gm;
	}

	
	//Cells..
	function Cells ( id, x, y, width, height, row, col, cellpost, imgSize, imgScale ) {
		
		var cell = {
			
			id : id,
			x : x+.5,
			y : y+.5,
			width : width,
			height : height,
			row : row,
			col : col,
			desx : 0,
			desy : 0,
			vel : 35,
			counter : 0,
			post : cellpost,
			cellpost : cellpost,
			imgSize : imgSize,
			imgScale : imgScale,
			isMoving : false,
			isDisabled : true,
			toBlink : false,
			startBlink : false,
			
			fieldResize : function () {

				var oldWidth = myGame.canvasSize.width;
				var oldHeight = myGame.canvasSize.height;
	
				var x_perc = this.x/oldWidth;
				var y_perc = this.y/oldHeight;
	
				var w_perc = this.width/oldWidth;
				var h_perc = this.height/oldHeight;
				
				//update..
				this.x = canvasWidth * x_perc;
				this.y = canvasHeight * y_perc;
	
				this.width = canvasWidth * w_perc;
				this.height = canvasHeight * h_perc;

				//this.imgSize = canvasWidth * w_perc;
				this.imgScale = ( (canvasWidth * w_perc) * myGame.row ) / 478
			},

			click : function () {
				if ( !this.isDisabled ) cellIsClicked (this.id);
			},
			blink : function () {
				this.startBlink = true;
				this.counter = 0;
			},
			updatePosition : function () {
				
				if ( this.startBlink ) {
					
					if ( this.counter%2==0) this.toBlink = !this.toBlink;
					
					this.counter+=1;
					if ( this.counter >= 15 ) {
						this.toBlink = false;
						this.startBlink=false;
					}
				}
				if ( this.isMoving ) {
					
					this.toBlink = false;
					this.startBlink = false;
					
					if ( this.x < this.desx ) {
						this.x += this.vel;
						if ( this.x >= this.desx) this.x = this.desx;
					}
					if ( this.x > this.desx ) {
						this.x += -this.vel;
						if ( this.x <= this.desx) this.x = this.desx;
					}
					if ( this.y < this.desy ) {
						this.y += this.vel;
						if ( this.y >= this.desy) this.y = this.desy;
					}
					if ( this.y > this.desy ) {
						this.y += -this.vel;
						if ( this.y <= this.desy) this.y = this.desy;
					}
					
					if ( this.x == this.desx && this.y == this.desy ) this.isMoving = false;
				}
				
			},
			draw : function () {
				
				$('#game_canvas').drawImage({
					
					source: img['image'+myGame.img],
					x: this.x + this.width/2, 
					y: this.y + this.height/2,
					sWidth: this.imgSize,
					sHeight: this.imgSize,
					sx: this.col * this.imgSize, 
					sy: this.row * this.imgSize, 
					scale : this.imgScale,
					imageSmoothing : true
				})
				.drawRect ({
					strokeStyle: '#999',
					strokeWidth: 1,
					x : this.x, y : this.y,
					width : this.width,
					height : this.height,
					fromCenter : false,
				});
					
				if (this.toBlink) {
					$('#game_canvas').drawRect ({
						fillStyle : 'rgba(245,0,0,0.3)',
						x : this.x, y : this.y,
						width : this.width,
						height : this.height,
						fromCenter : false,
					});
				}
				
			},
			update:function () {
				////console.log ('asdf');
				
				this.updatePosition();
				this.draw();
			}
		};
		
		cellsList[id] = cell;
		
	}

	function Cells_update () {
		for ( var i in cellsList ) {
			cellsList[i].update();
		}
	}
	function Cells_FieldResize () {
		for ( var j in cellsList ) {
			cellsList[j].fieldResize();
		}
	}

	function Cells_disabled ( disable=true ) {
		for ( var i in cellsList ) {
			cellsList[i].isDisabled = disable;
		}
	}
	
	
	//Prompt..
	function Prompt (id, x, y, width, height, text, hasCaption=false, floatTime=0 ) {
		
		var prompt = {
			
			id : id,
			x : x,
			y : y,
			width : width,
			height : height,
			text : text,
			floatTime : floatTime,
			counter : 0,
			hasCaption : hasCaption,
			
			fieldResize : function () {

				var oldWidth = myGame.canvasSize.width;
				var oldHeight = myGame.canvasSize.height;
	
				var x_perc = this.x/oldWidth;
				var y_perc = this.y/oldHeight;
	
				var w_perc = this.width/oldWidth;
				var h_perc = this.height/oldHeight;
				
				//update..
				this.x = canvasWidth * x_perc;
				this.y = canvasHeight * y_perc;
	
				this.width = canvasWidth * w_perc;
				this.height = canvasHeight * h_perc;
			},
			draw : function () {
				
				var textx = this.x + this.width/2;
				//var texty = this.y + this.height/2;
					
				var starty = (this.hasCaption) ? this.y + this.height*0.35 : this.y + this.height/2;
				var fontsize = (this.hasCaption) ? this.height * .2 : this.height *.3;
				
				
				$('#game_canvas').drawRect({
					fillStyle: 'rgba(0,0,0,0.75)',
					strokeStyle: '#ccc',
					strokeWidth: 1,
					x: this.x, y: this.y,
					width: this.width,
					height: this.height,
					cornerRadius : this.height * 0.1,
					fromCenter : false
				})
				.drawText({
					fillStyle: '#fff',
					x: textx, y: starty,
					fontSize: fontsize,
					fontFamily: 'Verdana, sans-serif',
					text: this.text
				});
				
			},
			updatePosition : function () {
				
				if ( this.floatTime > 0 ) {
					
					this.counter += 1;
					if ( this.counter % 25 == 0 ) {
						this.floatTime += -1;
						if ( this.floatTime == 0 ) delete promptList[this.id];
					}
				}
			},
			update : function () {
				this.updatePosition();
				this.draw();
			}
			
		}
		
		promptList [id] = prompt;

	} 

	function Prompt_update () {
		for ( var i in promptList ) {
			promptList[i].update();
		}
	}
	function Prompt_FieldResize () {
		for ( var j in promptList ) {
			promptList[j].fieldResize();
		}
	}

	
	//Button..
	function Button (id, x, y, width, height, text) {
		
		var button = {
			
			id : id,
			x : x +.5,
			y : y + .5,
			width : width,
			height : height,
			text : text,
			isDisabled:false,
			
			fieldResize : function () {

				var oldWidth = myGame.canvasSize.width;
				var oldHeight = myGame.canvasSize.height;
	
				var x_perc = this.x/oldWidth;
				var y_perc = this.y/oldHeight;
	
				var w_perc = this.width/oldWidth;
				var h_perc = this.height/oldHeight;
				
				//update..
				this.x = canvasWidth * x_perc;
				this.y = canvasHeight * y_perc;
	
				this.width = canvasWidth * w_perc;
				this.height = canvasHeight * h_perc;
			},
			click : function () {
				if (!this.isDisabled) btnIsClicked(this.id);
			},
			draw : function () {
				
				var txtColor = (this.isDisabled) ? '#ccc' : '#333';
				
				var shade = (this.isDisabled) ? '#ccc' : '#999';
				
				var brder = (this.isDisabled) ? '#ccc' : '#000';
				
				var linear = $('#game_canvas').createGradient({
					x1: this.x, y1: this.y + this.height*0.1,
					x2: this.x, y2: this.y + this.height*0.8,
					c1: '#fff',
					c2: shade
				});
				
				var textx = this.x + this.width/2;
				var texty = this.y + this.height/2;
					
				
				
				$('#game_canvas').drawRect({
					fillStyle: linear,
					strokeStyle : brder,
					strokeWidth : 1,
					shadowColor: '#999',
					shadowBlur: 5,
					shadowX: 2, shadowY: 2,
					x: this.x, y: this.y,
					width: this.width,
					height: this.height,
					cornerRadius : this.height/2,
					fromCenter : false
				})
				.drawText({
					fillStyle: txtColor,
					x: textx, y: texty,
					shadowColor: '#fff',
					shadowBlur: 2,
					shadowX: 1, shadowY: 1,
					fontSize: this.height * 0.5,
					fontStyle : 'bold',
					fontFamily: 'Verdana, sans-serif',
					text: this.text
				});
			},
			updatePosition : function () {
				
			},
			update : function () {
				this.updatePosition();
				this.draw();
			}
			
		}
		
		buttonList[id] = button;

	}

	function Button_update () {
		for ( var i in buttonList ) {
			buttonList[i].update();
		}
	}
	
	function Button_FieldResize () {
		for ( var j in buttonList ) {
			buttonList[j].fieldResize();
		}
	}

	function Button_disabled ( disable=true ) {
		for ( var i in buttonList ) {
			buttonList[i].isDisabled = disable;
		}
	}
	
	
	//TextFields..
	function TextFields ( id, x, y, width, height, text ) {
		
		var txtField = {
			
			id : id,
			x : x +.5,
			y : y + .5,
			width : width,
			height : height,
			text : text,
			counter : 0,
			
			fieldResize : function () {

				var oldWidth = myGame.canvasSize.width;
				var oldHeight = myGame.canvasSize.height;
	
				var x_perc = this.x/oldWidth;
				var y_perc = this.y/oldHeight;
	
				var w_perc = this.width/oldWidth;
				var h_perc = this.height/oldHeight;
				
				//update..
				this.x = canvasWidth * x_perc;
				this.y = canvasHeight * y_perc;
	
				this.width = canvasWidth * w_perc;
				this.height = canvasHeight * h_perc;
			},
			reset : function () {
				this.startBlink = false;
				this.toBlink = false;
				this.counter = 0;
				this.text = "00:00:00";
			},
			click : function () {
				//..
			},
			blink : function () {
				this.startBlink = true;
				this.counter = 0;
			},
			updatePosition : function () {
				if ( this.startBlink ) {
					if ( this.counter%5==0) this.toBlink = !this.toBlink;
					this.counter+=1;
				}
			},
			draw : function () {
				
				var bgColor = (this.toBlink) ? '#0f0' : '#fff';
				
				$('#game_canvas').drawRect({
					fillStyle: bgColor,
					strokeStyle : '#000',
					strokeWidth : 1,
					shadowColor: '#999',
					shadowBlur: 5,
					shadowX: 2, shadowY: 2,
					x: this.x, y: this.y,
					width: this.width,
					height: this.height,
					cornerRadius : this.height/2,
					fromCenter : false
				})
				.drawText({
					fillStyle: '#000',
					x: this.x + this.width/2,
					y: this.y + this.height/2,
					fontSize: this.height * 0.8,
					fontStyle : 'bold',
					fontFamily: 'Verdana, sans-serif',
					text: this.text
				});
				
				
			},
			
			update : function () {
				this.updatePosition();
				this.draw();
			}
			
		}
		
		txtFieldList [id] = txtField;

	}
	
	function TextFields_update () {
		for ( var i in txtFieldList ) {
			txtFieldList[i].update();
		}
	}
	function TextFields_FieldResize () {
		for ( var j in txtFieldList ) {
			txtFieldList[j].fieldResize();
		}
	}
	
	
	//End Image
	function EndImage ( id, x, y, width, height, imgScale ) {
		
		var endImage = {
			
			id : id,
			x : x +.5,
			y : y + .5,
			width : width,
			height : height,
			imgScale : imgScale,
			
			fieldResize : function () {

				var oldWidth = myGame.canvasSize.width;
				var oldHeight = myGame.canvasSize.height;
	
				var x_perc = this.x/oldWidth;
				var y_perc = this.y/oldHeight;
	
				var w_perc = this.width/oldWidth;
				var h_perc = this.height/oldHeight;
				
				//update..
				this.x = canvasWidth * x_perc;
				this.y = canvasHeight * y_perc;
	
				this.width = canvasWidth * w_perc;
				this.height = canvasHeight * h_perc;
			},
			updatePosition : function () {
				////console.log ( 'img', img  );
			},
			draw : function () {
				$('#game_canvas').drawImage({
					source: img['image'+myGame.img],
					x: this.x + this.width/2, 
					y: this.y + this.height/2,
					scale : this.imgScale,
				}).
				drawRect ({
					strokeStyle : '#ccc',
					strokeWidth : 1,
					x : this.x,
					y : this.y,
					width : this.width,
					height : this.height,
					fromCenter : false
				});
			},
			
			update : function () {
				this.updatePosition();
				this.draw();
			}
		}
		
		endImageList[id] = endImage;
	}
	
	function EndImage_update () {
		for ( var i in endImageList ) {
			endImageList[i].update();
		}
	}
	function EndImage_FieldResize () {
		for ( var j in endImageList ) {
			endImageList[j].fieldResize();
		}
	}
	
});

