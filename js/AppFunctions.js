/**
 *
 *@Author - Eugene Mutai
 *@Twitter - JheneKnights
 *
 * Date: 6/13/13
 * Time: 2:38 AM
 * Description:
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Copyright (C) 2013
 * @Version -
 */

var AppFunctions = {

    userData: "prittyNote",
    bktime: false,
    URL: {
      app: "http://app.prittynote.com/"
    },

    getPhoto: function(bool) {
        if(typeof bool == "undefined") bool = false;
        var pictureSource = navigator.camera.PictureSourceType;
        var destinationType = navigator.camera.DestinationType;

        //Is user loading picture from storage or has chosen to take a shot.
        var resource = bool == false ? pictureSource.PHOTOLIBRARY: pictureSource.CAMERA;

        //reduce the quality of the picture if it's coming from the camera
        var Ql = bool == false ? 90: 70;

        /* OTHER EDITS
         allowEdit : true, //edit the image before use
         targetWidth: $("#prittynote").width(), //Width in pixels to scale image.
         targetHeight: $("#prittynote").width(),
         saveToPhotoAlbum: true  //Save the image to the photo album on the device after capture. (Boolean)
         */

        //now set the options
        var options = {
            quality: 90,
            destinationType: destinationType.DATA_URL,
            sourceType: resource
        }

        //If the user is using the camera, save his image
        if(bool)  { //adjust the image to canvas dimensions
            options.saveToPhotoAlbum = true;
            options.targetWidth = options.targetHeight = $("#prittynote").width()
        }

        console.log(options);
        navigator.camera.getPicture(AppFunctions.onPhotoSuccess, AppFunctions.onPhotoFail, options);
    },

    onPhotoSuccess: function(imageUri) {
        var img = $('img#bg-image');
        img.attr('src', imageUri); //"data:image/jpeg;base64," + imageUri);
        img.bind('load', function() {

            var offset, offsetBottom;
            if(img.height() < img.width()) {
                offset = 0
                offsetBottom = img.width()
            }else{
                offset = (img.height() - $(window).width())/2;
                offsetBottom = img.width() + offset;
            }

            //now feed the image with required dimensions
            var image = {
                src: $(this).attr('src'),
                x1: 0, x2: img.width(),
                y1: offset, y2: offsetBottom,
                bool: true
            }

            //activate background image and draw it
            prittyNote.bgImage =  true; //prittyNote.isImage(image) -- override
            if(prittyNote.bgImage) {
                prittyNote.theImage = image.src;
                prittyNote.drawCanvas(prittyNote.getValue(), image);
            }
            console.log("the width of the image -- " + img.width());
        });
        img.bind('error', function() {
            alert('Oh Snap! Couldn\'t load the image for some reason! Try again!');
        });
    },

    onPhotoFail: function(message) {
        console.log(message);
    },

    //generate a random string with letters and number
    randomString: function(length) {
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        var randomstring = '';
        for (var i=0; i<length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum+1);
        }
        return randomstring;
    },

    //collect basic information about the user
    initCollectUserData: function() {
        var user = new Object();
        user.device = {
            model:  window.device.model,
            platform: window.device.platform,
            uuid: window.device.uuid,
            verified: 0
        }

        //Stringyfy the data and store it
        var userData  = JSON.stringify(user);
        if(localStorage) { //check 4 localstorage, cookies as fallback
            //now check to see if the user's data exist
            if(localStorage.getItem(AppFunctions.userData)) {
                AppFunctions.verifyUser();
            }else{ //it doesnt so set it and fech his Geo data
                localStorage.setItem(AppFunctions.userData, userData);
                AppFunctions.geoLocateUser();
            }
        }else{ //Use cookies instead
            //If we had ever saved the user's data before
            if($.cookie(AppFunctions.userData)) {
                AppFunctions.verifyUser();
            }else{
                $.cookie(AppFunctions.userData, userData);
                AppFunctions.geoLocateUser();
            }
        }
    },

    //http://maps.google.com/maps/api/geocode/json?latlng=-1.2922417,36.8991335&sensor=true
    geoLocateUser: function() {
        var location = '', coords = {};
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                    //console.log(position)
                    $.get(AppFunctions.URL.app + "app/geolocate.php",
                        {latlng: position.coords.latitude + ',' + position.coords.longitude, sensor: "true"},
                        function(m) {
                            if(m.results.length > 0) {
                                if(m.results.length > 1) location = m.results[1].formatted_address;
                                else location = m.results[0].formatted_address;
                            }

                            coords = {
                                lat: position.coords.latitude,
                                long: position.coords.longitude,
                                location: location
                            }

                            if(localStorage) {
                                localStorage.setItem("userLocationData", JSON.stringify(coords))
                            }else{
                                $.cookie('userLocationData', JSON.stringify(coords))
                            }

                            //now head on to verify the person
                            AppFunctions.verifyUser();
                            console.log("User's location: " + location)
                        }, "json")
                },
                function(e) {
                    switch(e.code) {
                        case e.PERMISSION_DENIED:
                            //if permission was denied
                            break
                        case e.POSITION_UNAVAILABLE:
                            //if javascript failed to acquire the coordinates
                            break
                        case e.TIMEOUT:
                            //if the request timed out, do the request again
                            AppFunctions.geoLocateUser();
                            break
                    }
                    //alert("Error Occured: " + e.message)
                },
                {enableHighAccuracy: true, timeout: 30000, maximumAge: 2000*60*60}
            )
            //timeout after 30 secs, and get pos which is not older than 2 hrs
        }
        //return statusShare.data
    },

    //initialising the App
    initiliaseApp: function() {
        AppFunctions.verifyUser();
        //If the user taps the search buttorn, pop up the text editor
        document.addEventListener("searchbutton", function() {
            $('a[data-action="edit"]').trigger('tap');
        }, false);
        //If the user taps menu button, prompt the user to save the image
        document.addEventListener('menubutton', function() {
            $('a[data-action="download"]').trigger('tap');
        }, false)

        //If the user presses the back button
        document.addEventListener("backbutton", function() {
            var date = new Date() //get the current date
            $('.activity').html("Press back again to exit...")
            if(AppFunctions.bktime) {
                var diff = prittyNote.getTimeDifference(AppFunctions.bktime, date);
                console.log('Difference in seconds since last BACK press: ' + diff.seconds);
                AppFunctions.bktime = date;
                //exit the application or negate the elapsed time
                if(diff.seconds < 4) navigator.app.exitApp();
                //if not 3 seconds have passed since the user last pressed the back button
            }else{
                AppFunctions.bktime = date;
            }
            $('.close').trigger("tap"); //close all possible pop ups
            $('a[data-action="cancel"]').trigger("tap"); //close the editor.
            $.sidr('close', 'side-bar-themes'); //close all side bars
            $.sidr('close', 'side-bar-fonts');
        }, false);

        //FONT RANGE INPUT -- max font size controlled by the screensize
        $('.font-range-input').attr({max: $(window).width()/3}).delay(0).rangeInput();
        $('.close-font-slider').click(function() { $('.font-control').slideUp(); })

        //Create the side menus
        $('.side-bar-themes').sidr({
            name: 'side-bar-themes',
            side: 'left', // By default
            source: function(name) {
                $('#' + name).append($('.' + name).children('ul').clone()).css('overflow', 'hidden');
                var myScroll = new iScroll(name, {
                    vScrollbar: true, hScrollbar:false, hScroll: false
                    ,onScrollStart: function () { myScroll.refresh(); }
                })
            }
        });
        $('.side-bar-fonts').sidr({
            name: 'side-bar-fonts',
            side: 'right',
            source: function(name) {
                $('#' + name).append($('.' + name).children('ul').clone()).css('overflow', 'hidden');
                var myScroll = new iScroll(name, {
                    vScrollbar: true, hScrollbar:false, hScroll: false
                    ,onScrollStart: function () { myScroll.refresh(); }
                })
            }
        });

        //Enable swipe events to control the App requirements
        var swipe = $(document).hammer();
        //if the user double taps the canvas
        swipe.on('doubletap', 'canvas', function() {
            $('a[data-action="edit"]').trigger('tap');
        })
        swipe.on('swipeleft', function(ev) {
            $.sidr('close', 'side-bar-themes');
            $.sidr('open', 'side-bar-fonts');
            ev.gesture.preventDefault();
        })
        swipe.on('swiperight', function(ev) {
            $.sidr('open', 'side-bar-themes');
            $.sidr('close', 'side-bar-fonts');
            ev.gesture.preventDefault();
        })
        swipe.on('tap touch', 'div.content', function() {
            $.sidr('close', 'side-bar-themes');
            $.sidr('close', 'side-bar-fonts');
        })

        //initialise all other events
        AppFunctions.initialiseEvents();

    },

    initialiseEvents: function() {
        //footer menu events delegation
        var footerMenu = document.getElementsByClassName('footer-icon-menu');
        $(footerMenu).hammer().on('tap', 'a', function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var action = $(this).data('action');
            switch(action) {
                case "edit":
                    //Hide the elements
                    $('.text-area').show(600, "easeInBack", function() {
                        $('.overlay').fadeIn(100)
                        $('textarea#input-text').focus(); //focus to enable user to edit
                        popup = true
                    });
                    break;

                case "theme":
                    $('.color-options').show("fast", function() {
                        $('.overlay').show('fast')
                        $(this).children().hammer().on('tap', 'div', function(e) {
                            e.stopPropagation();
                            e.preventDefault();
                            var action = $(this).data('action')
                            $('.close').trigger("tap");
                            console.log(action)
                            switch(action) {
                                case "custom":
                                    AppFunctions.editCanvasColors();
                                    break;
                                case "themes":
                                    $.sidr('open', 'side-bar-themes');
                                    $.sidr('close', 'side-bar-fonts');
                                    break;
                            }

                        })
                    })
                    break;

                case "add-image":
                    //param: boolean -- true for camera
                    $('.app-cmr-gallery').show('fast', function() {
                        var El = $(this);
                        $('.overlay').show('fast');
                        $(this).children().hammer().on('tap', 'div', function() {
                            var action = $(this).data('action');
                            console.log(action)
                            switch(action) {
                                case "gallery":
                                    AppFunctions.getPhoto();
                                    break;
                                case "camera":
                                    AppFunctions.getPhoto(true);
                                    break;
                                case "remove-image":
                                    prittyNote.removeImage();
                                    break;
                            }
                            //Now close the modal dialog
                            El.find('.close').trigger('tap');
                        })
                    });
                    break;

                case "font":
                    $.sidr('close', 'side-bar-themes');
                    $.sidr('open', 'side-bar-fonts');
                    break;
                //Change the font-size
                case "font-size":
                    $('.font-control').slideToggle();
                    break;
                //prompt for the image to be saved;
                case "download":
                    //track how many images the user can make with the free application.
                    $('.app-save').show('fast', function() {
                        $('.overlay').show('fast');

                        //Respond to what the user will choose
                        $(this).children().hammer().on('tap', 'div', function() {
                            var action = $(this).data('action');

                            //show the saving progress bar - DEPRECATED
                            $('.activity-progress').width(0).parent().show();
                            $('.activity').html("Saving Image...");
                            //if($('.saving-progress-bar')) $('.saving-progress-bar').show();

                            //HIDE THE SAVING MODAL
                            $(this).parent().parent().hide("fast", function() {
                                //also hide the overlay
                                $('.overlay').hide('fast', function() {
                                    //After the overlay is hidden now perform the tasks
                                    console.log(action)
                                    switch(action) {
                                        case "save":
                                            prittyNote.share = false;
                                            prittyNote.makeDemoNotes();
                                            break;
                                        case "save-share":
                                            prittyNote.share = true;
                                            setTimeout(prittyNote.makeDemoNotes(), 0);
                                            break;
                                    }
                                })
                            })

                        })
                    })

                    break;
            }
            ev.stopPropagation();
        });

        $('.finish-edit').hammer().on('touch tap', 'a', function(ev) {
            ev.preventDefault();
            var action = $(this).data('action');
            //Hide the elements
            $('.text-area').hide(600, "easeOutBack", function() {
                $('.overlay').fadeOut(100)
                popup = false;
            });
            //do something accordint to the action
            switch(action) {
                case "cancel": /* do nothing */ break;
                case "done": /* do something */
                    prittyNote.checkTextLength();
                    break;
            }
        });

        $('.pop-header').hammer().on('tap', 'img', function() {
            var action = $(this).parent().data('action');
            console.log("The user has clicked on", action);

            var el = document.getElementById('input-text');
            switch (action) {
                case "ok-edit":
                    $(el).trigger('blur');
                    break;
                case "cancel-edit":
                    $(el).val('').focus();
                    break;
                case "none":
                    //do nothing
                    break;
                case "help":
                    $('#app-help').trigger('tap')
                    break;

                case "status-share":
                    $('.overlay').show("fast", function() {
                        $(".status-search").show("fast", function() {
                            //to correct the height of stuff
                            var wrapper = $('#search-wrapper');
                            var of = wrapper.offset();
                            var height = $(window).height() - of.top;

                            if(wrapper.css("height") !== wrapper.parent().height() - of.top) {
                                wrapper.css("height", wrapper.parent().height() - of.top)
                            }
                        })
                    })
            }
        });

        //Add scroller to the image
        var Scroll = new iScroll('intro-content', {
            vScrollbar: true, vScroll: true, hScrollbar: false, hScroll: false
            ,onScrollStart: function () { Scroll.refresh(); }
        })

        //If Overlay is left alone, one tapping trigger it to close
        $('.overlay').click(function() {
            if(!popup) {
                $(this).hide('fast', function() {
                    $('.close').trigger('tap')
                })
            }
        });


        //Close current pop up
        $('.close').hammer().on('tap', function(e) {
            $('.pop-up[data-action="' + $(this).data('action') + '"]').hide('fast', function() {
                var action = $(this).data('action');
                console.log("closing pop up", action)
                if(action !== "intro" || popup == false) {
                    $('.overlay').hide()
                }else{
                    $('.overlay').show()
                }
                e.stopPropagation();
            })
        })

        var Canvas = $('canvas#prittynote');
        Canvas.hammer().on('hold', function(ev) {
            $(".activity").html("Move the text where you want it to be...");
            //Drag the text around to reposition it
            Canvas.on("touchmove", function(e) {
                if(e.type == "touchmove") {
                    var g =  e.originalEvent;
                    var pos = {left: g.pageX - $(this).offset().left, top: g.pageY - $(this).offset().top};
                    $('.activity').html("So where do you want to be place it???");
                    prittyNote.onMouseDownOrUp(pos);
                }
            })
                .on("touchend", function() {
                    $(".activity").html("Pinch the note, to restore to default.");
                })
        })

        //remove user's custom positioning of the note
        Canvas.hammer().on("pinchin", function() {
            prittyNote.userDef = false;
            setTimeout(prittyNote.drawCanvas(prittyNote.getValue()), 100);
        })

        $('#app-help').hammer().on('tap', function() {
            $('.introduction').show('fast', function() {
                $('.overlay').show()
            })
        })

        //Enable the sharing of the application
        $('#app-share').hammer().on('tap', function() {
            AppFunctions.shareThis({
                    text: "Today I thought of making a special note with PrittyNote because it's easy, fast and pretty too. I'd be so happy if you made 1 for me...download the app here: http://bit.ly/jheneknights",
                    subject: "Sharing App: PrittyNote",
                    title: "Share App with:"
                },
                function() {}
            );
        })
    },

    verifyUser: function() {
        if(localStorage) {
            //If the user's data already exist
            if(localStorage.getItem(AppFunctions.userData)) {
                //If the user's location exists
                if(localStorage.getItem("userLocationData")) {
                    var user = {
                        phone: JSON.parse(localStorage.getItem(AppFunctions.userData)),
                        geo: JSON.parse(localStorage.getItem("userLocationData"))
                    }
                    //verify the user
                    AppFunctions.verify(user)
                }else{  //if geo-location data ds exist, get it 1st
                    AppFunctions.geoLocateUser();
                }
            }else{ //If no user data exists at all
                AppFunctions.initCollectUserData();
            }
        }else{
            //COOKIES FALLBACK
            if($.cookie(AppFunctions.userData)) {
                if($.cookie("userLocationData")) {
                    var user = {
                        phone: JSON.parse($.cookie(AppFunctions.userData)),
                        geo: JSON.parse($.cookie("userLocationData"))
                    }
                    AppFunctions.verify(user)
                }else{
                    AppFunctions.geoLocateUser();
                }
            }else{
                AppFunctions.initCollectUserData();
            }
        }
    },

    verify: function(user) {
        if(user.phone.verified == 0) {
            $.get(AppFunctions.URL.verify, user, function(res) {
                if(res.success == 1) {
                    console.log('The response from the server: ' + res.verified);
                    switch(res.verified) {
                        case 1: //if the user was successfully verified
                            var dt = new Date()
                            var time = dt.toLocaleTimeString();
                            var date = dt.toLocaleDateString();
                            var fulldate = date + " " + time;

                            user.phone.date = fulldate;
                            //Update the user' data in the phone storage
                            localStorage.setItem(AppFunctions.userData, JSON.stringify(user.phone));
                            break;
                        case 2: //if the user was already verified
                            statusShare.onSuccess(7); //ask user to keep sharing the app
                            console.log('The user was already verified at ' + user.phone.date);
                            break;
                    }
                }else{
                    //an error occurred try again after a lil while
                    setTimeout(statusShare.verifier(user), 10000);
                }
            }, "json")
        }else{
            console.log("The user was verified at -- " + user.phone.date)
        }
    },

    shareThis: function(params, success, error) {
        window.shareThisFuckingShit.shareThis(params, success, function() {
            //tends to fail for the 1st time, so try again
            //setTimeout(statusShare.shareThis(params, success), 500);
            alert("Failed to load sharing options, Please try again...");
        });
    },

    savingProgress: function(progress) {
        var prgs = progress * 25; //there are only 4 steps
        $('.activity-progress').animate({width: prgs + "%"}, 400, "easeInExpo", function() {
            var El = $(this);
            //If the progress bar is full, close everything.
            if(El.width() >= El.parent().width()) {
                setTimeout(function() {
                    El.parent().hide(); //itself
                    //$('.close').trigger("tap"); //saving modal.
                    //redraw the canvas to restore the default text
                    $('.activity').html(function(i, text) {
                        $(this).html($(this).data('default-text'));
                    })
                }, 500);
            }
        })
    },

    color: {
        choise: false,
        picker: $('div[data-rel="background"]') //put the starter
    },
    editCanvasColors: function() {
        var mum = $('.color-picker');
        //clone main canvas, change it's Id
        var clone = $(document.getElementById(prittyNote.canvas)).clone()
        clone.attr({id:"prittynote-cloned"}); //change it's id
        prittyNote.canvas = clone.attr("id"); //change canvas in edit phase
        $(".clone-canvas").html(clone);
        prittyNote.drawCanvas(prittyNote.getValue())

        //Show the custom color editor
        mum.show(1000, "easeOutElastic",function() {
            //Get Current color;
            $(".color-inputs").children('input').each(function() {
                var related = $(this).data('color');
                //feed the current colors to the choices data-color tags
                $('div[data-rel="' + related + '"]').attr({"data-color": $(this).val(), "data-default": $(this).val()})
                console.log(related, $(this).val());
            })
            //Assign current bg color the picker & highlight the bg
            $('input#color-picker')
                .minicolors("value", "#" + $('div[data-rel="background"]').data("color"))
            //Trigger the tapping of the background color
            $('div[data-rel="background"]').trigger("tap");
        }) //SHOW THE CUSTOM COLOR DIALOG

        //Event for color picker changes
        $(".color-choices").hammer().on('tap', 'div', function() {
            AppFunctions.color.picker = $(this)
            //highlite this
            $(this).addClass("pale-red").siblings().removeClass("pale-red");
            //change input color to this
            $('input#color-picker').minicolors("value", "#" + $(this).data("color"))
                .delay(100).minicolors("show");
        })

        //Event for CANCEL or DONE
        $(".finish-color-edit").hammer().on("tap", "img", function() {
            var action = $(this).data("action");
            var close = true;
            switch (action) {
                //in this case restore all colors and close editor
                case "cancel-edit":
                    $(".color-choices").children('div').each(function() {
                        var related = $(this).data('rel');
                        //feed the current colors to the choices data-color tags
                        $('input[data-color="' + related + '"]').val($(this).data("default"))
                        console.log(related, $(this).data('default'));
                    });
                    break;
                //in case user has finished chosing his colors
                case "done-edit":
                    //do nothing, since the colors are already assigned
                    break;

                case "show-fonts":
                    $.sidr('open', 'side-bar-fonts');
                    close = false;
                    break;
            }

            //Restore the default canvas in edit
            if(close) {
                prittyNote.canvas = "prittynote";
                setTimeout(prittyNote.drawCanvas(prittyNote.getValue()), 100);
                mum.hide(600, "easeInBack");
            }
        })

        mum.hammer()
            .on("swipeleft", function(e) {
                e.preventDefault()
                $.sidr("open", "side-bar-fonts");
            }).on("tap", function() {
                $.sidr("close", "side-bar-fonts");
            })

    }

}
