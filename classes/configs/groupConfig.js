var __ = require("underscore");
var deviceManager = require(__rootPath+'/classes/devices/deviceManager');
var BasicConfigManager = require(__rootPath+"/classes/configs/basicConfigManager");
var timerConfig = require(__rootPath+"/classes/configs/timerConfig");
var GroupConfigManager = BasicConfigManager.extend({
	file : '/../configs/groupConfig.json',
	getList : function () {
		var data = [];
		var count = __.keys(this.data).length;
		__.each(this.toJSON(), function (conf, id) {
			conf.id = id;
			conf.count = count;
			__.each(conf.controls, function (ctl) {

				__.each(__remoteDevInfoConf.get(ctl.devId+'.loadInfo.'+ctl.switchID), function (val, key) {
					ctl[key] = val;	
				});
				var config = deviceManager.getConfig(ctl.devId);
				ctl.disabled = (!config)?true:((!config.reachable)?true:false);
				ctl.state = (!config)?false:config[ctl.devId]["switch"][ctl.switchID]["state"];
				ctl.state = (ctl.state)?'on':'off';
				var timers = timerConfig.getTimers(ctl.devId, ctl.switchID);
				ctl.autoOff = timers.autoOff[0];
				if(ctl.autoOff) ctl.autoOff = __.omit(ctl.autoOff, "devId", "loadId");
				ctl.schedules = [];
				__.each(timers.schedules, function (schdl){ctl.schedules.push(__.omit(schdl, "devId", "loadId"))});
				ctl.hasSchedules = ctl.schedules.length;
				ctl.hasTimer = (!ctl.autoOff)?false:ctl.autoOff.enabled;
				ctl.autoToggleTime = null;
				var vLoad = deviceManager.getVirtualLoad(ctl.devId, ctl.switchID);
				if(vLoad) {
					var tmp = vLoad.getRemainingTimeToToggle();
					if(tmp < Infinity) {
						var d = new Date(new Date().getTime() + tmp*1000), hour = d.getHours(), min = d.getMinutes();
						ctl.autoToggleTime = ((hour<10)?'0':'')+hour+':'+((min<10)?'0':'')+min;	
					}
				}
				if (config && (ctl.switchID == 0 || ctl.switchID == 1)) {
					ctl.duty = config[ctl.devId]["dimmer"][ctl.switchID]["state"];
				}
			});
			data.push(conf);
		});
		return data;
	}
})
if (typeof groupConfig == 'undefined') groupConfig = new GroupConfigManager();
module.exports = groupConfig;
