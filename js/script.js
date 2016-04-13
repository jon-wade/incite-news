$(document).ready(function(){
   console.log('ready');


    //getGuardianContent();


});


function getGuardianContent(){

    var data = {
        'api-key': '7e7ec4f7-0b2f-4424-a503-d1ed8004a441',
        'q': 'donald trump',
        'format': 'json',
        'show-fields': 'body,thumbnail,score',
        'page-size': 50
    };

    var url = 'http://content.guardianapis.com/search';

    $.getJSON(url, data, function(response){
        console.log(response)
    });




}
