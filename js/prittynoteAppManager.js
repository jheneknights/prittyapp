/**
 *
 *@Author - Eugene Mutai
 *@Twitter - JheneKnights
 *
 * Date: 3/10/13
 * Time: 5:11 PM
 * Description: Model javascript Script for PrittyNote
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Copyright (C) 2013
 * @Version - Full, Object Oriented, Stable, Pretty
 * @Codenames - sha1: cc99d04a02371d96ecaefd2254be75b048e80373, md5: ce3d6db7d4dd0a93a5383c08809ea513
 */

var prittyNote = {

    //default prittyNote variables
    canvasSize: $(window).width() - 10,
    maxWidth: function() {
        return prittyNote.canvasSize * 0.8
    },
    x: function() {
        return (prittyNote.canvasSize - prittyNote.maxWidth())/2;
    }, //allowed width divided by 2
    y: function() {
        return prittyNote.x();
    },
    font: "24px 'Comfortaa'",
    fontSize: 28,
    drawText: undefined,
    bgImage:false,
    theImage: undefined,
    canvas: 'prittynote',
    editCanvas: false,
    userDef: false,
    limit: {
        max: 350,
        min: 2,
        images: 200
    },
    sidebars : {
        themes: $(".side-bar-themes"),
        fonts: $(".side-bar-fonts")
    },
    elapsetime: false, //time between two intervals on mouse click and hold

    URL: {
        test: "http://localhost/status/app/",
        http: "http://app.prittynote.com/app/"
    },

    setValue: function(value) {
        document.getElementsByTagName('textarea')[0].value = value;
    },

    getValue: function(){
        prittyNote.drawText = document.getElementsByTagName('textarea')[0].value;
        return prittyNote.drawText;
    },

    getStatus: function() {
        var text = prittyNote.getValue()
        prittyNote.drawCanvas(text);
    },

    //Give the user a basic IDEA of how his prittyNote will look like
    getColors: function() {
        var clr = $("#text").val(),
            bgclr = $("#bgclr").val(),
            hashtagclr = $("#hashtag").val();
        return {"text": clr, "bgcolor": bgclr, "hashtag": hashtagclr};
    },

    //FUNCTION TO DRAW THE CANVAS
    drawCanvas: function(text) {

        var image;
        var words = text.split(" ");
        var color = prittyNote.getColors();

        //make sure you use the current font size chosen
        var font = prittyNote.font.replace(/\d\d/gi, prittyNote.fontSize);
        var maxWidth = prittyNote.maxWidth();

        var clr = "#" + color.text,
            bgclr = "#" + color.bgcolor,
            hTagclr = "#" + color.hashtag;

        var lineHeight = parseFloat(font, 10) + parseFloat(font, 10)/8;

        prittyNote.clearCanvasGrid(prittyNote.canvas);

        var canvas = document.getElementById(prittyNote.canvas); //the canvas ID
        var context = canvas.getContext('2d');

        canvas.width = prittyNote.canvasSize;

        //if the user has chosen to reposition the note, use his offsets instead
        var x = prittyNote.userDef !== false ? prittyNote.userDef.x: prittyNote.x();
        var y = 0; //prittyNote.y;

        //change the max width if the user has editted the position of the note
        maxWidth = prittyNote.userDef !== false ? $(window).width() * 30: maxWidth;
        console.log("the max width: " + maxWidth)

        //If the user has added a background image
        if(prittyNote.bgImage) image = true; else image = false;

        //get the height of his text content
        var ht = prittyNote.getHeight(text, context, x, y, maxWidth, lineHeight, image);

        //To centralise the quote on the note canvas
        var offset = Math.round(canvas.width - ht.height)/2;

        if(prittyNote.userDef) {
            y =  prittyNote.userDef.y
        }else{
            //if the top offset is larger than the one set, make y that
            y =  offset < prittyNote.y() ? prittyNote.y(): offset;
        }
        console.log("This will be the top offset --", y, x, ht);

        canvas.height = canvas.width;
        context.globalAlpha = 1;

        if(image) {
            var imageObj = new Image();
            imageObj.onload = function() {
                context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
                context.fillStyle = '#000';
                context.globalAlpha = 0.5
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = clr;
                context.font = font;
                context.globalAlpha = 1
                prittyNote.wrapText(context, text, x, y, maxWidth, canvas.width, lineHeight, clr, hTagclr);
            };
            imageObj.src = prittyNote.theImage
        }else{
            context.fillStyle = bgclr;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.globalAlpha = 1;
            context.fillStyle = clr;
            context.font = font;
            prittyNote.wrapText(context, text, x, y, maxWidth, canvas.width, lineHeight, clr, hTagclr);
        }

        $("#imagepath").html("letters: " + text.length + " | words: " + words.length + " | width: " + canvas.width + "px");
        prittyNote.makePrittyNote(); //update the image in the display to as positive feedback
    },

    //function to calculate the height to assign the canvas dynamically
    getHeight: function(text, ctx,  x, y, mW, lH, img) {
        var words = text.split(" "); //all words one by one
        var c = 0, a = x,  h;
        var br = /(`)[\w]{0,}/

        $.map(words, function(wd) {
            var string = wd + " ";
            var m = ctx.measureText(string);
            var w = m.width;

            var b = br.test(string);
            if(b) y += lH, x = a, c++;

            x += w;

            if(x > mW) {
                x = a;
                y += lH;
                c++;
            }
        })

        c++
        var wrapH = (c * 2) * lH;

        h = lH + wrapH; // + lH;
        //if(img) h += lH;
        //if(h < 200) h = 200;
        return {height: h, wrapheight: wrapH, offset: y, newlines: c, text: text};
    },

    //wrap the text so as to fit in the Canvas
    wrapText: function(ctx, text, x, y, mW, cW, lH, clr, hTagclr) {

        var words = text.split(' '); //split the string into words
        var line = '', p, a = x; //required variables "a" keeps default "x" pos
        var hash = /(\#|\@)[\w]{0,}/, //match hash tags & mentions
            rest = /(\#\#)[\w]{0,}/, //match for double tags to print all the rest a diff color
            startquote = /\"[\w]{0,}/, //if start of quote
            endquote = /([\w]\"){0,}/, //end of quote
            br = /(`)[\w]{0,}/;

        var qc = 0; //will count, 0 means return color to normal

        for (var n= 0; n<words.length; n++) {
            var string = words[n] + " ";
            var m = ctx.measureText(string);
            var w = m.width; //width of word + " "

            var p = hash.test(string); //match string to regex
            var r = rest.test(string);
            var sq = startquote.test(string);
            var eq = endquote.test(string);
            var b = br.test(string);
            //console.log(pr); //debugging purposes

            //test for ## -- change color of the rest of sentence if true
            if(r) {
                ctx.fillStyle = hTagclr;
                clr = hTagclr; //change default color
                string = string.replace('##', ''); //remove the double hashtags
                w = ctx.measureText(string).width; //recalculate width to remove whitespaces left
            }
            //test for new line
            else if(b) {
                y += lH //jump downwards one more //next line
                x = a //restart writing from x = 0
                string = string.replace('`', ''); //remove the underscore
                w = ctx.measureText(string).width; //recalculate width to remove whitespaces left
            }
            else{
                //test for quotes, will depict the quote length and color it all

                if(p) { //change color of only single words with single hash tags
                    ctx.fillStyle = hTagclr;
                    string = string.replace('#', '');
                    w = ctx.measureText(string).width; //recalculate width to remove whitespaces left
                }
                //reset default text color if not
                else{
                    if(qc == 0) ctx.fillStyle = clr;
                }
            }

            ctx.fillText(string, x, y); //print it out

            x += w; //set next "x" offset for the next word

            var xnw = ctx.measureText(words[n+1] + " ").width; //check for the future next word
            var xn = x + xnw;
            //console.log(xn);

            if(xn >= cW) { //try it's existence to see if it breaks the maxW rule
                y += lH;
                x = a;
            }else{ //if it doesn't continue as if it hasn't yet bin plotted down
                if(x > mW) {
                    x = a;
                    y += lH; //new line
                }
            }
        }
        ctx.fillText(line, x, y);
    },

    //FUNCTION TO CLEAR CANVAS
    clearCanvasGrid: function(){
        var canvas = document.getElementById(prittyNote.canvas);
        var context = canvas.getContext('2d');
        //context.beginPath();

        // Store the current transformation matrix
        context.save();

        // Use the identity matrix while clearing the canvas
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Restore the transform
        context.restore(); //CLEARS THE SPECIFIC CANVAS COMPLETELY FOR NEW DRAWING
    },

    //checks to see if the chosen file is an image
    isImage: function(imagedata) {
        var allowed_types = ['gallery', 'jpeg', 'jpg', 'png', 'gif', 'bmp', 'JPEG', 'JPG', 'PNG', 'GIF', 'BMP'],
            itscool = false

        var imgtype = imagedata.toString().split(';')
        imgtype = imgtype[0].split('/')
        console.log(imgtype)

        if($.inArray(imgtype[1], allowed_types) > -1) {
            itscool = true
        }
        return itscool
    },

    readImage: function(input) {
        var image
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                image = e.target.result
                prittyNote.bgImage = prittyNote.isImage(image)
                if(prittyNote.bgImage) {
                    prittyNote.theImage = image
                    prittyNote.drawCanvas(prittyNote.getValue(), image)
                }
            }
            reader.readAsDataURL(input.files[0]);
        }
    },

    removeImage: function() {
        prittyNote.bgImage = false;
        prittyNote.drawCanvas(prittyNote.getValue())
    },

    //AJAX REQUEST TO SEND CANVAS DATA TO CREATE IMAGE
    makePrittyNote: function() {
        var canvas = prittyNote.canvas;
        var testCanvas = document.getElementById(canvas); //canvasID
        var canvasData = testCanvas.toDataURL("image/png;base64;"); //encrypt the data

        /*
        //Get 64base of the canvas image
        window.getCanvasData(testCanvas, function(image) {
             canvasData = image.data;
            $('#canvas-source').attr('src', canvasData); //test if the image is a valid image
        });*/

        return canvasData;
    },

    downloadPrittyNote: function() {
        //Redraw the prittyNote
        prittyNote.drawCanvas(prittyNote.getValue());

        //get the Base64 of the image for dowload
        var myBase64 = prittyNote.makePrittyNote();
        //myBase64 = myBase64.replace('data:image/png;base64,', '');
        //console.log(myBase64);

        //now download the image to storage
        prittyNote.download.webPlatform(myBase64); //fromJava(myBase64);
        console.log("Now downloading the Image to SDcard");
    },

    download: {
        fromJava: function(myBase64) {
            //Shows how to use optional parameters
            window.plugins.base64ToPNG.saveImage(myBase64,
                {filename:"PrittyNote", overwrite: true, folder: "PrittyNote", shareThis: true},
                function(result) {
                    console.log(result);
                    //now prompt sharing of the image
                }, function(error) {
                    console.log(error);
                }
            );
        },

        fromServer: function(myBase64) {
            console.log("Image data sent to the server...");
            $.post("http://prittynote.com/app/canvastopng.php", {data: myBase64}, function(data) {
                if(data.success == 0) {
                    alert(data.message);
                }else{
                    console.log("image was successfully created in the servers");
                    var options = {overwrite: true};
                    /*window.plugins.downloader.downloadFile(data.fullpath, options,
                        function(res) {
                            alert(JSON.stringify(result));
                        }, function(error) {
                            alert(error);
                        }
                    );*/
                }
            }, "json");
        },

        webPlatform: function(myBase64) {
            var downloadImage  = $('a[data-action="download"]');
            // When the download link is clicked, get the
            // DataURL of the image and set it as href:
            var url = myBase64;
            downloadImage.attr('href', url);
            //Now trigger the image to be downloaded
            downloadImage.trigger('click').trigger('click');
            console.log("The image download was triggered");
        }
    },

    //AFTER GETING RESPONSE FROM THE CANVASTOPNG SEND DATA TO MATCH THE IMAGE AND LOCATION IN AN ARRAY/JSON FILE
    imageMergedata: function(imgid, userId, imgpath) {
        var echo = '<img src="../images/accept.png" alt="OK" title="Success"/>';
        $.get("./getlocajax.php", {imgid: imgid, user: userId, text: prittyNote.getValue(), path: imgpath},
            function(data) {
                $("#imagepath").html(echo + " " + data.message);
                $("#" + prittyNote.canvas).wrap('<a target="_blank" href="' + data.path +'" title="' + data.text +'" />');
            }, "json");
    },

    makeDemoNotes: function() {
        //!st check if the browser supports LocalStorage technology
        if(localStorage) { //If it does
            if(localStorage.getItem('demoImages') == (null || "NaN")) {
                localStorage.setItem('demoImages', "1");
                prittyNote.downloadPrittyNote();
            }else{
                console.log("The number of notes the user has created are --> " + parseInt(localStorage.getItem('demoImages')));
                if(parseInt(localStorage.getItem('demoImages')) >= prittyNote.limit.images) {
                    $('#loadingPrefh2').css('color', '#cc0000').html('Oops! That\'s all you can make. Please purchase the PRO version to be able to make more cool PrittyNotes, Thank you!').parent().show();
                    $('.purchaseBtn').css('visibility', 'visible');
                }else{
                    var newValue = parseInt(localStorage.getItem('demoImages')) + 1;
                    localStorage.setItem('demoImages', newValue);
                    prittyNote.downloadPrittyNote();
                }
            }
        } //If the browser is an old one, and doesn't support LocalStorage, fallback to Cookies
        else{
            if($.cookie('demoImages') == null) {
                $.cookie('demoImages', 1, { expires: 1000, path: '/' });
                prittyNote.downloadPrittyNote();
            }else{
                conole.log("The number of notes the user has created are --> " + parseInt($.cookie('demoImages')));
                if(parseInt($.cookie('demoImages')) > prittyNote.limit.images) { //prevent more images from being made
                    $('#loadingPrefh2').css('color', '#cc0000').html('Oops! That\'s all you can make. Please purchase the PRO version to be able to make more cool PrittyNotes, Thank you!').parent().show();
                    $('.purchaseBtn').css('visibility', 'visible');
                }else{ //else count them, and make images
                    var newValue = parseInt($.cookie('demoImages')) + 1;
                    $.cookie('demoImages', newValue);
                    prittyNote.downloadPrittyNote();
                }
            }
        } //$('#loadingPref').fadeOut(200)
    },

    //function to check the string length, max characters
    checkTextLength: function() {
        var text = prittyNote.getValue(),
            len = text.length;
        //MAX allowed is 350
        if(len > prittyNote.limit.max) {
            prittyNote.drawCanvas('#Oh #Snap! You\'ve #written too much!')
        }
        else if(len < prittyNote.limit.min) { //least allowed is 20
            prittyNote.drawCanvas('#Hmmm! You\'ve barely #written anything!')
        }
        else{//if everything is okay in between 20 - 350
            prittyNote.drawCanvas(text);
        }
    },

    keyEvents: function() {
        $('#image').on('change', function() {
            prittyNote.readImage(this)
        })
        $('.removeBg').on('click', function() {
            prittyNote.removeImage()
        })
        $('input[data-color]').each(function() {
           $(this).on({
               focus: function() {
                   $(this).trigger('change');
                   //$.map(['blur', 'change', 'focus'], function(a) { $(this).trigger(a); });
                   console.log("triggered Keyup -- color selected", $(this).data('color'));
               },
               change: function() {
                   prittyNote.getColors();
                   prittyNote.checkTextLength();
               },
               blur: prittyNote.checkTextLength()
           })
        })
        $('a').on('click', function(e) {
            e.preventDefault();
        })

    },

    //when the user presses the back button
    onMouseDownOrUp: function(pos) {
        prittyNote.userDef = {x: pos.left, y: pos.top}
        prittyNote.drawCanvas(prittyNote.getValue())
    },

    getTimeDifference: function(earlierDate, laterDate) {
        var nTotalDiff = laterDate.getTime() - earlierDate.getTime();
        var oDiff = new Object();

        oDiff.days = Math.floor(nTotalDiff/1000/60/60/24);
        nTotalDiff -= oDiff.days*1000*60*60*24;

        oDiff.hours = Math.floor(nTotalDiff/1000/60/60);
        nTotalDiff -= oDiff.hours*1000*60*60;

        oDiff.minutes = Math.floor(nTotalDiff/1000/60);
        nTotalDiff -= oDiff.minutes*1000*60;

        oDiff.seconds = Math.floor(nTotalDiff/1000);
        return oDiff;
    },

    loadScript: function(url, callback) {
        var script = document.createElement("script")
        script.type = "text/javascript";

        if(script.readyState){  //IE
            script.onreadystatechange = function(){
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    if(typeof callback == "function") callback();
                }
            };
        }else{  //Others
            script.onload = function() {
                if(typeof callback == "function") callback(); //make sure it is a function
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

};


//++++++++++++++++++ load Utilities jQuery Plug-in ++++++++++++++++++++++++
(function ($) {

    var families = [], fonts = [], s = "";

    $.fn.extend({
        initPrittyNote: function() {
            loadUtilities(this);
        }
    })

    loadUtilities = function(el) {

        var defaults = {
            fileorurl: './js/stickinoteUtilitiesTRY.json',
            script:  {
                google: "http://ajax.googleapis.com/ajax/libs/webfont/1.0.31/webfont.js",
                fontface: "./js/jquery.fontface.js",
                load: false
            },
            fontPath: "./fonts/",
            loadIndicator: $('.logo p'),
            loader: $('.show-app-progress')
        }

        var use = defaults;
        console.log("Script loaded and executed."); //let me know in the console log that the fonts have loaded

        //Load the required fonts from the fonts-folder  //the server through GooGle - DEPRECATED
        $.getScript(use.script.fontface, function() {
            //get the required JSON FILE to locate themes & fonts
            $.getJSON(use.fileorurl, function(json) {

                var pallete = json.data.palletes;
                console.log('Total Themes that are Loaded -- ' + pallete.length)

                var startVal = 0
                var adVal = 50/pallete.length;

                //++++++ LOADING THEMES ++++++
                //now build the theme select option
                $.each(pallete, function(x, p) {
                    $('ul#themes').append('<li data-theme="' + p.name + '">' + p.name + '</li>');
                    $('li[data-theme="' + p.name + '"]').css({backgroundColor: '#' + p.color[0], color: '#' + p.color[1]});
                    startVal += adVal;
                    use.loader.animate({width: startVal + "%"}, 50, "easeOutExpo")
                    console.log("Loaded theme...");
                });


                fonts = json.data.fonts;
                prittyNote.font = fonts[1].string //for testing purposes
                //StartVal I presume is at "50 + %" now
                adVal = 50/fonts.length;

                //now begin building the theme option
                $.each(fonts, function (e, w) {
                    //Load each font stupidly with getJSON, actually will load it
                    $.getJSON(use.fontPath + w.font, function() {}).always(function() {
                        //use response always, its actual function will do nothing
                        families.push(w.name);
                        $('ul#fonts').append('<li data-size="' + parseInt(w.string) + '" data-font="' + w.name + '">' + w.name + '</li>')
                        setTimeout(function() {
                            $('li[data-font="' + w.name + '"]')
                                .fontface({
                                    fontName: w.name, //the font name
                                    fileName: w.font, //and path
                                    fontSize: parseInt(w.string) + "px" //the font size
                                })
                                .fontApply({ //apply the font to this specific element
                                    fontFamily: w.name
                                    //fontSize: parseInt(w.string) + 'px'
                                })
                            startVal += adVal;
                            setTimeout(function() {
                                use.loader.animate({width: startVal + "%"}, 50, "easeInOutCubic")
                            }, 0)
                            console.log("Loaded fonts now...");
                        }, 100)
                    })

                });

                //get the width of the parent progress bar //288
                var parentW = use.loader.parent().width()

                var draw = false;
                var Utilities = setInterval(function() {
                    if(use.loader.width() > parentW * 0.95) {
                        use.loadIndicator.html("Just a second please..");
                        console.log(families.toString());
                        //now draw the example canvas
                        if(draw == false) prittyNote.drawCanvas(prittyNote.getValue()), draw = true;
                        use.loadIndicator.html('Yaaeey! We good to go!');
                        if($('canvas#prittynote').width() > 200) {
                            clearInterval(Utilities);
                            setTimeout(function() {
                                $('.loading').fadeOut(1000)
                            }, 1000); //now remove the loading panel now
                        }
                    }
                    else if(use.loader.width() > (parentW/2)) {
                        use.loadIndicator.html("Loading Fonts now...")
                    }else{
                        use.loadIndicator.html("Loading Themes...")
                    }
                }, 50);

                //now bind each select element to it's response function
                $("ul#themes").on("click", 'li', function() {
                    installPallette($(this), pallete); //start keep watch in the select changes
                });

                $("ul#fonts").on("click", 'li', function() {
                    installFont($(this), fonts); //start keep watch in the select changes
                });

            })

        });
    }

    installPallette =  function(el, pallete) {
        var p = el.data('theme'); //get the selected value of the palettes
        //loop thru the palette matching the required palette request
        var x = $.grep(pallete, function(a,b) {
             return a.name == p;
        })

        var colors = x[0].color;
        console.log(p, colors);
        $("#bgclr").val(colors[0])
        $("#text").val(colors[1])
        $("#hashtag").val(colors[2])
        prittyNote.drawCanvas(prittyNote.getValue());
        closeSideBars()
    }

    installFont = function(el) {
        var f = el.data('font');
        var x = $.grep(fonts, function(a,b) { // loop through the fonts getting the corresponding font match
            return f == a.name;
        })

        var font = x[0];
        prittyNote.font = font.string; //if found assign to font as the defualt in use from now
        prittyNote.drawCanvas(prittyNote.getValue());
        closeSideBars()
    }

    closeSideBars = function() {
        $.sidr('close', 'side-bar-themes'); //close all side bars
        $.sidr('close', 'side-bar-fonts');
    }

})(jQuery);
