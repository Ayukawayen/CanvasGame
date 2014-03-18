var Slide = {
	src:null,
	ctx:null,
	bufCtx:null,
	
	clientWidth:640,
	clientHeight:360,
	
	blockWidth:128,
	blockHeight:120,
	
	width:5,
	height:3,
	
	matrix:[],
	block:{"x":0,"y":0},
	blockLineWidth:1,
	point:{"x":0,"y":0},
	
	levels:[
		[4,2],[5,3],[7,4],[9,5],[10,6],[12,7],[14,8],[16,9],
	],
	
	setLevel:function(level) {
		if(this.levels[level]) {
			this.width=this.levels[level][0];
			this.height=this.levels[level][1];
		}
		
		this.blockWidth = (this.clientWidth/this.width);
		this.blockHeight = (this.clientHeight/this.height);
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
		this.bufCtx.canvas.width = this.clientWidth;
		this.bufCtx.canvas.height = this.clientHeight;
		this.bufCtx.lineWidth = 2;
		this.blockLineWidth = Math.ceil(Math.min(this.blockWidth, this.blockHeight)/100);
		
//document.querySelector("#gameArea").appendChild(this.bufCtx.canvas);

		for(var x=0;x<this.width;++x) {
			this.matrix[x] = [];
			for(var y=0;y<this.height;++y) {
				this.matrix[x][y] = {"x":x,"y":y};
			}
		}
		
		this.block.x = this.point.x = Math.floor(Math.random()*this.width);
		this.block.y = this.point.y = Math.floor(Math.random()*this.height);
		
		this.moveTo({"x":Math.floor(this.width*0.1), "y":Math.floor(this.height*0.1)});
		this.shuffle(this.width*this.height);
		this.moveTo({"x":Math.floor(this.width*0.1), "y":Math.floor(this.height*0.9)});
		this.shuffle(this.width*this.height);
		this.moveTo({"x":Math.floor(this.width*0.9), "y":Math.floor(this.height*0.9)});
		this.shuffle(this.width*this.height);
		this.moveTo({"x":Math.floor(this.width*0.9), "y":Math.floor(this.height*0.1)});
		this.shuffle(this.width*this.height);
		this.moveTo({"x":Math.floor(this.width*0.5), "y":Math.floor(this.height*0.5)});
		this.shuffle(this.width*this.height);
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
		while(this.point.x < point.x) {
			this.move(4);
		}
		while(this.point.x > point.x) {
			this.move(6);
		}
		while(this.point.y < point.y) {
			this.move(8);
		}
		while(this.point.y > point.y) {
			this.move(2);
		}
	},
	move:function(direct) {
		var originPoint = {"x":this.point.x,"y":this.point.y};
		if(direct == 2) {
			if(this.point.y <= 0) {
				return false;
			}
			--this.point.y;
		}
		else if(direct == 8) {
			if(this.point.y >= this.height-1) {
				return false;
			}
			++this.point.y;
		}
		else if(direct == 4) {
			if(this.point.x >= this.width-1) {
				return false;
			}
			++this.point.x;
		}
		else if(direct == 6) {
			if(this.point.x <= 0) {
				return false;
			}
			--this.point.x;
		}
		
		this.matrix[originPoint.x][originPoint.y].x = this.matrix[this.point.x][this.point.y].x;
		this.matrix[originPoint.x][originPoint.y].y = this.matrix[this.point.x][this.point.y].y;
		
		this.matrix[this.point.x][this.point.y].x = this.block.x;
		this.matrix[this.point.x][this.point.y].y = this.block.y;
		
		return true;
	},
	validate:function() {
		for(var x=0;x<this.width;++x) {
			for(var y=0;y<this.height;++y) {
				if(this.matrix[x][y].x != x || this.matrix[x][y].y != y) {
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
		
		for(var x=0;x<this.width;++x) {
			for(var y=0;y<this.height;++y) {
				if(x == this.point.x && y == this.point.y) {
					this.ctx.fillRect(
						Math.floor(x*this.blockWidth),
						Math.floor(y*this.blockHeight),
						Math.floor(this.blockWidth),
						Math.floor(this.blockHeight)
					);
					
					continue;
				}
				
				var iData = this.bufCtx.getImageData(
					Math.floor(this.matrix[x][y].x*this.blockWidth)+this.blockLineWidth,
					Math.floor(this.matrix[x][y].y*this.blockHeight)+this.blockLineWidth,
					Math.floor(this.blockWidth)-this.blockLineWidth*2,
					Math.floor(this.blockHeight)-this.blockLineWidth*2
				);
				
				this.ctx.putImageData(
					iData,
					Math.floor(x*this.blockWidth)+this.blockLineWidth,
					Math.floor(y*this.blockHeight)+this.blockLineWidth
				);
				
				this.ctx.strokeRect(
					Math.floor(x*this.blockWidth)+this.blockLineWidth+1,
					Math.floor(y*this.blockHeight)+this.blockLineWidth+1,
					Math.floor(this.blockWidth)-this.blockLineWidth*2-2,
					Math.floor(this.blockHeight)-this.blockLineWidth*2-2
				);
			}
		}
	},
};
