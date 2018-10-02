# Stackoverflow Dead link Finder
### About
This is a `jQuery` application which uses the Stack Exchange API to find broken links on Stackoverflow. It can be used on other sites from the Stack Exchange family as well. 
### How it works
- it implements a function `getPosts` which retrieves all the posts( questions AND answers) between 2 given dates; it returns the body of the posts as well -->> another function parses the body and searches for `href` attributes -->> it makes a HEAD request to the found sites and if the response contains an error, then the link is broken
- broken links are saved and printed onto the screen -->> after running the application, one can save the generated HTML file with the stored broken links and links to the Stackoverflow posts where the broken links appear. This is how the generated HTML file looks like:  
![image](https://user-images.githubusercontent.com/37183688/46371727-d3c10500-c691-11e8-9249-2270bc7ed3ed.png)

### Note
- the application obeys the `backoff` parameter, this means that it sleeps for some time when this parameter is returned from the api
- you have to register a new Stack app to get a free key in order to use as much as 10k requests per day. Without a key, you can make only 300 requests
