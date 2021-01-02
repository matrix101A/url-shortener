const express = require("express");
const app = express();
const port = 3000;

const static = express.static("public");

const bodyParser = require("body-parser");

var admin = require("firebase-admin");
var serviceAccount = require("./shorten-url-d3b8b-firebase-adminsdk-1tjf5-577ee3ce6c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const urlsdb = admin.firestore().collection("urlsdb");
const usersdb = admin.firestore().collection("usersdb");

app.get("/:short", (req, res) => {
  console.log(req.params);
  const short = req.params.short;

  const doc = urlsdb.doc(short);

  doc.get().then((response) => {
    const data = response.data();
    // console.log(data);
    if (data && data.url) {
      res.redirect(301, data.url);
    } else {
      res.redirect(301, "https://www.google.com");
    }
  });

  // res.send("We will redirect you to " + short)
});

app.use(static);
app.use(bodyParser.json());

app.post("/admin/urls", (req, res) => {
  console.log(req.body);
  const { userName, password, short, url } = req.body;
  usersdb
    .doc(userName)
    .get()
    .then((response) => {
      const user = response.data();
      if (user && user.email == userName && user.password == password) {
        const doc = urlsdb.doc(short);
        doc.set({ url });
        res.send("DONE !");
      } else {
        console.log(userName, user, password);
        res.status(403).send("Not possible ");
      }
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
