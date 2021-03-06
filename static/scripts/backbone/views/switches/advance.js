Backdrop = BaseView.extend({
	render	:	function () { 
		if(!this.options.zIndex) this.options.zIndex = 999
		this.$el = $('<div style="width:100%; height:100%; background-color:black;opacity:0.7;position:absolute; top:0; left:0;"/>');
		this.$el.css('z-index', this.options.zIndex)
		if(!this.options.$parent) this.options.$parent = $('body')
		this.options.$parent.append(this.$el);
	},
	pullItOver : function ($elm) {
		if(!this.elmArr) this.elmArr = [];
		$elm.after($elm.clone());
		var left = $elm.offset().left - this.$el.offset().left;
		var top = $elm.offset().top - this.$el.offset().top;
		$elm.css('left', left);
		$elm.css('top', top);
		$elm.css('z-index', this.options.zIndex+1);
		$elm.css('position', 'absolute');
		this.elmArr.push($elm);
	},
	erase : function () {
		_.each(this.elmArr, function ($elm) {
			$next = $elm.next()
			$elm.attr('style', $next.attr('style'));
			$next.remove();
		}, this);
		this.$el.remove();
	}
});

AdvanceSwitch = BasicSwitch.extend({
 	render	:	function () {
 		BasicSwitch.prototype.render.apply(this, arguments);
 		this.$el.css('float','left');
 		if(this.bd) this.$el.find('.advancePannel').width(this.$el.parent().width() - this.$el.width()).show();
 	},
	events: _.extend(BasicSwitch.prototype.events,{
		"longTap .toggelSwitch" : "showAdvancePannel",
		"tap .advancePannel .cross" : "hideAdvancePannel"
	}),
	showAdvancePannel : function () {
		if(this.bd) return;
		this.bd = new Backdrop({'$parent':$('.appArea')});
		this.bd.render();
		this.bd.pullItOver(this.$el);
		this.$el.find('.advancePannel').width(0).show().animate({width:this.$el.parent().width() - this.$el.width()}, {'duration':150})
		this.$el.animate({left:this.$el.parent().position().left}, {'duration':150});

	},
	hideAdvancePannel : function () {
		if(!this.bd) return;
		this.$el.find('.advancePannel').width(0).hide();
		this.bd.removeView();
		this.bd = null;
	}
})

AdvanceFanSwitch = AdvanceSwitch.extend({
	initialize : function () {
		_.bindAll(this, 'onDutyChange');
		this._onDutyChange = _.throttle(this.onDutyChange, 500, {leading: false});
		AdvanceSwitch.prototype.initialize.apply(this, arguments);

	},
	showAdvancePannel : function () {
		this.$slider.hide();
		AdvanceSwitch.prototype.showAdvancePannel.apply(this, arguments);
		this.$slider.show();
	},
	render	:	function () {
 		AdvanceSwitch.prototype.render.apply(this, arguments);
 		this.$slider = $('<input type="range" class="inside" min="10" max="86" value="30" showemptylabels="false" style="margin:30px 0 0 10px;"/>');
 		this.$el.find('.advancePannel').append(this.$slider);
 		this.$slider.width(Math.max(120,this.$el.parent().width() - 2*this.$el.find('.toggelSwitch').width() - 20));
 		var duty = parseInt(100*parseInt(this.model.get('duty'))/255);
 		this.$slider.val(Math.min(Math.max(duty, 10), 86));
 		this.$slider.on("input change", this._onDutyChange);
 	},
 	onDutyChange : function (event) {
 		var duty = parseInt(this.$slider.val());
 		if(duty == 86) duty=100;
 		console.log(duty);
 		duty = parseInt(255*duty/100);
 		this.model.setDuty(duty);
 	}, 
 	erase	: function () {
 		this.$slider.off("input change", this._onDutyChange);
 		this.$slider.remove();
 		return AdvanceSwitch.prototype.erase.apply(this, arguments);
 	}
});

