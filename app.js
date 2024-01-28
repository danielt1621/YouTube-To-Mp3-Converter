//required packages
const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

//create the express server
const app = express();

//server port number
const PORT = process.env.PORT || 3000;

//set template function
app.set("View engine", "ejs");
app.use(express.static("public"));

//needed to parse html data for POST request
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json());

app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.post("/convert-mp3", async (req, res) => {
    console.log("Received video URL:", req.body.videoID);
    const videoUrl = req.body.videoID;
    const videoIdRegex = /https:\/\/(www\.)?youtube\.com\/watch\?v=([-_0-9A-Za-z]+)|https:\/\/youtu\.be\/([-_0-9A-Za-z]+)/;
    const match = videoUrl.match(videoIdRegex);
    const videoId = match ? (match[3] || match[4]): null;
    console.log("Match:", match);
    console.log("Video ID:", videoId);
    if (!videoId) {
      console.log("Invalid video URL")
      return res.render("index.ejs",{
        success : false ,
        message: "Please enter a valid Youtube video url"
      });
    } else {
        const fetchAPI = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}` ,{
            "method": "GET",
            "headers": {
                "x-rapidapi-key" : process.env.API_KEY,
                "x-rapidapi-host": process.env.API_HOST
            }
        });

        const fetchResponse = await fetchAPI.json();

        if(fetchResponse.status === "ok"){
            return res.render("index.ejs", {success : true, song_title: fetchResponse.title,song_link : fetchResponse.link});
        } else {
            return res.render("index.ejs", {success : false, message: fetchResponse.msg});
        }
    }
});

//start the server
app.listen(PORT, () => {
    console.log('Server started on port ' + PORT); //${PORT}
})