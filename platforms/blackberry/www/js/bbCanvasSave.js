blackBerry: function(canvas) {

    var optionsBB = {
        mode: blackberry.invoke.card.FILEPICKER_MODE_SAVER,
        type: [ blackberry.invoke.card.FILEPICKER_TYPE_PICTURE],
        directory: [blackberry.io.sharedFolder]
    };

    //Determine which request is ACTIVE
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

    blackberry.invoke.card.invokeFilePicker(optionsBB,
        function (path) {
            /* User chose a path, and we now have a variable referencing it! */
            blackberry.io.sandbox = false;
            
            //Now Start the download progress...
            window.requestFileSystem(window.PERSISTENT, 5.0 * 1024 * 1024,
                function (fileSystem) {
                    /* We were granted a FileSystem object. */
                    fileSystem.root.getFile(path, {create: true},
                        function (fileEntry) {
                            /* We were granted a FileEntry object. */
                            fileEntry.createWriter(
                                function (fileWriter) {
                                    /* We were granted a FileWriter object! */
                                    fileWriter.onerror = function (fileError) {
                                        console.log('FileWriter Error: ' + fileError);
                                    };
                                    fileWriter.onwriteend = function () {
                                        //show completion of progress
                                        AppFunctions.savingProgress(4)
                                        blackberry.ui.toast.show('PrittyNote saved successfully!');

                                        //+++++++++  add sharing options here ++++++++
                                        //if USER has opted to share.


                                    };
                                    canvas.toBlob(
                                        function (blob) {
                                            fileWriter.write(blob);
                                        },
                                        'image/png'
                                    );
                                },
                                function (fileError) {
                                    console.log('FileEntry Error: ' + fileError);
                                }
                            );
                        },
                        function (fileError) {
                            console.log('DirectoryEntry (fileSystem.root) Error: ' + fileError);
                        }
                    );
                },
                function (fileError) {
                    /* Error. */
                    console.log('FileSystem Error: ' + fileError);
                }
            );
        },
        function (reason) {
            /* User cancelled. */
            console.log('User Cancelled: ' + reason);
        },
        function (error) {
            /* Invoked. */
            if (error) {
                console.log('Invoke Error: ' + error);
            }
        }
    );
}