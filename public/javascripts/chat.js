if (!('console' in window)) {
	window.console = {
		info: function() {},
		error: function() {},
		trace: function() {}
	};
}
var params = {};
function initParam() {
	if (location.search.indexOf('?') != -1) {
		var str = location.search.substring(1);
		var arr = str.split('&');
		for (var i = 0; i < arr.length; ++i) {
			var item = arr[i].split('=');
			params[item[0]] = decodeURIComponent(item[1]);
		}
	}
}
initParam();
var queryObj = {userid: new Date().getTime()};
if (params['mydomain'] !== void 0)
	document.forms["aasForm"].action = params['mydomain'] + 'main/pop/pop.jsp';
if (params['userid'] !== void 0)
	$.extend(queryObj, {userid: params['userid']});
var socket = io({query: queryObj});
var cbs = [];
function register(callback) {
	if (typeof callback === 'function')
		cbs.push(callback);
}

$('#button').click(function(){
	socket.emit('chat message', {msg: $('#m').val()});
	$('#m').val('');
	return false;
});
socket.on('chat message', function(msgObj){
	$('#messages').append($('<li>').text(msgObj.msg));
	//alert(params['mydomain'] + '$' + msgObj.msg);
	if (params['mydomain']) {
		document.forms["aasForm"].msg.value = msgObj.msg;
		document.forms["aasForm"].fromUser.value = msgObj.fromUser;
		document.forms["aasForm"].toUser.value = msgObj.toUser;
		document.forms["aasForm"].submit();
	}
	$(cbs).each(function(idx, cb) {
		cb.call(this, msgObj);
	});
	
});