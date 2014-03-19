var CORS_SITES = [
	{
		"name":"Wikimedia Commons",
		"url":"http://commons.wikimedia.org",
		"example":"http://upload.wikimedia.org/*",
		"types":{"image":true,"video":true},
	},
	{
		"name":"imgur",
		"url":"http://imgur.com",
		"example":"http://imgur.com/*",
		"types":{"image":true,"video":false},
	},
	{
		"name":"Google+",
		"url":"https://plus.google.com",
		"example":"https://lh6.googleusercontent.com/*",
		"types":{"image":true,"video":false},
	},
	{
		"name":"Google Drive",
		"url":"https://drive.google.com/",
		"example":"https://googledrive.com/host/*",
		"types":{"image":true,"video":true},
	},
	{
		"name":"Blogger",
		"url":"https://www.blogger.com",
		"example":"http://3.bp.blogspot.com/*",
		"types":{"image":true,"video":false},
	},
];

var gSourceSetting = {
	"type":"video",
	"url":"http://upload.wikimedia.org/wikipedia/commons/transcoded/e/e7/Cheetahs_on_the_Edge_%28Director%27s_Cut%29.webm/Cheetahs_on_the_Edge_%28Director%27s_Cut%29.webm.360p.webm",
};
var gLevel = 1;

var gSourceHints = {
	"image":"",
	"video":"",
};

var gTimeout = null;

var srcNode = null;
var ctx = document.querySelector("#gameCanvas").getContext("2d");

var startTime = 0;
var stepCount = 0;

var direct = null;

var gParams = getParams(location.hash);

init();


function init() {
	loadParams();
	
	document.querySelector("#controlSettingSource input[name=controlSettingType][value="+gSourceSetting.type+"]").checked = true;
	document.querySelector("#controlSettingURL").value = gSourceSetting.url;
	document.querySelector("#controlSettingLevel").value = gLevel;
	onControlSourceTypeChange(gSourceSetting.type);
	
	for(var i=0;i<CORS_SITES.length;++i) {
		var site = CORS_SITES[i];
		
		var text = i<=0 ? '' : ', ';
		text += '<a';
		text += ' href="'+site.url+'"';
		text += ' target="_blank"';
		text += ' title="Ex: '+site.example+'"';
		text += '>';
		
		text += site.name;
		
		text += '</a>';
		
		if(site.types["image"]) {
			gSourceHints["image"] += text;
		}
		if(site.types["video"]) {
			gSourceHints["video"] += text;
		}
	}
	document.querySelector("#controlSettingHintSites").innerHTML = gSourceHints[gSourceSetting.type];
	
	var nodes = document.querySelectorAll("#controlSettingSource input[name=controlSettingType]");
	for(var i=0;i<nodes.length;++i) {
		nodes[i].onclick = function(){
			onControlSourceTypeChange(this.value);
		}
	}
	
	
	document.querySelector("#gameCanvas").onclick = function(e) {
		var x = e.pageX-e.target.offsetLeft;
		var y = e.pageY-e.target.offsetTop;
		
		var c = Math.floor(x/Slide.blockWidth);
		var r = Math.floor(y/Slide.blockHeight);

		if(c == Slide.point.col) {
			if(r == Slide.point.row-1) {
				direct=2;
			}
			else if(r == Slide.point.row+1) {
				direct=8;
			}
		}
		else if(r == Slide.point.row) {
			if(c == Slide.point.col-1) {
				direct=6;
			}
			else if(c == Slide.point.col+1) {
				direct=4;
			}
		}
	}
	document.querySelector("html").onkeyup = function(e) {
		if(e.keyCode == 37) {
			direct=4;
		}
		else if(e.keyCode == 38) {
			direct=8;
		}
		else if(e.keyCode == 39) {
			direct=6;
		}
		else if(e.keyCode == 40) {
			direct=2;
		}
		
		e.stopPropagation();
	};

	if(gParams["video"] || gParams["image"]) {
		onControlSubmitClick();
	}
}

function loadParams() {
	if(gParams["level"] != null) {
		gLevel = Math.floor(gParams["level"]);
	}
	
	if(gParams["video"]) {
		gSourceSetting.type = "video";
		gSourceSetting.url = decodeURIComponent(gParams["video"]);
	}
	else if(gParams["image"]) {
		gSourceSetting.type = "image";
		gSourceSetting.url = decodeURIComponent(gParams["image"]);
	}
}

