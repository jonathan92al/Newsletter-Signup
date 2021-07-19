require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const https = require("https")

const app = express()
const port = process.env.PORT || 3000

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html")
});

// sending data to mailchimp api
app.post("/", function(req, res) {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  const data = {
    // array of subscribers
    members: [
      // subscriber object
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  // flatening data to JSON
  const jsonData = JSON.stringify(data);

  const options = {
    method: "post",
    auth: "key:" + process.env.API_KEY;
  }

  const request = https.request(process.env.URL, options, function(response) {
    // Success
    if(response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    }
    // Failure
    else {
      res.sendFile(__dirname + "/failure.html");
    }

    response.on("data", function(data) {
      console.log(JSON.parse(data));
    })
  })

  request.write(jsonData);
  request.end();
})

// redirect button back to sign-up page - in case of failed sign-up
app.post("/failure", function(req, res) {
  res.redirect("/");
});

app.listen(port, function() {
  console.log("Server is running on port " + port);
})
