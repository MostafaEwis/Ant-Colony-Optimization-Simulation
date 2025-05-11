// there will be a grid of dots each dot will have a possibilty 
// of 8 directoins representing the 8 neighboring dots.
// each ant will go from dot to dot laying a phermone on the direction it takes as it goes
// the ants will select a random direction of the 8 depending on the phermone
// for now the ants will be colored red and the dots will be colored green
//TODO:
//I have to create a food source
//when the ants reach the food source it shrinks
//the ant should go back home after food source has been used
let dotD = 20;
let antNum = 100;
let phermone = 100;
let gridLen = 20;
let rate = 0.9
let q = 300
let fps = 60
let decayLimit = 10;
class Dot{
	directions = Array(8).fill(1);
	num;
	pos;
	constructor(x, y, n){
		this.pos = {x, y};
		this.num = n;
	}
	setPos(x, y){
		this.pos.x = x;
		this.pos.y = y;
	}
	setNum(n){
		this.num = n;
	}
	draw(){
		fill('green');
		circle(this.pos.x, this.pos.y, dotD);
	}
}
class Grid{
	dots;
	constructor(len){
		//this is fatal it creates one object and assignes a reference of it to each element of the array
		//it had me banging my head for a while so fuck the statement below
		//this.dots = Array(len).fill(new Dot(0, 0));
		this.dots = Array(len);
		let count = 0;
		for(let y = 1.5 * dotD; y < height; y += height / gridLen){
			for(let x = 1.5 * dotD; x < width; x += width / gridLen) {
				this.dots[count] = new Dot(x, y, count);
				if(count % gridLen == 0){
					this.dots[count].directions[0] = 0;
					this.dots[count].directions[6] = 0;
					this.dots[count].directions[7] = 0;
				}
				if(count < gridLen){
					this.dots[count].directions[0] = 0;
					this.dots[count].directions[1] = 0;
					this.dots[count].directions[2] = 0;
				}
				if(count % (gridLen - 1) == 0 && count != 0){
					this.dots[count].directions[2] = 0;
					this.dots[count].directions[3] = 0;
					this.dots[count].directions[4] = 0;
				}
				if(count >= gridLen ** 2 - 1 - gridLen && count <= gridLen ** 2 - 1){
					this.dots[count].directions[4] = 0;
					this.dots[count].directions[5] = 0;
					this.dots[count].directions[6] = 0;
				}
				count++;
			}
		}
	}
	getRC(n){
		let r = parseInt(n / gridLen);
		let c = n % gridLen;
		return {r, c};
	}
	getN(r, c){
		let n = r * gridLen + c;
		return n;
	}
	draw(){
		this.dots.forEach(dot => dot.draw());
	}
	decay(){
		this.dots.forEach(dot => dot.directions.forEach((dir, i) => {
			if(dir > decayLimit){
				dot.directions[i] = dir * rate;
			}

		}));
	}
	drawRelation(){
		for(let i = 0; i < this.dots.length; i++){
			let {r, c} = this.getRC(i);
			stroke('purple');
			if(r + 1 < gridLen){
				strokeWeight(map(this.dots[i].directions[5], 0, 200, 0.1, 3));
				line(this.dots[i].pos.x, this.dots[i].pos.y, 
					this.dots[this.getN(r + 1, c)].pos.x, this.dots[this.getN(r + 1, c)].pos.y);
			}
			if(c + 1 < gridLen){
				strokeWeight(map(this.dots[i].directions[3], 0, 200, 0.1, 3));
				line(this.dots[i].pos.x, this.dots[i].pos.y, 
					this.dots[this.getN(r, c + 1)].pos.x, this.dots[this.getN(r, c + 1)].pos.y);
			}
			if(c + 1 < gridLen && r + 1 < gridLen){
				strokeWeight(map(this.dots[i].directions[4], 0, 200, 0.1, 3));
				line(this.dots[i].pos.x, this.dots[i].pos.y, 
					this.dots[this.getN(r + 1, c + 1)].pos.x, this.dots[this.getN(r + 1, c + 1)].pos.y);
			}
			if(c - 1 < gridLen && r + 1 < gridLen){
				strokeWeight(map(this.dots[i].directions[6], 0, 200, 0.1, 3));
				line(this.dots[i].pos.x, this.dots[i].pos.y, 
					this.dots[this.getN(r + 1, c - 1)].pos.x, this.dots[this.getN(r + 1, c - 1)].pos.y);
			}
		}
	}
}
class Ant{
	currentNum;
	currentPath = [];
	gridRef;
	foundFood = true;
	constructor(n, gridRef){
		this.currentNum = n;
		this.gridRef = gridRef;
	}
	pickDir(){
		//console.log(this.gridRef.dots[this.currentNum].directions);
		//divide each phermone by the sum of all directions phermones(cumulative sum)
		//calculate a random number
		//choose the first direction which is greater than the the number
		let probs = []
		let cum = []
		let sum = this.gridRef.dots[this.currentNum].directions.reduce((a, b) => a + b, 0);
		for(let i = 0; i < 8; i++){
			let dir = this.gridRef.dots[this.currentNum].directions[i];
			if(dir > 0){
				probs.push(dir / sum);
			}else{
				probs.push(0);
			}
		}
		for(let i = 0; i < probs.length; i++){
			if(cum.length == 0)
				cum.push(probs[i]);
			else
				cum.push(cum[cum.length - 1] + probs[i]);

		}
		//012
		//345
		//678
		//console.log(cum);
		let randomNum = random();
		//console.log("rand: ", randomNum);
		let dir;
		let i = 0;
		while(i < cum.length){
			if(randomNum < cum[i]){
				while(this.gridRef.dots[this.currentNum].directions[i] == 0){
					i--;
				}
				dir = i;

				break;
			}
			i++;
		}
		return dir;
	}
	move(){
		let dir = this.pickDir();
		//choosing the next cell part
		let r = parseInt(this.currentNum / gridLen);
		let c = this.currentNum % gridLen;
		//console.log("r, c, n: ", r, c, this.currentNum);
		//0------1------2
		//|		|
		//|		|
		//7	 .	3
		//|		|
		//|		|
		//6------5------4
		if(dir == 0){
			r--;
			c--;
		}else if(dir == 1){
			r--;
		}else if(dir == 2){
			r--;
			c++;
		}else if(dir == 3){
			c++;
		}else if(dir == 4){
			r++;
			c++;
		}else if(dir == 5){
			r++;
		}else if(dir == 6){
			r++;
			c--;
		}else if(dir == 7){
			c--;
		}
		this.currentPath.push([this.currentNum, dir]);
		this.currentNum = r * gridLen + c;	
		if(this.foundFood){
			if(r <= gridLen - 1 && r >= gridLen - 3 && c <= gridLen - 1 && c >= gridLen - 3){
				this.currentPath.forEach(arr =>{
					this.layPhermone(arr[0], arr[1]);
				})
				this.currentPath = [];
				this.foundFood = false;
				this.gridRef.decay();
			}
		}else{
			if(r <= 2 && r >= 0 && c <= 2 && c >= 0){
				this.currentPath.forEach(arr =>{
					this.layPhermone(arr[0], arr[1]);
				})
				this.currentPath = [];
				this.foundFood = true;
				this.gridRef.decay();
			}
		}
		//console.log("r, c, n: ", r, c, this.currentNum);

	}
	layPhermone(n, dir){
		this.gridRef.dots[n].directions[dir] += q / this.currentPath.length * phermone;
	}
	draw(){
		noStroke();
		fill('red');
		circle(this.gridRef.dots[this.currentNum].pos.x,
			this.gridRef.dots[this.currentNum].pos.y,
			0.6 * dotD);
		//image(img, this.gridRef.dots[this.currentNum].pos.x,
		//	this.gridRef.dots[this.currentNum].pos.y,
		//	20, 20);
	
	}
}
class Colony{
	ants = [];
	constructor(gridRef){
		for(let i = 0; i < antNum; i++){
			this.ants[i] = new Ant(0, gridRef);
		}
	}
	draw(){
		this.ants.forEach(ant => ant.draw());
	}
	induce(){
		this.ants.forEach(ant => ant.move());
	}
}
let colony;
let grid;
let img;
function preload(){
}
function setup() {
	createCanvas(700, 700);
	grid = new Grid(gridLen ** 2);
	colony = new Colony(grid);
}
function draw() {
	background("pink");
	stroke('purple');
	//grid.draw();
	grid.drawRelation();
	fill('yellow');
	circle(width - gridLen * 3, height - gridLen * 3, gridLen * 5);
	fill('green');
	circle(gridLen * 3, gridLen * 3, gridLen * 5);
	colony.draw();
	if(!mouseIsPressed)
		colony.induce();
	frameRate(fps);
}
