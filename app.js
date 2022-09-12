require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
let port = process.env.PORT || 3000;
const mongodb = require("mongodb");
const morgan = require("morgan");
const mongoClient = mongodb.MongoClient;
const mongoUrl = process.env.mongoLiveUrl;
let db;
///////////////////////////////////////////
const dataBase = require("./db");
const AuthController = require("./controller/authController");

app.use("/api/auth", AuthController);
//////////////////////////////////////////
// Login with git
const superAgent = require("superagent");
const request = require("request");
const clientId = "83f6711a0f57c8df9bc3";
//////////////////////////////////////////
app.use(morgan("common"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

///////////////////////////////Login with git/////////////////////////////////////////
// app.get("/", (req, res) => {
//   res.send(
//     `<a href="https://github.com/login/oauth/authorize?client_id=${clientId}">Login with Git</a>`
//   );
// });

app.get("/oauth", (req, res) => {
  const code = req.query.code;
  if (!code)
    return res.send({
      success: false,
      message: "Error while login",
    });
  superAgent
    .post("https://github.com/login/oauth/access_token")
    .send({
      client_id: clientId,
      client_secret: process.env.CLIENT_SECRET,
      code: code,
    })
    .set("Accept", "application/json")
    .end((err, result) => {
      if (err) throw err;
      let access_token = result.body.access_token;
      let option = {
        uri: "https://api.github.com/user",
        method: "GET",
        headers: {
          Accept: "Application/json",
          Authorization: `token ${access_token}`,
          "User-Agent": "mycode",
        },
      };
      request(option, (err, response, body) => {
        res.send(body);
      });
    });
});
////////////////////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.send("hello");
});
app.get("/location", (req, res) => {
  db.collection("locations")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});
app.get("/index", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// app.get("/location", (req, res) => {
//   let key = req.header("x-rest-token");
//   if (process.env.KEY === key) {
//     db.collection("locations")
//       .find()
//       .toArray((err, result) => {
//         if (err) throw err;
//         res.send(result);
//       });
//   } else {
//     res.send("Unauthorized request");
//   }
// });

const auth = function (key) {
  if (process.env.KEY === key) {
    return true;
  } else return false;
};

// app.get("/location", (req, res) => {
//   let key = req.header("x-rest-token");
// if (auth(key)) {
//     db.collection("locations")
//       .find()
//       .toArray((err, result) => {
//         if (err) throw err;
//         res.send(result);
//       });
//   } else res.send("Unauthorized request");
// });

app.get("/restaurants", (req, res) => {
  let query = {};
  let stateId = Number(req.query.stateId);
  let mealId = Number(req.query.mealId);
  if (stateId) {
    query = { state_id: stateId };
  } else if (mealId) {
    query = { "mealTypes.mealtype_id": mealId };
  } else {
    query = {};
  }
  db.collection("restaurantData")
    .find(query)
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

app.get(`/filter/:mealId`, (req, res) => {
  let query = {};
  let sort = { cost: 1 };
  let mealId = Number(req.params.mealId);
  let cuisineId = Number(req.query.cuisineId);
  let lcost = Number(req.query.lcost);
  let hcost = Number(req.query.hcost);
  if (req.query.sort) {
    sort = { cost: req.query.sort };
  }
  if (cuisineId && lcost && hcost) {
    query = {
      "mealTypes.mealtype_id": mealId,
      "cuisines.cuisine_id": cuisineId,
      $and: [{ cost: { $gt: lcost, $lt: hcost } }],
    };
  } else if (cuisineId) {
    query = {
      "mealTypes.mealtype_id": mealId,
      "cuisines.cuisine_id": cuisineId,
    };
  } else if (lcost && hcost) {
    query = {
      "mealTypes.mealtype_id": mealId,
      $and: [{ cost: { $gt: lcost, $lt: hcost } }],
    };
  } else {
    query = {
      "mealTypes.mealtype_id": mealId,
    };
  }
  db.collection("restaurantData")
    .find(query)
    .sort(sort)
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

app.get("/mealType", (req, res) => {
  db.collection("mealType")
    .find()
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

app.get("/details/:id", (req, res) => {
  let id = Number(req.params.id);
  db.collection("restaurantData")
    .find({ restaurant_id: id })
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

// app.get('/details/:id',(req,res) => {
//     let id = mongo.ObjectId(req.params.id)
//     db.collection('restaurants').find({_id:id}).toArray((err,result) => {
//         if(err) throw err;
//         res.send(result)
//     })

app.get("/menu/:id", (req, res) => {
  let id = Number(req.params.id);
  db.collection("restaurantMenu")
    .find({ restaurant_id: id })
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

app.post("/menuItem", (req, res) => {
  if (Array.isArray(req.body.id)) {
    db.collection("restaurantMenu")
      .find({ menu_id: { $in: req.body.id } })
      .toArray((err, result) => {
        if (err) throw err;
        res.send(result);
      });
  } else {
    res.send("Invalid Input");
  }
});

app.post("/placeOrder", (req, res) => {
  db.collection("orders").insert(req.body, (err, result) => {
    if (err) throw err;
    res.send("Order Placed");
  });
});

// app.get("/restaurant/:id", (req, res) => {
//   let { id } = req.params;
//   db.collection("zomato")
//     .find({ state_id: Number(id) }, { restaurant_name: 1 })
//     .toArray((err, result) => {
//       if (err) throw err;
//       res.send(result);
//     });
// });

app.get("/orders", (req, res) => {
  let email = req.query.email;
  let query = {};
  if (email) {
    query = { email };
  }
  db.collection("orders")
    .find(query)
    .toArray((err, result) => {
      if (err) throw err;
      res.send(result);
    });
});

app.put("/updateOrder/:id", (req, res) => {
  let oid = Number(req.params.id);
  db.collection("orders").updateOne(
    { orderId: oid },
    {
      $set: {
        status: req.body.status,
        bank_name: req.body.bank_name,
        date: req.body.date,
      },
    },
    (err, result) => {
      if (err) throw err;
      res.send("Order Updated");
    }
  );
});

app.delete("/deleteOrder/:id", (req, res) => {
  let _id = mongo.ObjectId(req.params.id);
  db.collection("orders").remove({ _id }, (err, result) => {
    if (err) throw err;
    res.send("Order Deleted");
  });
});

mongoClient.connect(mongoUrl, (err, client) => {
  if (err) console.log("Error while connecting");
  db = client.db("restaurant");
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});
