 var parsers = require("serialport").parsers;
var SerialPort = require("serialport").SerialPort;

var BaseClass = require(__rootPath+"/classes/baseClass");
var __ = require("underscore");

var BaseCommunicator = BaseClass.extend({
	baudrate: 9600,
	portAddress : "/dev/ttyAMA0",
	serialPort : null,
	_data : "",
	deviceList : [],
	_queryQ : [],
	_pendingReqCallbackMap : {},
	_timeoutPendingRequests : function () {
		__.each(this._pendingReqCallbackMap, function (callback, code) {
			callback && callback('timeout');
		}, this);
		this._pendingReqCallbackMap = {};
	},
	byteStrToHexStr : function (byteStr) {
        var hexOut = "";
        for (var i=0; i<byteStr.length; i++) {
                var tmp = byteStr.charCodeAt(i).toString(16);
                if (tmp.length == 1) tmp = "0"+tmp;
                hexOut += tmp;
        }
        return hexOut;
	},
	byteDataToStr : function (data){
		byteStr = '';
		for (var i=0; i < data.length; i++) {
			byteStr += String.fromCharCode( parseInt(data[i], 16).toString(16) );
		}
		return byteStr;
	},
	init : function () {
		this.serialPort = new SerialPort(this.portAddress, {
			baudrate: this.baudrate,
			parser: parsers.raw
		}, false);
		this.serialPort.open(__.bind(function () {
			this._broadcast(); // for some reason we do not get response to first request, so a dummy request.
			setTimeout(__.bind(this._onPortOpen, this), 1000);
		}, this));
		setInterval(__.bind(this._timeoutPendingRequests, this), 3000);
		this.zModRestartedAt =this.lastPacketRecievedAt = new Date().getTime()/1000; // 
	},
	checkCommunication : function () {},
	_onPortOpen : function () {
		console.log("###### serialPort has oppened.")
		this.serialPort.on('data', __.bind(this._onDataArrival, this));
		this.checkCommunication();
		this._broadcastLoop();
	},
	_broadcastLoop : function () {
		if(this._queryQ.length) return setTimeout(__.bind(this._broadcastLoop, this), 1000);
		this._broadcast();
		setTimeout(__.bind(this._broadcastLoop, this), 8000)
	},
	_checkConnectivity : function () {
		if( ((new Date().getTime()/1000) - this.lastPacketRecievedAt) > 25) {
			console.log("########### Zigbee Module stopped responding")
			this.zModRestartedAt = this.lastPacketRecievedAt = new Date().getTime()/1000;
			__restartZigbeeModule();
		}
		var unreachableCount=0, maxTimeStamp=0;
		__.each(this.deviceList, function (dev) {
			if(dev.unreachable) unreachableCount++;
			maxTimeStamp=Math.max(maxTimeStamp, dev.lastSeenAt);
			if((dev.lastSeenAt < ((Date.now()/1000) - 25)) && !dev.unreachable) { //8 X 3 =24 .. so 25 seconds is good number for 3 ping miss.
				dev.unreachable = true;
				this.emit("deviceUnreachable", dev.macAdd);
			}
		}, this)
		maxTimeStamp=Math.max(maxTimeStamp, this.zModRestartedAt||0);
		if(this.deviceList.length == unreachableCount) {
			console.log("########### all",unreachableCount, "devices seems unreachable.");
			var threstHold = 120
			if(maxTimeStamp < ((Date.now()/1000) - threstHold)) {
				console.log("########### no communication from any router for more than", threstHold, 'seconds')
				this.zModRestartedAt = new Date().getTime()/1000;
				__restartZigbeeModule();
			}
		}
	},
	_onDataArrival : function (data) {
		data = this.byteDataToStr(data);
		this._processArrivedData(data);
	},
	_processArrivedData : function(data) {

	},
	_processPacket : function (data) {

	},
	_broadcast : function () {
		this._checkConnectivity();	
	},
	_send : function (command, callback) {
		this.serialPort.write(__.map(command, function (c){return c.charCodeAt(0);}), function(err, results) {
			if (err) {
				console.log('Error: error while writing data on serial Port');
				throw err
			}
			if (callback && typeof callback == 'function') callback(err, results)
		});	
	},
	getDeviceIds : function() {
		return __.map(this.deviceList, function (itm){return itm.deviceId});
	},
	_getMacAdd : function (devId) {
		try {return __.findWhere(this.deviceList, {'deviceId':devId}).macAdd;}
		catch(err){return null;}
	},
	_getNwkAdd : function (devId) {
		try {return __.findWhere(this.deviceList, {'deviceId':devId}).nwkAdd;}
		catch(err){return null;}
	},
	updateNetworkKey : function (networkKey, callback) {
		callback && callback('noSupport');
	},
	getNetworkKey : function (callback) {
		callback && callback('noSupport');
	}



});
module.exports = BaseCommunicator;