/*!
 * jQuery plugin for web analytics with Omniture 1.0.0
 *
 * https://github.com/ychumak/omniture
 * 
 * Copyright 2014 Yuriy Chumak
 * Released under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */


;(function( $ ) {
  $.fn.Omniture = function(s, config ) {
    if (typeof(s) == 'undefined' || !s) return false;
    var defaults = {
        /* Generic defaults */
    	/*
        pageName      : "Home"
      , server        : ""
      , channel       : ""
      , pageType      : ""
      , prop1         : ""
      , prop2         : ""
      */
        /* eCommerce Variables */
      /*
      , state         : ""
      , zip           : ""
      , events        : ""
      , products      : ""
      , purchaseID    : ""
      , eVar1         : ""
      , eVar2         : ""
      */
    };
    
    if ( config ) $.extend(defaults, config);
    
    /* 
      Provides the capability to apply pageview metrics to a particular route.
      
      @param { String } pattern
      @param { Function | Object } fn
    */
    this.viewToLog = function(pattern, fn) {
        if (typeof(s) == 'undefined' || !s) return false;
        if (typeof(pattern) != 'string') return false;

        var location = window.location.href;
        if (location.indexOf(pattern) != -1) {
            console.log('viewToLog: bind properties for pattern ['+pattern+']');
	
	        var propertiesTmp = null;
	        var properties = [];
	        if (typeof(fn) == 'function') {
	            propertiesTmp = fn();
	        } else if (typeof(fn) == 'object') {
	            propertiesTmp = fn;
	        }

            clearVars(s);
	        
	        var linkVars = [];
	        var linkEvents = [];
	        var linkEventsValue = [];
	        var tmp = {};
	        for (key in propertiesTmp) { 
	        	if (propertiesTmp[key] != 'n/a') {
	        		properties[key] = propertiesTmp[key];
	
	                if (key.indexOf('prop') != -1 || key.indexOf('eVar') != -1 || key.indexOf('channel') != -1 || key.indexOf('campaign') != -1 || key.indexOf('product') != -1 || key.indexOf('page') != -1) linkVars.push(key);
	                if (key.indexOf('event') != -1) {
	              	  linkEvents.push(key);
	              	  linkEventsValue.push(properties[key]);
	                }
	
	                tmp[key] = s[key];
	                //s[key] = properties[key];
	        	}
	        }
	        
	        if (linkEvents.length) linkVars.push('events');
	        
	        s.linkTrackVars = linkVars.length ? linkVars.join(",") : "None";
	        s.linkTrackEvents = linkEvents.length ? linkEvents.join(",") : "None";
	        if (linkEvents.length) {
	        	s.events = linkEventsValue.join(",");
	        } else {
	        	s.events = null;
	        }
        
        	console.log(properties);
            $.extend(s, properties);
            s.t();
            for (key in tmp) {
                s[key] = tmp[key];
            }
        }
        return true;
      };

    /* 
      Provides the capability to execute pseudo synchronous requests (img) to Omniture.
      
      @param { String } element
      @param { String } event
      @param { Function | Object } fn
    */
    this.linkToLog = function(element, event, fn) {
        console.log('linkToLog: bind '+event+' to '+$(element).selector);
        if (typeof(s) == 'undefined' || !s) return false;
        if (typeof(element) != 'string') return false;
        if (typeof(event) != 'string') return false;
        if (typeof(fn) == 'function' || typeof(fn) == 'object') {
        	$(document).on(event, element, function() {
                console.log('linkToLog: run '+event+' on '+$(element).selector);
                var properties = null;
                var clicked = 'undefined';
                if (typeof(fn) == 'function') {
                  clicked = $(this);
                  properties = fn(clicked);
                } else if (typeof(fn) == 'object') {
                  properties = fn;
                }

                clearVars(s);

                var linkVars = [];
                var linkEvents = [];
                var linkEventsValue = [];

                var tmp = {};
                for (key in properties) {
                  if (properties[key] != 'n/a') {
                      if (key.indexOf('prop') != -1 || key.indexOf('eVar') != -1 || key.indexOf('campaign') != -1) linkVars.push(key);
	                  if (key.indexOf('event') != -1) {
	                	  linkEvents.push(key);
	                	  linkEventsValue.push(properties[key]);
	                  }
	                  tmp[key] = s[key];
	                  s[key] = properties[key];
                  }
                }
                
                if (linkEvents.length) linkVars.push('events');
                
                s.linkTrackVars = linkVars.length ? linkVars.join(",") : "None";
                s.linkTrackEvents = linkEvents.length ? linkEvents.join(",") : "None";
                if (linkEvents.length) {
                	s.events = linkEventsValue.join(",");
                }
                  
                if (typeof(clicked) != 'undefined' || clicked.attr("href")) {
                	console.log('s.properties: ', properties);
                	if ( $(element).text() && $.trim($(element).text())) {
                		s.linkName =  $.trim($(element).text());
                	} else if ($(element).selector != 'undefined') {
                		s.linkName = $(element).selector;
                	}
                    //s.tl(this, 'o', element.selector);
                	// true - disables 500miliseconds delay for s.tl()
                	s.tl(true, 'o', s.linkName);
                } else {
                	console.log('s.properties: ', properties);
                	s.tl();
                }
                for (key in tmp) {
                  s[key] = tmp[key];
                }
                
            });
            return true;
        } else {
        	return false;
        }
      };

    return this;
  };
  
  /**
   *  Clear variables
   */
  clearVars = function(obj_s) {
	  if (obj_s) {
		  for (var i=0; i < 75; i++) {
			  if (obj_s['prop'+i]) obj_s['prop'+i]='';
			  if (obj_s['eVar'+i]) obj_s['eVar'+i]='';
			  if(i<=5 && obj_s['hier'+i]) obj_s['hier'+i]='';
		  }
		  var svarArr = ['pageName','channel','products','events','campaign','purchaseID','state','zip','server','linkName', 'linkTrackVars', 'linkTrackEvents'];
		  for (var i=1; i < svarArr.length ; i++) {
			  if (obj_s[svarArr[i]]) obj_s[svarArr[i]]=''; 
		  }
	  }
	};
	
})( jQuery );