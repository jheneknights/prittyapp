/**
 *
 *@Author - Eugene Mutai
 *@Twitter - JheneKnights
 *@Email - eugenemutai@gmail.com
 *
 * Date:    03/10/13
 * Time: 3:38 PM
 * Description: PrittyNote Design and Font Management Plug in
 *
 * @Copyright (C) 2013
 * @Version - Stable
 *
 * @Full-Version
 * @codename sha1: 40118f4423be023d2c7af59e3b33a68a0a430f6e(debugged), md5: 828fd0874bd55a2c6746df08f53a1399
 */

var maxWidth = 350, y = 60, font = '24pt Arial', drawText, bgImage = false, theImage;

//GET THE USER'S INPUT
function getStatus(value) {
    drawCanvas(getValue());
}

function getValue(){
    var drawText = document.field.q.value
    return drawText ;
}

function setValue(value) {
    document.field.q.value = value
}

//Give the user a basic IDEA of how his pictate will look like
function getColors() {
    var clr = $("#text").val(),
        bgclr = $("#bgclr").val(),
        hashtagclr = $("#hashtag").val();
    return {"text":clr, "bgcolor":bgclr, "hashtag":hashtagclr};
}

//FUNCTION TO DRAW THE CANVAS
function drawCanvas(text, image) {

    var words = text.split(" ");
    var color = getColors();

    var clr = "#" + color.text,
        bgclr = "#" + color.bgcolor,
        hTagclr = "#" + color.hashtag

    var lineHeight = parseFloat(font, 10) + parseFloat(font, 10)/8;

    clearCanvasGrid("statuscanvas");

    var canvas = document.getElementById("statuscanvas"); //the canvas ID
    var context = canvas.getContext('2d');

    canvas.width = 450;
    var x = (canvas.width - maxWidth)/2;

    if(bgImage) image = true; else image = false;

    var ht = getHeight(text, context, x, y, maxWidth, lineHeight, image);
    canvas.height = ht;

    context.globalAlpha = 1

    if(bgImage) {
        var imageObj = new Image();
        imageObj.onload = function() {
            context.drawImage(imageObj, 0, 0, canvas.width, ht);
            context.fillStyle = '#000';
            context.globalAlpha = 0.5
            context.fillRect(0, 0, canvas.width, ht);
            context.fillStyle = clr;
            context.font = font;
            context.globalAlpha = 1
            wrapText(context, text, x, y, maxWidth, canvas.width, lineHeight, clr, hTagclr);
        };
        imageObj.src = theImage
    }else{
        context.fillStyle = bgclr;
        context.fillRect(0, 0, canvas.width, ht);
        context.globalAlpha = 1
        context.fillStyle = clr;
        context.font = font;
        wrapText(context, text, x, y, maxWidth, canvas.width, lineHeight, clr, hTagclr);
    }

    $("#imagepath").html("letters: " + text.length + " | words: " + words.length + " | height: " + ht + "px")

}

