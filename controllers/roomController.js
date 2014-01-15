var __ = require("underscore");
var util = require('util');
var BaseController = require(__rootPath+"/controllers/baseController");
var JsonReader = require(__rootPath+"/classes/utils/jsonReader");
var deviceModel = require(__rootPath+"/configs/managers/deviceConfigManager");
var deviceManager = require(__rootPath+'/classes/devices/deviceManager');
var roomModel = require(__rootPath+"/configs/managers/roomConfigManager");
RoomController = BaseController.extend({    
    name: "Room",
    run: function(req, res, next) {
    	
    	if(req.params.action && RoomController[req.params.action])
    		RoomController[req.params.action](req, res); 
    	else
    		res.sendfile('./static/test.html');
    	
    	//response.render(this.template, data);
    },
    list: function (req, res) {
        res.send(roomModel.getList());
    },
    toggelSwitch : function (req, res) {
        var config = deviceManager.getConfig(req.query.devId); 
        var state = config[req.query.devId]["switch"][req.query.switchId]["state"];
        config[req.query.devId]["switch"][req.query.switchId]["state"] = !state;
        var swId = req.query.switchId;
        if (swId == 0 || swId == 1) {
            if(!state) config[req.query.devId]["dimmer"][req.query.switchId]["state"] = 0x50;
            else if (config[req.query.devId]["dimmer"][req.query.switchId]["state"] < 0x70) {
                config[req.query.devId]["dimmer"][req.query.switchId]["state"] = 0x70
                config[req.query.devId]["switch"][req.query.switchId]["state"] = state;
            }
            else if (config[req.query.devId]["dimmer"][req.query.switchId]["state"] < 0x77) {
                config[req.query.devId]["dimmer"][req.query.switchId]["state"] = 0x80
                config[req.query.devId]["switch"][req.query.switchId]["state"] = state;
            }
        }

        deviceManager.applyConfig(config);
        res.send({"status":"success", "data":!state});
    },
    powerOff : function (req, res) {
        var jR = new JsonReader;
        jR.readfile(__rootPath+'/configs/roomConfig.json', function (err, data) {
            var roomConfig = __.find(data, function (rCon) {return rCon.id == req.params.id;});    
            __.each(roomConfig.controls, function (ctl) {
                deviceModel.set(ctl.devId+".switch."+ctl.switchID+".state", 0);
            });
            res.send(RoomController._getRoomModel(roomConfig));

        });    
    },
    _getRoomModel : function(roomConfig) {
        var controls = []
        __.each(roomConfig.controls, function (ctl) {
            controls.push(__.extend({"id":ctl.id, "name":ctl.name}, deviceModel.get(ctl.devId+".switch."+ctl.switchID)));
        });
        return {"id":roomConfig.id, "name":roomConfig.name ,"controls":controls}


    }
});

module.exports = RoomController; 