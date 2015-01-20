////////
// This sample is published as part of the blog article at www.toptal.com/blog
// Visit www.toptal.com/blog and subscribe to our newsletter to read great posts
////////

var express = require('express'),
    app = express();

app.use('/', express.static(__dirname + '/app'));
app.use('/article', express.static(__dirname + '/article'));

app.listen(process.env.PORT || 3000);
