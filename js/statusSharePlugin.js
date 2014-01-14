/**
 *
 *@Author - Eugene Mutai
 *@Twitter - JheneKnights
 *
 * Date: 6/17/13
 * Time: 2:11 PM
 * Description:
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Copyright (C) 2013
 * @Version -
 */

var Statuses, refresh = false, Collect = new Array(), keyword;
var statusShare = {

    //App's functional elements
    $: {
        searchBar: $('.search-bar'), //toggle the searchbar
        searchInput: $('#status-search'), //control of the input in searchbar
        contentWrapper: $('#search-wrapper'), //where all the statuses are loaded to and listed
        stuffListing: $("ul#stuff"),
        overLay: $('.overlay'),
        activityBar: null, //the bar that depicts the activity of the app
        activityIndicator:  $('.status-activity'), //the text
        results: $('.noresults'), //el for incase of noresults
        counter: $('.ftcounter') //app number of statuses available logging,
    },

    serviceURL: prittyNote.URL.http,
    scroll: function() {
        statusShare.$.contentWrapper.mCustomScrollbar({
            theme: "dark-2",
            autoDraggerLength: true,
            advanced:{
                updateOnContentResize: true
            }
        })
    },

    init: function() {
        statusShare.totalStuff();
        statusShare.$.searchBar.hammer().on("tap", "td", function(e) {
            e.stopPropagation();
            var action = $(this).data('action');
            switch (action) {
                case "status-search":
                    $('.' + action).hide("fast", function() {
                        $(".overlay").show()
                    });
                    break;
                case "search":
                    var val = $('#status-search').val();
                    statusShare.stringlength(val);
                    break;
                case "random":
                    statusShare.getRandomStuff();
                    break;
                case "none":
                    //do nothing
                    break;
            }
        })

        statusShare.$.stuffListing.hammer().on("doubletap", "li", function() {
            var Text = $(this).text();
            console.log(Text);
            $('#input-text').val(Text);
            setTimeout(function() {
                $('td[data-action="status-search"]').trigger("tap");
            }, 0)
        })

        statusShare.scroll();
    },

    searchStatus: function(query) {
        keyword = query;
        // statusShare.$.contentWrapper.css({opacity: 0.7});
        $.getJSON(statusShare.serviceURL + "xbsearch.php?q=" + encodeURIComponent(query), function (data) {
            switch(data.success) { //IF RESULTS ARE FOUND
                case 1:
                    statusShare.$.stuffListing.children().remove()
                    //remove all li, that were there due to previous search
                    statusShare.$.stuffListing.prepend('<li class="resultset"><p> found <b>' + data.resultset + '</b> matching statuses (search type: <b>' + data.strict + '</b>)</p></li>');
                    statusShare.listResponse(data);
                    break;
                case 0:
                    statusShare.$.stuffListing.children().remove()
                    //remove all li, that were there due to previous search
                    statusShare.$.stuffListing.prepend("<br /><li class='noresults'><p class='quote'>" + data.error + "</p></li>");
                    statusShare.$.contentWrapper.css({opacity: 1});
                    break;
            }
        });
        statusShare.$.searchInput.val(query);
    },

    //FETCH RANDOM TWEETS -- Random Part
    getRandomStuff: function() {
        statusShare.$.activityIndicator.html(function(i, text) {
            $(this).html($(this).data('random'));
            statusShare.shuffleClasses($(this), "green-bg", "black-bg");
        })
        statusShare.$.stuffListing.children().remove() //remove all li, that were there due to previous search
        keyword = undefined;

        $.getJSON(statusShare.serviceURL + 'random.php', statusShare.listResponse);
        Collect = new Array(); //empty it, not for random
    },

    listResponse: function(data) {
        switch(data.success) {
            case 0:
                statusShare.$.stuffListing.children().remove();
                //remove all li, that were there due to previous search
                statusShare.$.stuffListing.prepend("<br /><li class='noresults'><p class='quote'>" + data.error + "</p></li>");
                statusShare.$.contentWrapper.css({'opacity':1});
                break;
            case 1:
                Statuses = data.stuff;
                $.each(Statuses, function(index, status) {
                    statusShare.$.stuffListing.append('<li>' +
                        '<a onclick="">' +
                        '<p id="status' + status.id + '" class="quote">' + status.msg + '</p>' +
                        '</a></li>');
                    if(keyword) Collect.push(status.id) //collect the Ids if keyword exists already exists
                });
                statusShare.$.activityIndicator.html(function(i, text) {
                    $(this).html($(this).data('note'));
                    statusShare.shuffleClasses($(this), "black-bg", "green-bg");
                })
                refresh = false; //re-enable the refreshing
                break;
            case 2:
                if(statusShare.$.results.length == 0 && keyword) {
                    if(!$('.noresults')) statusShare.$.stuffListing.append("<li class='noresults'><p class='quote'>" + data.error + "</p></li>");
                    statusShare.$.contentWrapper.css({'opacity':1});
                }
                break;
        }
        statusShare.scroll()
        statusShare.shuffleClasses(statusShare.$.searchBar, "red-bg", "green-bg");
        statusShare.shuffleClasses(statusShare.$.searchInput, "red-bg", "green-bg");
    },

    //STATUS COUNTER LOG
    totalStuff: function() {
        $.get(statusShare.serviceURL + "count.php", function(r) {
            if (r.total) statusShare.$.counter.html(r.total);
        }, "json");
    },

    //IF THE QUERY THE USER HAS TYPED IN IS LONGER THAN #2LETTERS START SEARCHING
    stringlength: function(str) {
        if (str.length == 0) {
            statusShare.$.searchInput.css({"color":"#fffdc7"});
            statusShare.$.stuffListing.children().remove(); //remove all results for the user to refresh search criteria
        }
        else if (str.length > 2) {
            //CHECK TO SEE CONNECTION
            if(str) {
                statusShare.$.activityIndicator.html(function(i, text) {
                    $(this).html("Searching...");
                })
                statusShare.shuffleClasses(statusShare.$.searchBar, "green-bg", "red-bg");
                statusShare.shuffleClasses(statusShare.$.searchInput, "green-bg", "red-bg");
                //if something was typed in, more than 3 letters
                statusShare.searchStatus(str);
            }else{
                statusShare.$.activityIndicator.html(function(i, text) {
                    $(this).html("NO INTERNET CONNECTION.");
                })
            }
        }
    },

    clear: function() {
        statusShare.$.searchInput.val(null);
    },

    shuffleClasses: function(el, add, chuck) {
        $(el).addClass(add).removeClass(chuck)
    }

}
