function logResponse(response) {
    if (console && console.log) {
        console.log('The response was', response);
    }
}


$(function(){
    // Set up so we handle click on the buttons
    $('#postToWall').click(function() {
        FB.ui(
            {
                method : 'feed',
                link   : $(this).attr('data-url')
            },
            function (response) {
                // If response is null the user canceled the dialog
                if (response != null) {
                    logResponse(response);
                }
            }
        );
    });

    $('#sendToFriends').click(function() {
        FB.ui(
            {
                method : 'send',
                link   : $(this).attr('data-url')
            },
            function (response) {
                // If response is null the user canceled the dialog
                if (response != null) {
                    logResponse(response);
                }
            }
        );
    });

    $('.sendRequest').click(function() {
        FB.ui(
            {
                method  : 'apprequests',
                message : $(this).attr('data-message')
            },
            function (response) {
                // If response is null the user canceled the dialog
                if (response != null) {
                    logResponse(response);
                }
            }
        );
    });

    $('.invite').click(function() {
        FB.ui(
            {
                method  : 'apprequests',
                message : $(this).attr('data-message'),
                data    : $(this).attr('data-room'),
            },
            function (response) {
                // If response is null the user canceled the dialog
                if (response != null) {
                    logResponse(response);
                }
            }
        );
    });


    $('.facelogout').click(function() {
        FB.logout(function(response) {
          FB.Auth.setAuthResponse(null, 'unknown');
        });
    });



    
});

function facebookMessage() {
    //alert(data.message);
    $('.overlay').each(function(){
        var obj = $(this);
        obj.show();
        $('.face_post').each(function(){
            var pst = $(this);
            pst.show();
            $('.close-button').show();
            pst.css('left', ($(document).width() - 200)/2 + 'px');
            $('.close-button').css('left', pst.position().left + pst.width() + 'px');
            old_focus = document.activeElement;
            $('.close-button').focus();
        });
    });
};