function onControlSourceTypeChange(value) {
	gSourceSetting.type = value;
	
	document.querySelector("#controlSettingHintSites").innerHTML = gSourceHints[gSourceSetting.type];
	if(gSourceSetting.type == "image") {
		document.querySelector("#controlSettingHintType").innerHTML = "圖片";
	}
	else if(gSourceSetting.type == "video") {
		document.querySelector("#controlSettingHintType").innerHTML = "影片";
	}
}

function onControlSubmitClick() {
	reset();
	
	gLevel = document.querySelector("#controlSettingLevel").value;
	
	gSourceSetting.url = document.querySelector("#controlSettingURL").value;
	
	postSourceNode();
	
	location.hash = "#"+gSourceSetting.type+"="+encodeURIComponent(gSourceSetting.url)+"&level="+gLevel;
	
	document.querySelector("#headerControl").className = "closed";
	if(event && event.stopPropagation) {
		event.stopPropagation();
	}
	return false;
}

function reset() {
	if(gTimeout != null) {
		clearTimeout(gTimeout);
	}
	document.querySelector("#gameArea").className = "";
	
	ctx.fillStyle="#333";
	ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "30px";
	ctx.strokeText("Loading...", ctx.canvas.width/2, ctx.canvas.height/2);
	
	startTime = 0;
	stepCount = 0;
}


function postSourceNode() {
	if(srcNode) {
		srcNode.parentNode.removeChild(srcNode);
		delete srcNode;
		srcNode = null;
	}
	
	if(gSourceSetting.type == "image") {
		srcNode = createImageSourceNode();
	}
	else if(gSourceSetting.type == "video") {
		srcNode = createVideoSourceNode();
	}
	else {
		return;
	}
	
	srcNode.className = "gameContent";
	document.querySelector("#gameArea").appendChild(srcNode);
}


function createImageSourceNode() {
	var node = document.createElement("img");
	node.crossOrigin = "anonymous";
	node.onload = onSourceLoaded;
	node.src= gSourceSetting.url;
	
	return node;
}
function createVideoSourceNode() {
	var node = document.createElement("video");
	node.crossOrigin = "anonymous";
	node.oncanplaythrough = onSourceLoaded;
	node.loop = "loop";
	node.autoplay = "autoplay";
	var canvasNode = document.querySelector("#gameCanvas");
	node.width = canvasNode.width;
	node.height = canvasNode.height;
	node.src= gSourceSetting.url;
	
	return node;
}

function onSourceLoaded() {
	direct = null;
	Slide.init(srcNode, ctx, gLevel);
	Slide.draw();
	
	refreshShareText();
	
	gTimeout = onTimerTick();
}

function onTimerTick() {
	var isMoved = false;
	if(direct) {
		if(startTime == 0) {
			startTime = new Date().getTime();
		}
		isMoved = Slide.move(direct);
		if(isMoved) {
			++stepCount;
			document.querySelector("#gameStat .move").innerHTML = stepCount;
		}
		direct = null;
		
		refreshShareText();
	}
	
	if(startTime > 0) {
		document.querySelector("#gameStat .time").innerHTML = ((new Date().getTime())-startTime)+" ms";
	}
	Slide.draw();
	
	if(isMoved && Slide.validate()) {
		alert("Congratulations!");
		document.querySelector("#gameArea").className = "completed";
	}
	else {
		gTimeout = setTimeout(onTimerTick, 25);
	}
}

function refreshShareText() {
	var text = location.href+" ";
	text += "用"+(gSourceSetting.type=="video" ? "這部影片" : "這張圖") + ": "+ gSourceSetting.url+" 玩場推盤遊戲吧。\n";
	if(document.querySelector("#gameStat .move").innerHTML > 0) {
		text += "我花了" + (document.querySelector("#gameStat .move").innerHTML) + "步";
		text += (Slide.validate() ? "就完成了" : "還沒破解") + "。";
	}
	document.querySelector("#shareText >textArea").innerHTML = text;
}

function onShareItemClick(site) {
	if(site == "fb") {
		ShareFb.share("");
	}
	else if(site == "gplus") {
		ShareGplus.share("");
	}
	else if(site == "twitter") {
		ShareTwitter.share(document.querySelector("#shareText >textArea").innerHTML);
	}
	else if(site == "plurk") {
		SharePlurk.share(document.querySelector("#shareText >textArea").innerHTML);
	}
}
