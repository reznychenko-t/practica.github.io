console.clear();

let data = {
	state: 'running',
	figuresAll: [
		{name: 'line', points: [[0,0], [1,0], [2,0], [3,0],], mode: '90', color: '#0f0',},
		{name: 'box', points: [[0,0], [0,1], [1,0], [1,1],], mode: 'frozen', color: '#080',},
		{name: 'T', points: [[0,0], [1,0], [2,0], [1,1],], mode: 'rot', anchor: [1,0], color: '#8f0',},
		{name: 'dog', points: [[0,0], [1,0], [1,1], [2,1],], mode: '90', color: '#f80',},
		{name: 'dog reverse', points: [[0,1], [1,1], [1,0], [2,0],], mode: '90', color: '#f80',},
		{name: 'L', points: [[0,0], [0,1], [0,2], [1,2],], mode: 'rot', color: '#ff0',},
		{name: 'L reverse', points: [[1,0], [1,1], [1,2], [0,2],], mode: 'rot', color: '#ff0',},
		// http://old.absolutist.com/tetris/tetris.html
		{name: 'L', points: [[0,0],[0,1],[0,2],[1,2],[2,2],], mode: 'rot', color: '#afa', disabled: true,},
		{name: 'T', points: [[0,0],[1,0],[2,0],[1,1],[1,2],], mode: 'rot', color: '#afa', disabled: true,},
		{name: 'W', points: [[2,0],[1,1],[2,1],[0,2],[1,2],], mode: 'rot', color: '#afa', disabled: true,},
		{name: 'X', points: [[1,0],[0,1],[1,1],[2,1],[1,2],], mode: 'rot', color: '#afa', disabled: true,},
		{name: 'U', points: [[0,1],[1,1],[2,1],[0,0],[2,0],], mode: 'rot', color: '#afa', disabled: true,},
		{name: 'Z', points: [[0,0],[1,0],[1,1],[1,2],[2,2],], mode: 'rot', color: '#afa', disabled: true,},
		{name: 'F', points: [[1,0],[2,0],[0,1],[1,1],[1,2],], mode: 'rot', color: '#afa', disabled: true,},
		{name: 'P', points: [[0,0],[1,0],[0,1],[1,1],[0,2]], mode: 'rot', color: '#afa', disabled: true,},
		{name: 'I', points: [[0,0],[0,1],[0,2],[0,3],[0,4],], mode: 'rot', color: '#afa', disabled: true,},
		{name: 'N', points: [[0,0],[0,1],[1,0],[1,1],[0,2],[0,3],], mode: 'rot', color: '#afa', disabled: true,},
		{name: 'Y', points: [[0,1],[1,0],[1,1],[1,2],[1,3],], mode: 'rot', color: '#afa', disabled: true,},
		{name: 'L', points: [[0,0],[0,1],[0,2],[0,3],[1,3],], mode: 'rot', color: '#afa', disabled: true,},
		{name: 'creeper', points: [[1,1], [1,2], [2,1], [2,2],[0,0,'#f00'],[3,0,'#f00'],], mode: 'explode', color: '#f80', disabled: false,},
		{name: 'point', points: [[0,0],], mode: 'ball', color: '#88f', disabled: false,},
		{name: 'heart', points: [[0,0], [0,1], [1,1], [1,2], [2,1], [2,0],], mode: 'rot', color: '#f00', disabled: true,},
	],
	figures: [],
	passThrough: false,
	speedup: false,
	speed: 5,
	score: 0,
	highScore: 0,
	board: [],
	preview: [],
	brickSize: 24,
	emptyColor: '#000',
};

