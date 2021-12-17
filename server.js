const express = require('express');
var path = require('path');
const fs = require("fs");
let app = express();
const multer = require('multer');

// Configure multer storage
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "views");
    },
    filename: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      cb(null, `images/admin-${file.fieldname}-${Date.now()}.${ext}`);
    },
});

// Configure multer filter
const multerFilter = (req, file, cb) => {
    // Accepts PNG or JPEG
    if ((file.mimetype.split("/")[1].toUpperCase() == 'PNG') || (file.mimetype.split("/")[1].toUpperCase() == "JPEG") ) {
      cb(null, true);
    } else {
      cb(new Error("Not a PDF File!!"), false);
    }
};

//Calling the "multer" Function
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

let mongo = require('mongodb');
const mc = require("mongodb").MongoClient;

let db;
let imageNames = [];

app.use(express.urlencoded({extended: true})); 
app.set("view engine", "pug");
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

app.get("/", function (req, res){
    res.set("Content-Type", "text/html");
	res.status(200).render("index",{images: imageNames});
})

// Gets image
app.get("/images/:imageID", function(req, res){
    let imageName = req.params.imageID;
    //console.log("image name " + imageName);
    fs.readFile("views/images/"+ imageName, function(err, data){
        res.statusCode = 200;
        if(imageName.slice(-3).toUpperCase() === "JPEG"){
            res.setHeader("Content-Type", "image/jpeg").write(data);
        }else{
            // Should only be PNG left
            res.setHeader("Content-Type", "image/png").write(data);
        }
        res.end();
    });
});


app.post("/fileupload", upload.single('imageFile'), (req, res) => {
    if(!req.file) {
        res.status(404).send("You did not submit a file!");
    }else{
        //console.log(req.file.filename);
        //console.log(req.file);
        // render pug file
        imageNames.push(req.file.filename);
        res.set("Content-Type", "text/html");
	   // res.status(200).render("index", {images: imageNames});
       res.redirect("http://localhost:3000/")
    }
});


mc.connect("mongodb://localhost:27017", function(err, client) {
	if (err) {
		console.log("Error in connecting to database");
		console.log(err);
		return;
	}
	db = client.db("imageRepo");
	app.listen(3000);
	console.log("Server listening on port 3000");
})