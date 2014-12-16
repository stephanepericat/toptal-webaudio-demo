var express = require('express'),
    app = express();

app.use('/', express.static(__dirname + '/app'));

app.listen(process.env.PORT || 3000);