//function to calculate the height to assign the canvas dynamically
function getHeight(text, ctx,  x, y, mW, lH, img) {
    var words = text.split(" "); //all words one by one
    var c = 1, a = x,  h;
    var br = /(`)[\w]{0,}/

    for(var n=0; n < words.length; n++) {
        var string = words[n] + " ";
        var m = ctx.measureText(string);
        var w = m.width;

        var b = br.test(string);
        if(b) y += lH, x = a, c++;

        x += w;

        if(x > mW){
            x = a;
            y += lH;
            c++;
        }
    }

    var wrapH = c*lH

    h = (y + y/2) + wrapH; // + lH;
    if(img) h += lH;
    if(h < 200) h = 200;
    return h;
}

//wrap the text so as to fit in the Canvas
function wrapText(ctx, text, x, y, mW, cW, lH, clr, hTagclr) {

    var words = text.split(' '); //split the string into words
    var line = '', p, a = x; //required variables "a" keeps default "x" pos
    var hash = /(\#|\@)[\w]{0,}/, //match hash tags & mentions
        rest = /(\#\#)[\w]{0,}/, //match for double tags to print all the rest a diff color
    //quoted = /\"[\w]\"{0,}/, //if quoted
        br = /(`)[\w]{0,}/

    for (var n= 0; n<words.length; n++) {
        var string = words[n] + " ";
        var m = ctx.measureText(string);
        var w = m.width; //width of word + " "

        var p = hash.test(string); //match string to regex
        var r = rest.test(string);
        var q = false; //quoted.test(string);
        var b = br.test(string);
        //console.log(pr); //debugging purposes

        if(r == true) { //change color of the rest of sentense if true
            ctx.fillStyle = hTagclr;
            clr = hTagclr; //change default color
            string = string.replace('##', ''); //remove the double hashtags
            w = ctx.measureText(string).width; //recalculate width to remove whitespaces left
        }else if(b) {
            y += lH //jump downwards one more //nextline
            x = a //restart writing from x = 0
            string = string.replace('`', ''); //remove the underscore
            w = ctx.measureText(string).width; //recalculate width to remove whitespaces left
        }else{
            if(p == true || q == true) { //change color of only single words with single hashtags
                ctx.fillStyle = hTagclr;
                string = string.replace('#', '');
                w = ctx.measureText(string).width; //recalculate width to remove whitespaces left
            }else{ //reset default text color if not
                ctx.fillStyle = clr;
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
}

function readImage(input) {
    var image, imgtype
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            image = e.target.result
            bgImage = isImage(image)
            if(bgImage) {
                theImage = image
                drawCanvas(getValue(), image)
            }
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function isImage(imagedata) {
    var allowed_types = ['jpeg', 'png', 'jpg', 'gif', 'bmp', 'JPEG', 'JPG', 'PNG', 'GIF', 'BMP']

    var imgtype = imagedata.toString().split(';')
    imgtype = imgtype[0].split('/')
    console.log(imgtype)

    if($.inArray(imgtype[1], allowed_types) > -1) {
        var itscool = true
    }else{
        var itscool = false
    }
    return itscool
}

function removeBg() {
    bgImage = false
    drawCanvas(getValue())
}

function keyEvents() {
    $('#image').bind('change', function() {
        readImage(this)
    })
    $('.removeBg').bind('click', function() {
        removeBg()
    })
}

//FUNCTION TO CLEAR CANVAS
function clearCanvasGrid(canvasname){
    var canvas = document.getElementById(canvasname); //because we are looping //each location has its own canvas ID
    var context = canvas.getContext('2d');
    //context.beginPath();

    // Store the current transformation matrix
    context.save();

    // Use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the transform
    context.restore(); //CLEARS THE SPECIFIC CANVAS COMPLETELY FOR NEW DRAWING
}

//AJAX REQUEST TO SEND CANVAS DATA TO CREATE IMAGE
function getImage(canvas) {
    var testCanvas = document.getElementById(canvas); //canvasID
    var canvasData = testCanvas.toDataURL("image/png"); //encrypte the data

    $('.createImagebtn .label').html("Just a moment...")
    $('.createImagebtn').removeClass('redbtn').addClass('greenbtn')
    $.post("./canvastopng.php", {data: canvasData}, function(data) {
        if(data.success == 0) {
            //$("#notify").html('<img src="./images/delete.png" align="absmiddle" />  ' +
            //data.message + ' : ' + data.name + '(' + data.size +')')
        }else{
            $('.createImagebtn .label').html("Create Another Image")
            $('.createImagebtn').removeClass('greenbtn').addClass('redbtn')
            window.location = "./canvastopng.php?d=" + data.name //promp the image to be downloaded automatically
            if($.cv.defaults.selected == (true || 1 || "yes")) {
                $("#notify").value = "Create Image"
                //$(this).remove() //remove it completely from DOM
            } //my secret is here.
        }
        //$(".createImagebtn").css({"background-color": "#0b0", "border":"2px solid #009900"})
        //$("#notify").css(use.styling)
        $.cv.count++
    }, "json");
    //use the data you get back to join both the location data and the image created associated with it
}

//AFTER GETING RESPONSE FROM THE CANVASTOPNG SEND DATA TO MATCH THE IMAGE AND LOCATION IN AN ARRAY/JSON FILE
function imageMergedata(imgid, userId, imgpath) {
    var echo = '<img src="../images/accept.png" alt="OK" title="Success"/>';
    $.get("./getlocajax.php", {imgid: imgid, user: userId, text: getValue(), path: imgpath},
        function(data) {
            $("#imagepath").html(echo + " " + data.message);
            $("#statuscanvas").wrap('<a target="_blank" href="' + data.path +'" title="' + data.text +'" />');
        }, "json");
}

//function to check the string length, max characters
function checkTextLength() {
    var text = getValue(),
        len = text.length,
        e = $("#post");
    //MAX allowed is 350
    if(len > 350) {
        drawCanvas('#Oh #Snap! You\'ve #written too much!')
    }
    else if(len < 20) { //least allowed is 20
        drawCanvas('#Hmmm! You\'ve barely #written anything!')
    }
    else{//if everthing is okay in between 20 - 350
        drawCanvas(text);
    }
}

var tweets = [], tweetIds = []
function loadTweets() {

    $('.preserveForm .loadTweets').remove()
    var pFclone = $('.preserveForm').clone()

    $.fn.pullTweets =  function(height, width) {
        $(this).html('<h2 style="border-bottom: 1px solid #bbb; padding: 3px; margin: 0">tweets ' +
            '<span id="showRefreshing" style="font-size: 11px; color: #87cefa;">loading</span></h2>' +
            '<div class="Tw"></div>')


        console.log($(this).selector)
        if($(this).selector !== '.writeform') $(this).css({float: 'left', width: 300, height: height, "border-left": "1px solid #e8e8e8", "margin-top": 0, "margin-left": '5px'})

        $('.Tw') //show loading image
            .animate({'height': height - 100, 'width': 300}, 600, function() {
                $(this)
                    .css({ 'overflowY': 'scroll', 'overflowX': 'hidden', 'border-bottom': '1px solid #aaa'})
                    .append('<img id="loadingCircle" src="../images/325.gif" style="position: relative; top: 40%; left: 40%" alt="Loading Tweets..." />')
            })
        if(width < 280) $(pFclone).insertAfter('.Tw')
        //$('.content').css('margin', 0).css('margin-left', newMargin)
        refreshTweets()
    }

    $('.footer').animate({"font-size": "1em", "left": 0}, 600)

    var widthNeeded = $(window).width() - 820
    if(widthNeeded >= 300) {//if there is enough space to put Twitter content on the side
        var newMargin = ($(window).width() - (820 + 300)) / 2 //now determine the margin for equal division
        $('.content').animate({marginLeft: newMargin}, 300, function() {
            //$(this).wrap('<div class="wrapper">')
            $(this).append('<div class="loadTweets"></div>').css({width:'100%', height: 'auto'})
            setTimeout(function() {
                if($('div.loadTweets')) {
                    $('div.loadTweets').pullTweets($(window).height(), 300)
                }

            }, 300)
            })
    }else{
        $('.writeform')
            .empty() //remove everything from element
            .pullTweets(400, widthNeeded)
    }
    setTimeout(function(){
        setRefresh() //enable refreshing of tweets
    }, 20000)//after 10 seconds
}

//function to fetch new tweets every minute
function refreshTweets() {
    var fileorurl
    //check to see if tweets were previously loaded
    if(tweets.length == 0) {
        fileorurl = './home-timeline.php'
        $('#showRefreshing').html('loading tweets...')
    }else{ //if true, get the latest last tweet ID, for refreshing
        var last = Math.max.apply(null, tweetIds);
        fileorurl = './home-timeline.php?last=' + encodeURIComponent(last)
        $('#showRefreshing').html('loading more tweets...')
    }
    //get the last latest tweet depending on maximum id
    //now request for new tweets
    //fileorurl = './dump/jheneknights-timeline.json' //- for debugging purposes
    $.getJSON(fileorurl, function(json) {
        if(tweets.length == 0) $('#loadingCircle').remove()
        if(json.success == 1) {
            //$('.Tw').empty() //remove the loading bar and all the other tweets
            $.map(json.data, function(t, i) {
                tweets.push({id: t.id, tweet: t.text})
                tweetIds.push(t.id)
                var tw = '<table class="tweets" data-id="' + t.id +'">' +
                    '<tr>' +
                    '<td class="profilepic">' +
                    '<img src="' + t.user.profile_image_url + '" alt="Profile Picture" />' +
                    '</td>' +
                    '<td class="body">' +
                    '<h4>' + t.user.screen_name + '</h4>' +
                    '<p id="tw">' + t.text + '</p>' +
                    '</td>' +
                    '</tr>' +
                    '</table>'
                $('.Tw').prepend(tw)
            })
            $('#showRefreshing').html('')
            $('.tweets').css({cursor: 'pointer', 'border-bottom': '#f2f2f2 solid 1px', width: '100%'})

            $('.tweets').bind('mouseover', function(){
                $(this).css({backgroundColor: '#fefac6'})
            })
            $('.tweets').bind('mouseout', function(){
                $(this).css({backgroundColor: '#fefefe'})
            })

            //create the onClick bind event
            $('.tweets').bind('click', function() {
                var twId = $(this).attr('data-id') //the ID of the tweet, unique to each
                $.map(tweets, function(a,b) {
                    if(twId == a.id) {
                        drawText = a.tweet //set as defualt drawingText
                        drawCanvas(a.tweet)
                        setValue(decodeURIComponent(a.tweet)) //load into text area
                        //console.log(a.tweet) //debugging purposes
                    }
                })
            })
        }else{
            //if the user is not logged in
            if(json.success == 0) {
                $('#loadingPrefh2').html("Oops! Let's go log in to Twitter first")
                $('#loadingPref').fadeIn(300, function() {
                    window.location = json.redirect //redirect him so as to log in
                })
            }
            //failed to load tweets
            if(json.success == 2) console.log(json.message), $('#showRefreshing').html(json.message)
        }
    })

}

//Function to enable the fetching of new tweets after every minute
function setRefresh() {
    keyEvents() //rebind to refresh events set
    var refresh = setInterval(function() {
        trimTweets()
        refreshTweets()
    }, 20000) //fetch new tweets after evry 10 seconds
}


//function to check for too many tweets in DIV so trim them down to required number
function trimTweets() {
    var len = $('.tweets').length
    console.log(len) //total tweets in number
    if(len > 300) {
        tweets = tweets.sort(function(a,b) { return b.id - a.id}) //sort by largest Id to lowest
        //console.log(tweets)
        tweetIds = tweetIds.sort(function(a,b) { return b - a})
        //reduce the number of Ids and TweetArray to 300 if more
        tweetIds.length = 300; tweets.length = 300;
        //console.log(tweetIds)
        $('.tweets').each(function(e) {
            var Id = $(this).attr('data-id')
            if($.inArray(Id, tweetIds) == -1) $(this).remove()
        })
    }
}


//+++++++++ My 1St jQuery Function +++++++++
(function ($) {

    var families = [], pallete = [], fonts = [],s = "", f = "", d

    $.fn.extend({

        loadUtilities: function(options) {

            var el = this
            var defaults = {
                fileorurl: './js/stickinoteUtilitiesTRY.json'
            }

            var use = $.extend({}, defaults, options);

            //Put a loading cover on the APP to prevent usage till full optimisation
            $('body').append('<div id="loadingPref" style="position: absolute; top:0; left: 0; width:100%; height: 100%; background: #fefefe; opacity: 0.8"><h2 id="loadingPrefh2"  style="text-align: center; margin-top: 30%"></h2></div>');

            $('#loadingPrefh2').html('Loading Fonts...')
            //Load the required fonts from the server through GooGle
            $.getScript("http://ajax.googleapis.com/ajax/libs/webfont/1.0.31/webfont.js", function() {
                console.log("Script loaded and executed."); //let me know in the console log that the fonts have loaded
                $('#loadingPrefh2').html('Loading Themes....')
            });

            WebFontConfig = {
                google: {
                    families:[
                        "Architects Daughter", "Arvo::latin", "Amarante", "Averia Sans Libre"
                        ,"Cabin+Sketch:700:latin", "Crafty Girls",  "Combo", "Comfortaa", "Coming Soon",
                        "Dancing+Script:700:latin", "Delius Swash Caps", "Didact Gothic", "Dosis",
                        "Electrolize",
                        "Griffy", "Gloria Hallelujah",
                        "Handlee", "Happy Monkey", "Homemade Apple",
                        "Imprima", "IM Fell Great Primer",
                        "Just Me Again Down Here", "Josefin Slab", "Julee", "Jura",
                        "Kaushan Script",
                        "Love Ya Like A Sister",
                        "Macondo", "McLaren", "Marmelad", "Metamorphous", "MedievalSharp", "Miniver",
                        "Oregano", "Orienta", "Oxygen",
                        "Patrick Hand", "Pacifico", "Princess Sofia", "Puritan",
                        "Quicksand", "Quando",
                        "Raleway:400", "Ribeye Marrow", "Rock Salt",
                        "Schoolbell", "Special Elite","Spirax", "Swanky and Moo Moo", "Sofia",
                        "Ubuntu", "Unkempt",
                        "Waiting for the Sunrise",
                        "Varela Round", "Vollkorn"
                    ]
                },

                loading: function() {
                    //do someting whie fonts are loading
                    console.log("Total Font to be loaded -- " + WebFontConfig.google.families.length)
                },

                active: function() { //when finished

                    $.getJSON(use.fileorurl, function(json) {

                        pallete = json.data.palletes,
                            fonts = json.data.fonts

                        console.log('Total Themes that are Loaded -- ' + pallete.length)
                        font = fonts[1].string //for testing purposes
                        $('#loadingPrefh2').html('Doing a little cleaning...')

                        //now build the theme select option
                        $.each(pallete, function(x, p) {
                            s = s + '<option value="' + p.name + '">' + p.name + '</option>' ;
                        });
                        //finalise the theme option
                        s = '<select id="pallete">' + s + '</select>'; //pap!!
                        //console.log(s)

                        //now begin buliding the theme option
                        $.each(fonts, function (e, w) {
                            families.push(w.name);
                            f = f + '<option value="' + w.name + '">' + w.name + '</option>';
                        });
                        f = '<select id="font">' + f + "</select>";
                        d = 'Themes: ' + s + ' Fonts: ' + f; //now join the th two and post them

                        //console.log(el)
                        $(el).html(d); //finally display the choises available

                        //now bind each select element to it's response function
                        $("#pallete").bind("change", function() {
                            installPallette(); //start keep watch in the select changes
                        });

                        $("#font").bind("change", function() {
                            installFont(); //start keep watch in the select changes
                        });

                    })
                    console.log(families.toString());
                    $('#loadingPrefh2').html('Yaaeey! We good to go!')
                    setTimeout( function() {
                        $('#loadingPref').fadeOut(200, function(){
                            drawCanvas(getValue()); //now draw the example canvas
                        })
                    }, 500) //now remove the loading panel now
                }
            }
        }
    })

    function installPallette() {
        var p = $("#pallete").val(); //get the selected value of the pallete
        var bgclr, text, htclr; //declare variables 1st
        //console.log(p)
        $.map(pallete, function(a,b) {
            if(a.name == p){ //loop thru the pallette matching the required pallette request
                bgclr = a.color[0]; //put in assigned vars
                text =  a.color[1];
                htclr = a.color[2];
                //console.log(a.color)
            }
        })

        $("#bgclr").val(bgclr).css({"background": "#" + bgclr}); //give back the variables & mod where needed
        $("#text").val(text).css({"background": "#" + text});
        $("#hashtag").val(htclr).css({"background": "#" + htclr});
        drawCanvas(getValue());
    }

    function installFont() {
        var f = $("#font").val();

        $.map(fonts, function(a,b) { // loop through the fonts getting the corresponding font match
            if(a.name == f) {
                font = a.string; //if found assign to font as the defualt in use from now
                drawCanvas(getValue());
                //console.log(font); //log it in console to confirm that it is working
                // break; //all is done no more looping
            }
        })
    }

})(jQuery)

