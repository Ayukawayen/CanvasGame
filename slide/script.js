var Slide = {
	src:null,
	ctx:null,
	bufCtx:null,
	
	canvasWidth:640,
	canvasHeight:360,
	
	blockWidth:128,
	blockHeight:120,
	
	colCount:5,
	rowCount:3,
	
	matrix:[],
	block:{"col":0,"row":0},
	blockLineWidth:1,
	point:{"col":0,"row":0},
	
	levels:[
		[4,2],[5,3],[7,4],[9,5],[10,6],[12,7],[14,8],[16,9],
	],
	
	setLevel:function(level) {
		if(this.levels[level]) {
			this.colCount=this.levels[level][0];
			this.rowCount=this.levels[level][1];
		}
		
		this.blockWidth = (this.canvasWidth/this.colCount);
		this.blockHeight = (this.canvasHeight/this.rowCount);
	},
	init:function(src, ctx, level) {
		if(level==null) {
			level=1;
		}
		this.setLevel(level);
		
		this.src = src;
		this.ctx = ctx;
		
		this.ctx.fillStyle="#333";
		this.ctx.fillRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);
		
		this.bufCtx = document.createElement("canvas").getContext("2d");
		this.bufCtx.canvas.width = this.canvasWidth;
		this.bufCtx.canvas.height = this.canvasHeight;
		this.bufCtx.lineWidth = 2;
		this.blockLineWidth = Math.ceil(Math.min(this.blockWidth, this.blockHeight)/100);
		
//document.querySelector("#gameArea").appendChild(this.bufCtx.canvas);

		for(var c=0;c<this.colCount;++c) {
			this.matrix[c] = [];
			for(var r=0;r<this.rowCount;++r) {
				this.matrix[c][r] = {"col":c,"row":r};
			}
		}
		
		this.block.col = this.point.col = Math.floor(Math.random()*this.colCount)%this.colCount;
		this.block.row = this.point.row = Math.floor(Math.random()*this.rowCount)%this.rowCount;
		
		this.moveTo({"col":Math.floor(this.colCount*0.1), "row":Math.floor(this.rowCount*0.1)});
		this.shuffle(this.colCount*this.rowCount);
		this.moveTo({"col":Math.floor(this.colCount*0.1), "row":Math.floor(this.rowCount*0.9)});
		this.shuffle(this.colCount*this.rowCount);
		this.moveTo({"col":Math.floor(this.colCount*0.9), "row":Math.floor(this.rowCount*0.9)});
		this.shuffle(this.colCount*this.rowCount);
		this.moveTo({"col":Math.floor(this.colCount*0.9), "row":Math.floor(this.rowCount*0.1)});
		this.shuffle(this.colCount*this.rowCount);
		this.moveTo({"col":Math.floor(this.colCount*0.5), "row":Math.floor(this.rowCount*0.5)});
		this.shuffle(this.colCount*this.rowCount);
	},
	shuffle:function(count) {
		for(var i=0;i<count;++i) {
			var r = Math.floor(Math.random()*4);
			for(var d=0;d<4;++d) {
				var direct = ((r+d)%4+1)*2;
				if(this.move(direct)) {
					break;
				}
			}
		}
	},
	moveTo:function(point) {
		while(this.point.col < point.col) {
			this.move(4);
		}
		while(this.point.col > point.col) {
			this.move(6);
		}
		while(this.point.row < point.row) {
			this.move(8);
		}
		while(this.point.row > point.row) {
			this.move(2);
		}
	},
	move:function(direct) {
		var originPoint = {"col":this.point.col,"row":this.point.row};
		if(direct == 2) {
			if(this.point.row <= 0) {
				return false;
			}
			--this.point.row;
		}
		else if(direct == 8) {
			if(this.point.row >= this.rowCount-1) {
				return false;
			}
			++this.point.row;
		}
		else if(direct == 4) {
			if(this.point.col >= this.colCount-1) {
				return false;
			}
			++this.point.col;
		}
		else if(direct == 6) {
			if(this.point.col <= 0) {
				return false;
			}
			--this.point.col;
		}
		
		this.matrix[originPoint.col][originPoint.row].col = this.matrix[this.point.col][this.point.row].col;
		this.matrix[originPoint.col][originPoint.row].row = this.matrix[this.point.col][this.point.row].row;
		
		this.matrix[this.point.col][this.point.row].col = this.block.col;
		this.matrix[this.point.col][this.point.row].row = this.block.row;
		
		return true;
	},
	validate:function() {
		for(var c=0;c<this.colCount;++c) {
			for(var r=0;r<this.rowCount;++r) {
				if(this.matrix[c][r].col != c || this.matrix[c][r].row != r) {
					return false;
				}
			}
		}
		return true;
	},
	draw: function() {
		if(!this.src || !this.ctx) {
			return;
		}
		
		this.bufCtx.drawImage(this.src, 0, 0, this.bufCtx.canvas.width,this.bufCtx.canvas.height);
		
		this.ctx.lineWidth = 2;
		this.ctx.strokeStyle = "rgba(255,255,255,0.75)";
		this.ctx.fillStyle = "#333";
		
		for(var c=0;c<this.colCount;++c) {
			for(var r=0;r<this.rowCount;++r) {
				if(c == this.point.col && r == this.point.row) {
					this.ctx.fillRect(
						Math.floor(c*this.blockWidth),
						Math.floor(r*this.blockHeight),
						Math.floor(this.blockWidth),
						Math.floor(this.blockHeight)
					);
					
					continue;
				}
				
				var iData = this.bufCtx.getImageData(
					Math.floor(this.matrix[c][r].col*this.blockWidth)+this.blockLineWidth,
					Math.floor(this.matrix[c][r].row*this.blockHeight)+this.blockLineWidth,
					Math.floor(this.blockWidth)-this.blockLineWidth*2,
					Math.floor(this.blockHeight)-this.blockLineWidth*2
				);
				
				this.ctx.putImageData(
					iData,
					Math.floor(c*this.blockWidth)+this.blockLineWidth,
					Math.floor(r*this.blockHeight)+this.blockLineWidth
				);
				
				this.ctx.strokeRect(
					Math.floor(c*this.blockWidth)+this.blockLineWidth+1,
					Math.floor(r*this.blockHeight)+this.blockLineWidth+1,
					Math.floor(this.blockWidth)-this.blockLineWidth*2-2,
					Math.floor(this.blockHeight)-this.blockLineWidth*2-2
				);
			}
		}
	},
};
