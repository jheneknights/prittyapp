
$(function() {
    /* This increases plugin compatibility */
    var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; // old to new fall backs

    //+++++++++ CanvasPlugin +++++++++++++
    window.getCanvasData = function(canvasEl, callback) {
        var bdr = 2;
        var canvasProps = {
            mimeType: "image/png",
            xpos: canvasEl.offsetLeft + bdr,
            ypos: canvasEl.offsetTop + bdr,
            width: canvasEl.width,
            height: canvasEl.height,
            screenWidth: window.innerWidth // no WebView.getContentWidth(), use this instead
        };

        //call the Plugin execute method()
        cordovaRef.exec(callback, function(err) { callback('Error: ' + err); }, "CanvasPlugin", "toDataURL", [canvasProps.mimeType, canvasProps.xpos, canvasProps.ypos, canvasProps.width, canvasProps.height, canvasProps.screenWidth]);

    }

    //++++++++++++++ Base64ToPNG Plugin ++++++++++++++++
    /* The Java to JavaScript Gateway 'magic' class */
    function Base64ToPNG() { }

    /**  Save the base64 String as a PNG file to the user's Photo Library */
    Base64ToPNG.prototype.saveImage = function(b64String, params, win, fail) {
        cordovaRef.exec(win, fail, "Base64ToPNG", "saveImage", [b64String, params]);
    };

    cordovaRef.addConstructor(function() {
        if (!window.plugins) window.plugins = {};
        if (!window.plugins.base64ToPNG) window.plugins.base64ToPNG = new Base64ToPNG();
    });

    //+++++++++++++++++ Downloader Plugin ++++++++++++++++++++
    function Downloader() {}
    Downloader.prototype.downloadFile = function(fileUrl, params, win, fail) {
        //Make params hash optional.
        if (!fail) win = params;
        cordovaRef.exec(win, fail, "Downloader", "downloadFile", [fileUrl, params]);
    };

    cordovaRef.addConstructor(function() {
        cordovaRef.addPlugin("downloader", new Downloader());
        PluginManager.addService("Downloader", "com.phonegap.plugins.downloader.Downloader");
    });


    //+++++++++++++++++ Share this fucking shit plugin ++++++++++++++++++++++
    function shareThisFuckingShit() {}
    shareThisFuckingShit.prototype.shareThis = function(params, success, error) {
        cordovaRef.exec(success, error, "sharethisFuckingShit", "shareThis", [params])
    }
    cordovaRef.addConstructor(function() {
        if (!window.shareThisFuckingShit) window.shareThisFuckingShit = new shareThisFuckingShit();
    })

})

