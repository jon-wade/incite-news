var domains = {};
var journos = {};
var topSixDomains = [];
var topSixJournos = [];

$(document).ready(function(){
    console.log('ready');

    //event listener for search button and enter
    $('#search').on('click', go);
    $('body').on('keypress', function(keycode){
        if (keycode.which === 13) {
           go();
        }
    });
});

var go = function() {
    domains = {};
    journos = {};
    fetchResults(1, function (res, err) {
        if (err) {
            console.log('fetchResults error=', err);
        }
        else {
            console.log('fetchResults result=', res);
            //now we need to extract the top 6 domains and put them into an array
            topSixDomains = topSix(res.domains);
            console.log('topSixDomains=', topSixDomains);
            //and render onto page
            $('#histogram').css('visibility', 'visible');
            for (var i=1; i<topSixDomains.length+1; i++){
                $('div#site' + i).html('<p><a class="external-link" href="http://' + topSixDomains[i-1].key + '">' + topSixDomains[i-1].key + '</a></p>');
                $('div.site' + i + ' p.score').text(topSixDomains[i-1].value);
            }

            //now we need to extract the top 6 journos and put them into an array
            topSixJournos = topSix(res.journos);
            console.log('topSixJournos=', topSixJournos);
            //and render onto page
            $('aside').css('visibility', 'visible');
            for (var j=1; j<topSixJournos.length+1; j++){
                $('#journo-list dd:nth-child(' + j + ')').text(topSixJournos[j-1].key.toLowerCase());
            }

            //now draw the histogram
            drawHistogram(topSixDomains);

            //update site links totals
            updateTotals(res.domains);


        }
    });
};

var fetchResults = function(pageNum, callback) {

    var query = $('#search-box').val();

    //console.log('query=', query);
    //console.log('pageNum=', pageNum);

    //set-up
    var data = {
        'api-key': '7e7ec4f7-0b2f-4424-a503-d1ed8004a441',
        'q': query,
        'format': 'json',
        'show-fields': 'body,byline',
        'page': pageNum
    };
    var url = 'http://content.guardianapis.com/search';

    //grab the first page of article results
    $.getJSON(url, data)
        .done(function (success) {
            //successful response from API

            var totalPages = success.response.pages;

            //only get a maximum of 10 pages of results, total 100 articles
            totalPages > 10 ? totalPages = 10 : null;

            //parse the current array of results
            var results = success.response.results;
            console.log('results=', results);


            for (var i = 0; i < results.length; i++) {
                //if there is any data within the results array in the fields field
                if (results[i].fields !== undefined) {
                    //check is there is any data in the body field
                    if (results[i].fields.body !== undefined) {
                        //pull the URLs from each article and store in an array called anchor
                        var anchor = results[i].fields.body.match(/\/\/.*?\//g);
                        if (anchor !== null) {
                            for (var j = 0; j < anchor.length; j++) {
                                //remove preceeding and trailing forward slashes
                                anchor[j] = anchor[j].slice(2, -1);
                                //take anchors with less than 50 characters, check they are valid domains, if true check the domains object and and see if it's been saved before, if so, increment value by one, if not, add the anchor into the domain object
                                anchor[j].length < 50 ? validDomain(anchor[j]) ? domains.hasOwnProperty(anchor[j]) ? domains[anchor[j]] += 1 : domains[anchor[j]] = 1 : null : null;
                            }
                        }
                    }
                    //for bylines that exist, check if the byline has previously been added into the journos object and if so, increment by one, if not add in a new byline to the object
                    results[i].fields.byline !== undefined ? journos.hasOwnProperty((results[i].fields.byline)) ? journos[results[i].fields.byline] += 1 : journos[results[i].fields.byline] = 1 : null;
                }
            }
            //check if all the pages have been called
            if (pageNum === totalPages) {
                console.log('finished...');
                callback({
                    domains: domains,
                    journos: journos
                });
            }
            else {
                //if not, get next page's worth of results
                pageNum++;
                fetchResults(pageNum, callback);
            }

            //console.log('domains=', domains);
            //console.log('journos=', journos);
        })
        .fail(function (error) {
            //server returned an error
            callback(null, {
                errorMessage: 'error from API call',
                serverResponse: error
            });
        });

};

var validDomain = function(domain) {

    var suppression = ['twitter', 'guardian', 'gu.com', 'google', 'facebook', 'brightcove', 'guim', 'vox-cdn', 'formstack', 't.co', 'youtube', 'gutools', 'instagram', 'proofpoint', 'datawrapper', 'schema.org', 'gfycat', 'netdna-cdn', 'dx.doi.org', 'amazonaws', 'ticketek', 'ticketmaster', 'palacecinemas', 'racingpost', '32redsport', 'usoccer.com', 'w3.org', 'bit.ly', 'youtu.be', 'amazon.co.uk', 'soundcloud.com', 'gramfeed.com', 'eventbrite', 'tradedoubler', 'londontheatres.co.uk', 'jackson-stops', 'vimeo', 'gutools', 'squarespace', 'dailymotion'];

    var match = suppression.filter(function(item) {
        return domain.includes(item);
    });

    return match.length<=0;

};

var topSix = function (obj) {
    var temp = Object.keys(obj).map(function (key) {
        return {key: key, value: this[key]};
    }, obj);
    temp.sort(function (p1, p2) {
        return p2.value - p1.value;
    });
    return temp.slice(0, 6);
};

function drawHistogram(topSix){
    //work out sum of topSix scores
    var sum=0;
    for (var i=0; i<topSix.length; i++){
        sum = sum + topSix[i].value;
    }
    //console.log(sum);
    //work out the length of each bar as a % of the top result
    var siteOneSize = ((topSix[0].value)/sum);
    var siteTwoSize = Math.round((((topSix[1].value)/sum)/siteOneSize)*100);
    //console.log('site2 size: ' + (siteTwoSize));
    var siteThreeSize = Math.round((((topSix[2].value)/sum)/siteOneSize)*100);
    //console.log('site3 size: ' + (siteThreeSize));
    var siteFourSize = Math.round((((topSix[3].value)/sum)/siteOneSize)*100);
    //console.log('site4 size: ' + (siteFourSize));
    var siteFiveSize = Math.round((((topSix[4].value)/sum)/siteOneSize)*100);
    //console.log('site5 size: ' + (siteFiveSize));
    var siteSixSize = Math.round((((topSix[5].value)/sum)/siteOneSize)*100);
    //console.log('site6 size: ' + (siteSixSize));
    siteOneSize=100;
    //console.log('site1 size: ' + siteOneSize);

    //set width of divs
    $('div.site1').css('width', siteOneSize+'%');
    $('div.site2').css('width', siteTwoSize+'%');
    $('div.site3').css('width', siteThreeSize+'%');
    $('div.site4').css('width', siteFourSize+'%');
    $('div.site5').css('width', siteFiveSize+'%');
    $('div.site6').css('width', siteSixSize+'%');

}

function updateTotals(domains){
    var linkSum = 0;
    var siteSum = 0;
    for (var site in domains){
        if(domains.hasOwnProperty(site)) {
            linkSum += domains[site];
            siteSum++;
        }
    }

    $('div#total-links span').text(linkSum);
    $('div#total-sites span').text(siteSum);

}



