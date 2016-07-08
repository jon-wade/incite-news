# guardian-api
Thinkful Unit 1 Portfolio Exercise - jQuery app integrating with *The Guardian*'s Open Platform API

##Background

I built this app drawing on my experience from the PR industry to analyse which sources *The Guardian* cites when writing an article on any given topic. For instance, on the subject of "politics", what are the sources that *The Guardian* most often cite? In addition, I wanted to analyse which bylines (the writers of the article) were associated with that subject most frequently.

##Use Case

Why is this app useful? If you are struggling to get *The Guardian* to write about your brand / organisation an alternative strategy is to try to place your stories with other publications that *The Guardian* considers influential, allowing you to get your story picked up indirectly. Nice!

##Initial UX

The initial mobile and desktop wireframes can be seen below:

![Initial Wireframes](http://jonwade.digital/hosted-projects/unit-one/guardian-api/img/guardian-api-image.jpg)

##Working Prototype

You can access a working prototype of the app here: http://jonwade.digital/hosted-projects/unit-one/guardian-api

##Functionality
The app's functionality includes:

* Analysis of 100 most relevant articles returned by *The Guardian* on any given search term
* Listing the top 6 external domains cited by *The Guardian* on any given search query with links to those sites
* A histogram plot of the relative popularity of those top 6 sites
* Listing the top 6 bylines associated with any given search query with Google search links associated to those bylines
* Detailing the total number of anchor links within the articles returned by *The Guardian*'s Open Platform API
* Detailing the total number of unique domains associated with those links
* Suppressing internal links to *The Guardian* and key social media sites from the overall results

##Technical

The app is built entirely in jQuery and makes use of AJAX calls to The Guardians Open Platform API to return the data. All data is held in memory during the user's session. It has been built to be fully responsive across mobile, tablet and desktop screen resolutions.

##Development Roadmap

This is v1.0 of the app, but future enhancements are expected to include:

* Extending the app to analyse other top tier newspaper publications which offer an API (e.g. New York Times etc)
* Plotting the inter-connection of story sourcing between different newspaper publications (e.g. is there a particular publication that leads opinion more than any other on a given topic?)
* Adding a filter to allow the inclusion or exclusion of social media properties in the results
* Increasing the number of sites and bylines returned from the current six to an amount specified by the user
* Pulling in byline journalist email addresses and profile head shots automatically, to save the google search process employed presently
* Allowing a user-controlled site suppression list to be used to control the sites that are returned in the analysis