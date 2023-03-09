const express = require('express');
require('dotenv').config()
const {Configuration , OpenAIApi} = require('openai');
const fs = require('fs')
const util = require('util')
const cors = require("cors");


const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { decode } = require('punycode');
const configuration = new Configuration({
    apiKey : process.env.OPEN_AI_KEY
});
const Helper = require('./Helpers/functions')
const openAI = new OpenAIApi(configuration);
const homedir = require('os').homedir();
const bodyParser = require('body-parser')
const app = express();
app.use(cors());
const multer = require('multer');
const upload = multer();
const path = require('path');
const archiver = require('archiver')
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/generate-testcases', async(req,res)=> {
    try{
        let {projectId, fileNames} = req.body;
        let caseSheetNames = []
     let project = await  Helper.getProjects(projectId);
if(Array.isArray(fileNames) &&  fileNames.length){
    let count =0;
    for(let path of fileNames){
        console.log(__dirname + `/Projects/${project.name}/${path}`)
        if (!fs.existsSync(__dirname + `/Projects/${project.name}/${path}`)) {
            console.log(`File Not Available - ${path}`)
            continue;
        }
        let functionObj = require(__dirname + `/Projects/${project.name}`+ '/'+ path)
        console.log(functionObj)
        
        if(!Object.keys(functionObj).length){
            return res.status(400).json({
                success: false,
                message:"Functions Do Not exist in the file"
              })
        }
        for(let key in functionObj ){
            count++;
            let functionName = key;
            console.log('Generating Test Cases for ', functionName)
            let prompt = `${process.env.PREFIX}${functionObj[functionName]}${process.env.POSTFIX}`
            const response =    await openAI.createCompletion({
                model:'text-davinci-003',
                prompt: `${prompt}`,
                max_tokens: 1000,
                temperature:0.7,
                top_p: 1.0,
                frequency_penalty:0.0,
                presence_penalty:0.0
            }) 
            let answer = response.data.choices[0].text
            
            caseSheetNames.push(`${functionName}.txt`)
var write = fs.writeFile(__dirname + `/Projects/${project.name}/${functionName}.txt`, answer, (err) => {

    if (err) throw err 
    
})


        }
      


    }
    return res.status(200).json({
        success: true,
        message:`Test Cases Generated for ${count} functions`,
        fileNames:caseSheetNames
    })

}else{
    return res.status(400).json({
        success: false,
        message:"No path provided in filepath array"
      })
}  
    }catch(error){
        console.log(error)
return res.status(400).json({
    success: false,
    error: error.response ? error.response.data : 'Server Issue'
})
    }
})

app.post('/signup', (req, res) => {
  try{
    const { username, email, password } = req.body;
  
    // Check if required fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email and password' });
    }
  
    // Check if user already exists
    const users = Helper.getUsers();
    if (users.find(user => user.email === email)) {
      return res.status(409).json({ message: 'User already exists' });
    }
  
    // Save new user to file
    const newUser = { username, email, password, id  : uuidv4() };
    users.push(newUser);
    Helper.saveUsers(users);
  
    return res.status(201).json({ message: 'User created' });
  } catch(error){res.json({message: error.response ? error.response.data : 'Server Issue'})}
  
  });
  
// Endpoint for user login
app.post('/login', (req, res) => {
  try{
      // read user information from file
      fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal server error' });
        }
    
        const users = JSON.parse(data);
        const { username, password } = req.body;
    
        // check if user exists and password is correct
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }
       let token = Helper.generateAccessToken(user.username, user.email, user.id)
       
        // return user information
       return res.json({ username: user.username, name: user.name, token: token });
      });
  } catch(error){res.json({message: error.response ? error.response.data : 'Server Issue'})}

  });

  //create project
  
