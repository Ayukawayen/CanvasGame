var Rand = {
	"M":0x7fffffff,
	"A":1103515245,
	"C":12345,
	
	value:1,
	setSeed:function(seed) {
		this.value = seed;
	},
	random:function() {
		this.value = ((this.A*this.value)+this.C)%this.M;
		
		return this.value/this.M;
	},
}
