function getParams(paramString) {
	if(!paramString) {
		return [];
	}
	
	var params = [];
	
	var querys = paramString.slice(1).split("&");
	for(var i=0;i<querys.length;++i) {
		var buf = querys[i].split("=");
		params[buf[0]] = buf[1];
	}
	
	return params;
}