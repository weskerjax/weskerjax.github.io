(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function($) {
	var queueName = 'delayAll';
	
	function jQueryDelay(jqObject, duration){
		for(var member in jqObject){
			if(!$.isFunction(jqObject[member]) || !this[member]){ 
				this[member] = jqObject[member];
			}
		}
		
		this._jqObject = jqObject.delay(duration, queueName).dequeue(queueName);	
	};


	for(var member in $.fn){
		if(!$.isFunction($.fn[member])){ continue; }
		
		jQueryDelay.prototype[member] = function(){
			var jqObject = this._jqObject;
			var args = Array.prototype.slice.call(arguments);  
			var mothed = arguments.callee.methodName;  			
			
			jqObject.queue(queueName, function(next) {
				jqObject[mothed].apply(jqObject, args);
				next();
			});		
			
			return this;
		};
		
		jQueryDelay.prototype[member].methodName = member;
	}

	jQueryDelay.prototype.delayAll = function(duration){
		this._jqObject.delay(duration, queueName);	
		return this;
	};

	jQueryDelay.prototype.delayEnd = function(){
		return this._jqObject;
	};

	$.fn.delayAll = function(duration){
		return new jQueryDelay(this ,duration);
	};
}));
