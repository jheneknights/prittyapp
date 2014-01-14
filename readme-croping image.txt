<div class="bg-image">
    <img id="load-image" src="gallery/pritty%20(17).png">
    <div class="finish-crop">
        <img src="images/icons/appbar.close.png">
        <img src="images/icons/appbar.checkmark.thick.png">
    </div>
</div>
<script src="./js/jquery.Jcrop.min.js"></script>
<script>
    var api
    $(function() {
        $("#load-image").Jcrop({
            bgFade: true,
            bgColor: "#660000",
            bgOpacity: 0.2,
            setSelect: [0, 0, 100, 100],
            aspectRatio: 1
        },function() {
            api = this;
        });
        console.log($("#load-image").width())
    })
</script>


/********** IMAGE CROPING *******/
.bg-image{display: block; position: fixed; top: 0; left: 0; width: 100%; z-index: 100}
.bg-image img{width: 100%}
.bg-image .finish-crop{width: 50%; text-align: center; position: fixed; bottom: 0; left: 25%; z-index: 1000}
.bg-image .finish-crop > img{width: 50%; float: left}
.bg-image .finish-crop > img:first-child:active{background: #e74c3c;}
.bg-image .finish-crop > img:active{background: #2ecc71;}
