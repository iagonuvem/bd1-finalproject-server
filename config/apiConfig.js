function apiConfig(API_KEY){
	this._url = 'http://webservices.sponteweb.com.br/WSApiSponteRest/api/';
	this._apiKey = API_KEY;
}

module.exports = function(){
	return apiConfig;
}