# Stackoverflow Dead link Finder
### About
- check out this [short](https://www.youtube.com/watch?v=piqzsF7t4IM&feature=youtu.be) youtube video
- this is a `jQuery` application which uses the Stack Exchange API to find broken links on Stackoverflow. It can be used on other sites from the Stack Exchange family as well. 
### How it works
- it implements a function `getPosts` which retrieves all the posts( questions AND answers) between 2 given dates; it returns the body of the posts as well -->> another function parses the body and searches for `href` attributes -->> it makes a HEAD request to the found sites and if the response contains an error, then the link is broken
- broken links are saved and printed onto the screen -->> after running the application, one can save the generated HTML file with the stored broken links and links to the Stackoverflow posts where the broken links appear. This is how the generated HTML file looks like:  
![46904587-5302d400-ceef-11e8-93d7-6c45577020a3](https://user-images.githubusercontent.com/37183688/46904612-ad039980-ceef-11e8-9314-f804b0dd0760.png)

### How to save results(link of post, broken link, archived link, body of replaced post)
- just save the whole page in your browser (tested in Chrome and Firefox) and the HTML page will be saved along a folder which contains all the `javascript` scripts. Delete the `script.js` file(probably it will appear as `script.js.download`) because it contains the application logic(ajax calls to the StackExchange API etc.) and we don't need this now. Don't delete the other scripts! Now you can simply copy the body of the posts(broken links replaced with archived ones) by clicking on the <kbd>Copy Body</kbd> button.
### Note
- the application obeys the `backoff` parameter, this means that it sleeps for some time when this parameter is returned from the api
- you have to register a new Stack app to get a free key in order to use as much as 10k requests per day. Without a key, you can make only 300 requests
- for more valid results, we should check the same link multiple times over a period of time because webservers don't have 100% uptime
