var ShareFb = {
	share: function(text) {
		window.open("http://www.facebook.com/share.php?u="+encodeURIComponent(location.href), "", "menubar=no,toolbar=no,height=600,width=600");
	},
};

var ShareGplus = {
	share: function(text) {
		window.open("https://plus.google.com/share?url="+encodeURIComponent(location.href), "", "menubar=no,toolbar=no,height=600,width=600");
	},
};

var ShareTwitter = {
	share: function(text) {
		window.open("http://twitter.com/home/?status="+encodeURIComponent(text), "", "menubar=no,toolbar=no,height=600,width=600");
	},
};

var SharePlurk = {
	share: function(text) {
		window.open("http://www.plurk.com/?qualifier=shares&status="+encodeURIComponent(text), "", "menubar=no,toolbar=no");
	},
};
