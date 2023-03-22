var express = require('express');
var ejs = require('ejs');
var app = express();
let dbo = require('./dbConnection');
let ObjectID = dbo.ObjectID;
const bodyparser = require('body-parser');
app.use(express.static('public'));

app.set('view engine','ejs');

app.use(bodyparser.urlencoded({extended:true}));

app.get('/',(req,res)=>{      //index page
  res.render('pages/index.ejs');
})

app.use('/fixapp',(req,res)=>{ //user registration for confirming appointment page
  let token=''; //use for displaying token number
  if(req.query.status)
  {
    token = req.query.status;
  }
  res.render('pages/fixapp',{token});
})

app.use('/place',async (req,res)=>{
  let database= await dbo.getdatabase();
  const collection = database.collection('abc');
  let tokenno=0;
  //store datas in mysql table
  //find the token number by grouping the doctors name counting the particular doctor.
  //send the token by redirecting
  let newappoinment = {
    name : req.body.name,
    doctorname : req.body.doctorname,
    address : req.body.address,
    phone : req.body.phone
  }

  await collection.insertOne(newappoinment);
  tokenno = await collection.count({doctorname:req.body.doctorname});
  res.redirect(`/fixapp?status=${tokenno}`);
})


app.get('/admin',(req,res)=>{            //hospital login page
    res.render('pages/admin');
})

app.use('/admindashboard',async(req,res)=>{  //hospital appoinment monitoring page

  let database= await dbo.getdatabase();
  const collection = database.collection('abc');
  const cursor = collection.find({}); //retrieving all the data
  let appoinments = await cursor.toArray();
  let id;
// console.log(appoinments);
  if(req.query.visited_id) //deleting record
  {
    id = req.query.visited_id;
    await collection.deleteOne({_id:new ObjectID(id)});
    return res.redirect('/admindashboard'); 
  }
  res.render('pages/dashboard',{appoinments}); 
})


app.listen(8092);