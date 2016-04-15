//variable to store the search result
var query = "";
//an object to store the [singular] name of journalist who wrote the related article
var journo = {};
//an object to store byline results that are not singular journalists (for later processing)
var journoError = {};
//an object used to store all the domains extracted from the JSON object returned
var domains = {};
//an array to store the top 6 cited external sites for a given search term
var topSix=[];
//a suppression array, to filter out trash from the domains object
var suppression=['brightcove.com', 'theguardian.com', 'theguardian.co.uk', 'guim.co.uk', 'vox-cdn.com', 'gu.com', 'formstack.com', 'mail.google.com', 'guardianapis.com', 'cdn.theguardian.tv', 'media.guim.co.uk', 'multimedia.guardianapis.com', 'static.guim.co.uk', 'www.theguardian.com', 'interactive.guim.co.uk', 't.co', 'twitter.com', 'www.youtube.com', 'guardiannewsampampmedia.formstack.com', 'preview.gutools.co.uk', 'www.guardian.co.uk', 'witness.theguardian.com', 'teachers.theguardian.com', 'assets.guim.co.uk', 'platform.twitter.com', 'www.facebook.com','profile.theguardian.com', 'bookshop.theguardian.com', '42xcNbpAqakcM0ftUmFAAIBE81IqBJdS3lS6zs3bIpB9WED3YYXFPmHRfT8sgyrCP1x8uEUxLMzNWElFOYCV6mHWWwMzdPEKHlhLw7NWJqkHc4uIZphavDzA2JPzUDsBZziNae2S6owH8xPmX8G7zzgKEOPUoYHvGz1TBCxMkd3kwNVbU0gKHkx+iZILf77IofhrY1nYFnB', 'platform.instagram.com', 'instagram.com' , 'urldefense.proofpoint.com', 'register.theguardian.com', 'datawrapper.dwcdn.net', 'assets-secure.guim.co.uk', 'www.formstack.com', 'www.google.com', 'discussion.theguardian.com', 'www.guardianbookshop.co.uk', 'www.google.co.uk', 'schema.org', 'avatar.guim.co.uk', 'giant.gfycat.com', 'jobs.guardian.co.uk', 'guardian.touch-line.com', 'ballsdot.wpengine.netdna-cdn.com', 'thumbs.gfycat.com', 'dx.doi.org'];


$(document).ready(function(){
   console.log('ready');

    //event listener for search button
    $('#search').click(function() {
        query = $('#search-box').val();
        //reset storage objects to null each time the search button is clicked
        journo={};
        journoError = {};
        domains = {};

        //get the total number of pages of articles available for the search term - this in turn calls a function to get and parse the data
        getTotalPages();

        //we now need to wait for getTotalPages and its related functions to process the data and store in the global variables
        //if we don't wait, the variable return as undefined as there is quite a lot of processing going on
        console.log('Waiting...');
        $('#please-wait').slideDown(500);
        setTimeout(function() {

            //filter the erroneous domains from the overall list of domains
            suppressDomains(domains);
            //put the top 6 into an array
            getTopSix(domains);
            //push them to the page
            renderSiteResults();
            $('#please-wait').slideUp(500);

        }, 5000);
        setTimeout(function() {console.log(journo)}, 5000);


    });





});

function getTotalPages() {
    //grab the first page of article results and find out how many pages there are
    var data = {
        'api-key': '7e7ec4f7-0b2f-4424-a503-d1ed8004a441',
        'q': query,
        'format': 'json'
    };
    var url = 'http://content.guardianapis.com/search';
    $.getJSON(url, data, function(response) {
        //this function will retrieve all the results for all the pages available, but this needs to be throttled as its breaking the API
        runPagesTimes(response);
    });
}

function runPagesTimes(response) {
    console.log(response);
    var totalPages = response.response.pages;
    console.log(totalPages);
    for (var i=1; i<=20; i++){
        //console.log(i);
        //access the API and grab the JSON object
        getGuardianContent(i);
    }
}

function getGuardianContent(currentPage){


    //grab the first page of article results along with the byline and body html
    var data = {
        'api-key': '7e7ec4f7-0b2f-4424-a503-d1ed8004a441',
        'q': query,
        'format': 'json',
        'show-fields': 'body,byline',
        'page': currentPage
    };

    var url = 'http://content.guardianapis.com/search';

    $.getJSON(url, data, function(response){
        //console.log('Variable totalPages: ' + totalPages);
        //console.log('Object Total Pages: ' + response.response.pages);
        //console.log('Object Current page: ' + response.response.currentPage);
        //then parse the results
        parseObj(response.response.results);
    });

}

function parseObj(obj) {
    for (var i in obj){
        //console.log('Article: ' + i);
        var body = obj[i].fields.body;
        //console.log(body);
        //this pulls the domain out of the body results by matching //   / within the string
        var anchor = body.match(/\/\/.*?\//g);

        for (var j in anchor){
            //this slices off the // and / from the string
            anchor[j] = anchor[j].slice(2,-1);
            //add the result into the object to store the domain names
            addOrIncSite(anchor[j]);
        }

        if (obj[i].fields.hasOwnProperty('byline')) {
            var byline = obj[i].fields.byline;
            //console.log(byline);
            if (byline.search('and') == -1){
                if(byline.search(',') == -1){
                    addOrIncJournoStore(byline);
                    //console.log(byline + ' byline added');
                }
            }
            else {
                //console.log('byline anomaly - added to anomaly');
                addOrIncJournErrorStore(byline);
            }
        }
    }
    //console.log(journo);
    //console.log(journoError);
    //console.log(domains);
}

function addOrIncSite(sites){
    if (domains.hasOwnProperty(sites)){
        domains[sites] +=1;
    }
    else {
        domains[sites] = 1;
    }
}

function addOrIncJournoStore(byline){
    if (journo.hasOwnProperty(byline)){
        journo[byline] +=1;
    }
    else {
        journo[byline] = 1;
    }
}

function addOrIncJournErrorStore(byline){
    if (journoError.hasOwnProperty(byline)){
        journoError[byline] +=1;
    }
    else {
        journoError[byline] = 1;
    }
}

function suppressDomains(domains) {
    //code to go here
    for (var i in domains) {
        //console.log(i);
        for (var j in suppression) {
            //console.log(suppression[j]);
            if (i == suppression[j]) {
                console.log('matchy matchy');
                domains[suppression[j]] = null;
            }
        }
    }
    console.log(domains);
}

function getTopSix(domains) {
    //this function cycles through the domain array 6 times and takes the largest key-value domain-count pair and adds pushes it
    //into a multi-dimensional array. It then sets that highest property to null, and repeats the process.
    for (var j = 0; j < 6; j++) {
        //console.log('j loop number: ' + j);
        var max = 0;
        for (var i in domains) {
            //console.log('checking...' + i);
            if (domains[i] > max) {
                max = domains[i];
                //console.log('updating topSix');
                topSix[j] = [i, domains[i]];
            }
        }
        var removeHighest = topSix[j][0];
        domains[removeHighest] = null;
    }
    console.log(topSix);
}

function renderSiteResults(){
    for (var i=1; i<7; i++){
        $('p.site' + i).text(topSix[i-1][0]);
        $('div.site' + i + ' p.score').text(topSix[i-1][1]);
    }
}


