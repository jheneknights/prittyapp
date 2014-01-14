 $(function() {
 	/* This increases plugin compatibility */
    var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; // old to new fall backs

 	//+++++++++++++++++ Share this fucking shit plugin ++++++++++++++++++++++
    function shareThisFuckingShit() {}
    shareThisFuckingShit.prototype.shareThis = function(params, success, error) {
        cordovaRef.exec(success, error, "shareThisFuckingShit", "shareThis", [params])
    }
    cordovaRef.addConstructor(function() {
        if (!window.shareThisFuckingShit) window.shareThisFuckingShit = new shareThisFuckingShit();
    })
    
 })
