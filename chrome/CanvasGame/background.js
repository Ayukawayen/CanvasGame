var BASE_URL = "http://ayukawayen.net/CanvasGame/slide/";
var ACCEPT_SITES = {
	"image":[
		"http://upload.wikimedia.org/*",
		"http://imgur.com/*",
		"http://*.imgur.com/*",
		"https://*.googleusercontent.com/*",
		"https://googledrive.com/host/*",
		"http://*.bp.blogspot.com/*",
	],
	"video":[
		"http://upload.wikimedia.org/*",
		"https://googledrive.com/host/*",
	],
};

addContextMenu("image");
addContextMenu("video");

function addContextMenu(type) {
	var menuId = chrome.contextMenus.create({
		"type":"normal",
		"title":"Play Sliding Puzzle",
		"contexts":[type,],
		"targetUrlPatterns":ACCEPT_SITES[type],
		"onclick":function(info, tab){
			onContextMenuClick(info.mediaType, info.srcUrl);
		},
	});
	
	return menuId;
}

function onContextMenuClick(type, mediaUrl) {
	var url = BASE_URL+"#"+type+"="+encodeURIComponent(mediaUrl);
	chrome.tabs.create({"url":url});
}
