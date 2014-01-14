/**
 *
 *@Author - Eugene Mutai
 *@Twitter - JheneKnights
 *
 * Date: 6/15/13
 * Time: 10:51 AM
 * Description: My Range input plug in
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Copyright (C) 2013
 * @Version -
 */

(function($) {

    $.fn.extend({
        rangeInput: function(options) {
            var defaults = {
                input: $(this), //also has the default value -- val()
                min: parseInt($(this).attr('min')),
                max: parseInt($(this).attr('max')),
                def: $(this).val(),
                bar: $('.range-progress-bar'),
                handle: $('.input-handler')
            }

           var use = $.extend({}, defaults, options)
           console.log(use);
           initRange(use)
        }
    })

    //now create the font changing system
    initRange = function(el) {
        var range = el.max - el.min;
        var bar = el.bar;
        console.log(range, bar.width());
        //Event to handle any position the bar is clicked at
        bar.click(function(e) {
            var left = e.pageX - bar.offset().left; //get the position offset from window left
            //Do the animation the calculation
            el.handle.animate({left: left}, 600, "easeOutQuint", function() {
                var add = Math.round((left * range)/bar.width()) //get a definite number
                var fontSize = el.min + add;
                console.log(fontSize)
                el.input.val(fontSize).data('value', fontSize).change(); //put fontsize, then trigger change
            })
        })

        /*//Event to handle when the handler is dragged
        el.handle.mousedown(function() {
            var h = $(this);
            var maxleft = bar.width() - h.width()/2;
            var minleft = bar.offset().left - h.width()/2;
            //user has to click the handler
            bar.mousemove(function(e) {
                var left = e.pageX - bar.offset().left;
                //Let it not go past it's borders
                left = left > maxleft ? maxleft: left;
                left = left < minleft ? minleft: left;
                h.css({left: left}); //move it.
                //console.log(left)
                var add = Math.round((left * range)/bar.width()) //get a definite number
                var fontSize = el.min + add;
                console.log(fontSize)
                el.input.val(fontSize).change(); //put fontsize, then trigger change
            })

            h
        }).mouseup(function() {
                bar.off("mousemove");
            })*/

        //ON SMART PHONE TOUCH EVENT
        bar.on("touchstart", function(e) {
            console.log(e.originalEvent);
            var h = el.handle, left;
            var maxleft = bar.width() - h.width()/2;
            var minleft = bar.offset().left - h.width()/2;

            bar.on("touchmove", function(e) {
                //console.log(e);
                var g = e.originalEvent;
                var left = g.pageX - bar.offset().left;
                //Let it not go past it's borders
                left = left > maxleft ? maxleft: left;
                left = left < minleft ? minleft: left;
                h.css({left: left}); //move it.

            })
            //when user lift off the finger from the handler
            bar.on("touchend", function(e) {
                    if(e.type == "touchend") {
                        var add = Math.round((left * range)/bar.width()) //get a definite number
                        var fontSize = el.min + add;
                        console.log(fontSize)
                        el.input.val(fontSize).delay(100).change(); //put fontsize, then trigger change
                        bar.off("touchmove");
                    }
                })
        })

        //Event to handle when the fontSize is changed in input
        el.input.change(function() {
            var fSz = parseInt($(this).data('value'));
            //if the font is larger than the one stated.
            fSz = fSz > el.max ? el.max: fSz;
            //if the font is smaller than the one set
            fSz = fSz < el.min ? el.min: fSz;

            prittyNote.fontSize = fSz;
            setTimeout(prittyNote.drawCanvas(prittyNote.getValue()), 100);
            console.log(prittyNote.font);
        });

        //Place the handler to the default position 1st
        var pos = ((el.def - el.min) * bar.width())/range;
        el.handle.css({left: pos});

        //Finally hide it to toggle it later
        $('.font-control').hide();
    }

})(jQuery)
