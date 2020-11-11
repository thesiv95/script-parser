const rp = require('request-promise');
const querySelector = require('cheerio'); // like in browser js

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 9001;
// app init config
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true})); // to handle symbols & ? in the POST query
app.listen(PORT, () => console.log(`Server was started on port ${PORT}`));

app.get('/', (req, res) => {
    res.render('index', { data: '' });
});

app.post('/parse', (req, res) => {
    let url = req.body.url;
    let regex = /(https?:\/\/)?(www\.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)|(https?:\/\/)?(www\.)?(?!ww)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
    if (url.match(regex)){
        rp(url).then(function(html){
            /* extracted data */
            
            let cssLinksArray = [];
            let styleTagsArray = [];
            let jsFilesArray = [];
            let jsTagsArray = [];
            /* CSS */
            // <link> tag
            let links = querySelector('link', html);
            for (let i = 0; i < links.length; i++){
                if (links[i].attribs.rel === 'stylesheet') cssLinksArray.push(links[i].attribs.href);
            }
        
            // <style> tag
            let styleTags = querySelector('style', html);
            for (let i = 0; i < styleTags.length; i++){
                styleTagsArray.push(styleTags[i].children[0].data);
            }
        
            /* JS */
            let jsLinks = querySelector('script', html);
            // <script> tag with "src" attribute
            for (let i = 0; i < jsLinks.length; i++) {
                if(jsLinks[i].attribs.src) {
                    jsFilesArray.push(jsLinks[i].attribs.src);
                } else {
            // blank <script> tag
                    jsTagsArray.push(jsLinks[i].children[0].data);
                }
            }
        
            // <link> tag again
            for (let i = 0; i < links.length; i++){
                if (links[i].attribs.rel === 'preload') jsFilesArray.push(links[i].attribs.href);
            }
        
            
            // data output
            let data = '';
            if (cssLinksArray.length) {
                data += '<p class="output-delimeter">******** CSS LINKS ********</p>';
                for (let i = 0; i < cssLinksArray.length; i++){
                    data += `<p>${cssLinksArray[i]}</p>`;
                }
                data += '<hr />';
            }
            if (styleTagsArray.length){
                data += '<p class="output-delimeter">******** CSS TAGS ********</p>';
                for (let i = 0; i < styleTagsArray.length; i++){
                    data += `<p>${styleTagsArray[i]}</p>`;
                }
                data += '<hr />';
            }
            if (jsFilesArray.length){
                data += '<p class="output-delimeter">******** JS FILES ********</p>';
                for (let i = 0; i < jsFilesArray.length; i++){
                    data += `<p>${jsFilesArray[i]}</p>`;
                }
                data += '<hr />';
            }
            if (jsTagsArray.length){
                data += '<p class="output-delimeter">******** JS TAGS ********</p>';
                for (let i = 0; i < jsTagsArray.length; i++){
                    data += `<p>${jsTagsArray[i]}</p>`;
                }
            }
            
            res.render('index', { data: data });
        
        }).catch(function(err){
            console.error(err);
        });
    } else {
        return false;
    }
})