let methods = {
	toggleFigures(e){
		for(let f of this.figuresAll)
			f.disabled = e.target.checked;
	},
	pause(){
		switch(this.state){
			case 'pause':
				this.state = 'running';
				this.calcSpeed();
				break;
			case 'running':
				this.state = 'pause';
				this.calcSpeed();
				break;
										 }
	},
	initBoard(){
		this.board.length = this.board.w * this.board.h;
		for(let i=0; i<this.board.length; ++i)
			this.board[i] = this.emptyColor;
		//this.testBallBoard();
	},
	testBallBoard(){
		for(let y=this.board.h-1; y>5; y--){
			for(let x=0; x<this.board.w; ++x)
				if(x!==5)
					this.board[x + y*this.board.w] = '#080';
		}
		this.board[4 + 5*this.board.w] = '#080';
		this.board[5 + 5*this.board.w] = '#080';
		this.board[6 + 5*this.board.w] = '#080';
		this.board[7 + 5*this.board.w] = '#080';
	},
	initPreview(){
		this.preview.length = this.preview.w * this.preview.h;
		for(let i=0; i<this.preview.length; ++i)
			this.preview[i] = this.emptyColor;
	},
	initFigures(){
		for(let figure of this.figuresAll){
			let [x,y] = [0,0];
			if( !figure.anchor ){
				for(let t of figure.points){
					x = Math.max(x, t[0]);
					y = Math.max(y, t[1]);
				}
				figure.anchor = [x/2, y/2];
			}
			switch(figure.mode){
				case 'ball':
				case 'explode':
				case 'frozen':
					figure.pointsRotated = [figure.points, figure.points, figure.points, figure.points];
					break;
				case 'rot':
					figure.pointsRotated = [];
					figure.pointsRotated.push(figure.points.map(p=>[
						Math.round(figure.anchor[0]+(p[0]-figure.anchor[0])),
						Math.round(figure.anchor[1]+(p[1]-figure.anchor[1])),
					]));
					figure.pointsRotated.push(figure.points.map(p=>[
						Math.round(figure.anchor[0]-(p[1]-figure.anchor[1])),
						Math.round(figure.anchor[1]+(p[0]-figure.anchor[0])),
					]));
					figure.pointsRotated.push(figure.points.map(p=>[
						Math.round(figure.anchor[0]-(p[0]-figure.anchor[0])),
						Math.round(figure.anchor[1]-(p[1]-figure.anchor[1])),
					]));
					figure.pointsRotated.push(figure.points.map(p=>[
						Math.round(figure.anchor[0]+(p[1]-figure.anchor[1])),
						Math.round(figure.anchor[1]-(p[0]-figure.anchor[0])),
					]));
					break;
				case '90':
					figure.pointsRotated = [];
					figure.pointsRotated.push(figure.points.map(p=>[
						figure.anchor[0]+(p[0]-figure.anchor[0]),
						figure.anchor[1]+(p[1]-figure.anchor[1]),
					]));
					figure.pointsRotated.push(figure.points.map(p=>[
						figure.anchor[1]-(p[1]-figure.anchor[1]),
						figure.anchor[0]+(p[0]-figure.anchor[0]),
					]));
					break;
				default:
					throw 'unknown figure rotation mode: '+figure.mode;
												}
		}
	},
	setFigureToMap(map, figure, preview=false){
		let [x, y] = preview
		? [
			-figure.figure.anchor[0]+map.w/2|0,
			-figure.figure.anchor[1]+map.h/2|0
		]
		: [figure.pos[0], figure.pos[1]];

		for(let p of figure.figure.pointsRotated[figure.rotate]){
			let px = x + p[0];
			let py = y + p[1];
			if(px >= 0 && px < map.w && py >= 0 && py < map.h)
				map[px + py*map.w] = p[2] || figure.color;
		}
	},
	unsetFigureFromMap(map, figure, preview=false){
		let [x, y] = preview
		? [
			-figure.figure.anchor[0]+map.w/2|0,
			-figure.figure.anchor[1]+map.h/2|0
		]
		: [figure.pos[0], figure.pos[1]];

		[figure.pos[0], figure.pos[1]];
		for(let p of figure.figure.pointsRotated[figure.rotate]){
			let px = x + p[0];
			let py = y + p[1];
			if(px >= 0 && px < map.w && py >= 0 && py < map.h)
				map[px + py*map.w] = this.emptyColor;
		}
	},
	swapNew(){
		this.passThrough = false;
		this.current = this.next;
		if( this.checkCollide(this.board, this.current) )
			return this.end();
		this.setFigureToMap(this.board, this.current);
		this.$refs.board.update();

		this.unsetFigureFromMap(this.preview, this.next, true);
		this.next = this.genNew()
		this.setFigureToMap(this.preview, this.next, true);
		this.$refs.preview.update();
	},
	genNew(){
		let current = {};
		current.figure = this.figures[
			Math.random()*this.figures.length|0
		];
		current.rotate = 0;
		current.color = current.figure.color ||
			`hsl(${360*Math.random()|0}, 100%, 50%)`;
		current.pos = [this.board.w/2-current.figure.anchor[0]|0, 0];
		return current;
	},
	keydown(e){
		switch(e.which){
			case 'N'.charCodeAt(0):
				this.newGame();
				break;
			case 'P'.charCodeAt(0):
				this.pause();
				break;
			case 65: // left
				this.move(-1);
				break;
			case 68: // right
				this.move(1);
				break;
			case 87: // up
				this.rotate(1);
				break;
			case 83: // down
				if(!e.repeat && this.state === 'running'){
					this.speedup = true;
					this.calcSpeed();
					this.loop();
				}
				break;
									}
	},
	keyup(e){
		switch(e.which){
			case 83: // down
				if(!e.repeat){
					this.speedup = false;
					this.calcSpeed();
				}
				break;
									}
	},
	move(x){
		if( this.state !== 'running' || this.passThrough )
			return;
		this.unsetFigureFromMap(this.board, this.current);
		this.current.pos[0] += x;
		let check = this.checkCollide(this.board, this.current);
		if( check === 0 ){
			this.setFigureToMap(this.board, this.current);
			this.$refs.board.update();
		}else{
			if( check !==2 && this.current.figure.mode === 'explode' )
				return this.explode();
			this.current.pos[0] -= x;
			this.setFigureToMap(this.board, this.current);
		}
	},
	rotate(dir){
		if( this.state !== 'running' )
			return;
		if( this.current.figure.mode === 'explode' )
			return this.explode();
		this.unsetFigureFromMap(this.board, this.current);
		let n = this.current.figure.pointsRotated.length;
		this.current.rotate = (n + (this.current.rotate + dir)) % n;
		let check = this.checkCollide(this.board, this.current);
		if( check === 0 ){
			this.setFigureToMap(this.board, this.current);
			this.$refs.board.update();
		}else{
			this.current.rotate = (n + (this.current.rotate - dir)) % n;
			this.setFigureToMap(this.board, this.current);
		}
	},
	calcSpeed(){
		if( this.intervalId !== null )
			clearInterval( this.intervalId );
		if( this.state === 'running' ){
			let delay = 50 + (1000-50) * (1 - (this.speedup ? 12 : this.speed) / 12);
			this.intervalId = setInterval( this.loop.bind(this), delay );
		}else{
			this.intervalId = null;
		}
	},
	loop(){
		if( !this.passThrough )
			this.unsetFigureFromMap(this.board, this.current);
		this.current.pos[1] += 1;
		let check = this.checkCollide(this.board, this.current);
		if( check === 0 ){
			this.setFigureToMap(this.board, this.current);
			if( this.current.figure.mode === 'ball' ){
				this.passThrough = false;
				this.discardBuilded(this.board);
				this.setFigureToMap(this.board, this.current);
			}
			if(this.$refs.board)
				this.$refs.board.update();
		}else{
			if( this.current.figure.mode === 'explode' )
				return this.explode();
			if( this.current.figure.mode === 'ball' && check === 1 && this.checkDownFree() ){
				this.passThrough = true;
				this.setFigureToMap(this.board, this.current);
				this.$refs.board.update();
				return;
			}
			this.current.pos[1] -= 1;
			this.setFigureToMap(this.board, this.current);
			this.discardBuilded(this.board);
			if(this.$refs.board)
				this.$refs.board.update();

			this.swapNew();

			if( this.speedup ){
				this.speedup = false;
				this.calcSpeed();
			}
		}
	},
	checkDownFree(){
		for(let y=this.current.pos[1]+1; y<this.board.h; ++y)
			if( this.board[this.current.pos[0] + y*this.board.w] === this.emptyColor )
				return true;
		return false;
	},
	end(){
		console.log('end');
		this.highScore = Math.max(this.score, this.highScore);
		this.state = 'end';
		this.calcSpeed();
	},
	checkCollide(map, current){
		for(let t of current.figure.pointsRotated[current.rotate]){
			let x = current.pos[0] + t[0];
			let y = current.pos[1] + t[1];
			if( x<0 || x>=map.w || y<0 || y>=map.h )
				return 2
			if( map[x+y*map.w] !== this.emptyColor ){
				return 1;
			}
		}
		return 0;
	},
	discardBuilded(map){
		for(let y=map.h-1; y>=0; --y){
			let target = y;
			while(target >= 0){
				let n = 0;
				for(let x=0; x<map.w; ++x)
					if( map[x+target*map.w] !== this.emptyColor )
						++n;
				if( n !== map.w )
					break;
				--target;
				++this.score;
			}
			if( target !== y ){
				let sh = y-target;
				for(let j=y; j>=sh; --j){
					for(let x=0; x<map.w; ++x)
						map[x+j*map.w] = map[x+(j-sh)*map.w];
				}
			}
		}
	},
	newGame(){
		this.figures = this.figuresAll.filter(f=>!f.disabled);
		if( !this.figures.length )
			return alert('no figures selected');
		this.board.w = +this.board.w;
		this.board.h = +this.board.h;
		this.state = 'end';
		this.calcSpeed();
		this.initBoard();
		this.initPreview();

		this.highScore = Math.max(this.score, this.highScore);
		this.score = 0;
		this.state = 'running';
		this.current = this.genNew();
		this.setFigureToMap(this.board, this.current);
		this.next = this.genNew();
		this.setFigureToMap(this.preview, this.next, true);
		this.intervalId = null;
		this.calcSpeed();
		this.loop();
	},
	showSettings(){
		this.state = 'settings';
		this.calcSpeed();
	},
	explode(){
		console.log('explode');
		for(let x=0; x<4; ++x){
			for(let y=0; y<4; ++y){
				let xe = x+this.current.pos[0];
				let ye = y+this.current.pos[1];
				if( xe>=0 && xe < this.board.w && ye >=0 && ye < this.board.h )
					this.board[xe + ye*this.board.w] = this.emptyColor;
			}
		}
		this.$refs.board.update();
		this.swapNew();
	},
};

let tetris = new Vue({
	el: '#tetris',
	data,
	methods,
	created(){
		this.board.w = 15;
		this.board.h = 20;
		this.preview.w = 11;
		this.preview.h = 4;
		this.initFigures();
		this.newGame();
	},
	components: {
		tetrisBoard: {
			template: '#tetrisBoard',
			props: ['value'],
			methods: {
				update(){
					this.$forceUpdate();
				},
			},
		},
	},
});

document.querySelector('#tetris').focus();