app.get('/users', (req,res)=> {
  try{
    const users =   Helper.getUsers()
    return res.json({
        success: true,
        message:"Users fetched successfully",
        data: users
    })
  } catch(error){res.json({message: error.response ? error.response.data : 'Server Issue'})}
  
})
//to get all projects of a user
app.get('/projects', async(req,res)=> {
  try{
    const token = req.query.token;

    // If the token is present
    if(!token) return res.json({success: false, message:"Token Missing"})
 
        // Verify the token using jwt.verify method
        const decode = jwt.verify(token, process.env.TOKEN_SECRET);
        
       
    if(!decode){
     return res.json({success: false, message:"Token Verification Failed"})
    }
 //  console.log(decode)
 let projects =   await Helper.getProjects('',decode.id)
 console.log(projects)
 return res.json({
     success: true,
     message:"Projects fetched successfully",
     data: projects
 })
  } catch(error){res.json({message: error.response ? error.response.data : 'Server Issue'})}
})
app.post('/projects', async(req, res) => {
  try{
    // Get token value to the json body
    const token = req.body.token;

    // If the token is present
    if(!token) return res.json({success: false, message:"Token Missing"})
 
        // Verify the token using jwt.verify method
        const decode = jwt.verify(token, process.env.TOKEN_SECRET);
        
       
    if(!decode){
     return res.json({success: false, message:"Token Verification Failed"})
    }
 const { name } = req.body;
 if (!name) {
   return res.status(400).send({ error: 'Name is required' });
 }
 let id =  uuidv4() 
 const dir = `./Projects/${name}`;

 const projects = await Helper.getProjects();
 console.log(projects)
 if (projects.find(project => project.name === name)) {
   return res.status(409).json({ message: 'Project already exists', projectId:project.id });
 }
 const newProject = { name: name, id:id, userid: decode.id};
 
 projects.push(newProject);
//  console.log(projects, newProject)
 Helper.saveProjects(projects);
if(!fs.existsSync(__dirname + '/Projects')){
 fs.mkdirSync('./Projects');
}
 
 fs.mkdirSync(dir);
 return res.json({ success: true, message: 'Project created successfully', projectId:id  });
  } catch(error){res.json({message: error.response ? error.response.data : error})}
  
  });

app.post('/upload', upload.any(), async(req, res) => {
    
  try{
    const token = req.body.token;
    const projectId = req.body.projectId
        // If the token is present
        if(!token) return res.json({success: false, message:"Token Missing"})
        if(!projectId) return res.json({success: false, message:"Project ID Missing"})
     
            // Verify the token using jwt.verify method
            const decode = jwt.verify(token, process.env.TOKEN_SECRET);
            
           
        if(!decode){
         return res.json({success: false, message:"Token Verification Failed"})
        }
        let project = await Helper.getProjects(projectId, '')
        console.log(project)
        // Get the files from the request
        const files = req.files;
      
        // Define an array to hold the file upload promises
        const uploadPromises = [];
      
        // Loop through each file and create a unique filename based on the current timestamp
        for (let fileKey of files) {
          const file = fileKey;
          const filename = file.originalname;
      
          // Set the path where the file will be saved
          const uploadPath = path.join(__dirname, `/Projects/${project.name}`, filename);
      console.log(uploadPath)
          // Create a promise to save the file using the file system module
          const uploadPromise = new Promise((resolve, reject) => {
    
            fs.writeFile(uploadPath, file.buffer, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(filename);
              }
            });
          });
      
          // Add the promise to the uploadPromises array
          uploadPromises.push(uploadPromise);
        }
      
        // Wait for all promises to resolve
        Promise.all(uploadPromises)
          .then((filenames) => {
            res.json({
              success: true,
              message: 'Files uploaded successfully: ' + filenames.join(', ')});
          })
          .catch((err) => {
            console.error(err);
            res.status(500).json({
              success : false,
              message: 'Error uploading files'+ err?.response?.data});
          });
  } catch(error){res.json({message: error.response ? error.response.data : 'Server Issue'})} 
  
  });
  
  app.post('/files', async(req, res) => {
try{
  const {filenames,projectId} = req.body;
  const project =await Helper.getProjects(projectId);
  let arr = []
  var archive = archiver('zip', {
    zlib: { level: 9 } // Set the compression level
  });
  // Add the files to the archive
  for(let file of filenames){
    let path = __dirname + '/Projects' + `/${project.name}`+ `/${file}` 
    archive.file(path, { name: file });
  }
  // Set the name of the archive
  res.attachment(`Test Cases -${project.name}.zip`);

  // Send the archive as a response
  archive.pipe(res);
  archive.finalize();
 
  
} catch(error){res.json({message: error.response ? error.response.data : 'Server Issue'})}
  
  });
  

  function getTotalFileCount(projects) {
    let jsFiles = 0, txtFiles = 0;
    projects.forEach(project => {
      txtFiles += project.testCaseFiles.length
      jsFiles +=  project.uploadedFiles.length;
    });
    return {
      totalFiles: jsFiles,
      testCases : txtFiles
    };
  }

  app.get('/dashboard', async(req,res)=> {
    try{
         // Get token value to the json body
    const token = req.query.token;
    // If the token is present
    if(!token) return res.json({success: false, message:"Token Missing"})
        // Verify the token using jwt.verify method
        const decode = jwt.verify(token, process.env.TOKEN_SECRET);
    if(!decode){
     return res.json({success: false, message:"Token Verification Failed"})
    }
    let projects = await Helper.getProjects('', decode.id);
let totalProjects = projects.length;
let countObj = getTotalFileCount(projects);

      return res.json({
        success: true,
        data: {
          totalProjects: totalProjects,
          ...countObj
        }
      })
    }catch(error){
      res.json({
        message: error.response ? error.response.data : 'Server Issue'
      })
    }
  })
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server listening on port ${port}`));


