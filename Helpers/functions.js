
const fs = require('fs')
//save a new project
const jwt = require('jsonwebtoken');
const path = require('path')
module.exports.saveProjects = (project) => {
    const json = JSON.stringify(project);
    fs.writeFileSync('projectList.json', json);
  }

  //get project list
  module.exports.getProjects = async(id = '', userId ='') =>  {
  try{
  
    const projects =   fs.readFileSync(path.join(__dirname, '..','projectList.json' ), 'utf8');
    if(id){
      let projectData = JSON.parse(projects);
      return projectData.find(project=> project.id === id )
    }
    if(userId){
// return JSON.parse(projects).find(project=> project.userid === userId )
      console.log('userId')
      let allProjects = [];
      
      allProjects = JSON.parse(projects).filter(project=> project.userid === userId )
      let result =[]
      console.log(allProjects)
      for(let project of allProjects){
       
        let projectName = project.name;
        // console.log(projectName)
     let folderPath =   path.join(__dirname, '..', `/Projects/${projectName}`)
     console.log(folderPath)
     let files = await fs.promises.readdir(folderPath);
     let fileData = segregateFilenames(files)
    Object.assign(project,fileData);
    result.push(project);   

      }
     
      // console.log(result)
          return result;
    }
    // console.log(JSON.parse(projects))
    console.log('third')
    return JSON.parse(projects);
  }catch(error){
  console.log(error?.response?.data)
  }
    
  }


    // Helper function to get users from file
    module.exports.getUsers = () =>  {
        const users = fs.readFileSync('users.json');
        return JSON.parse(users);
      }
      
      // Helper function to save users to file
      module.exports.saveUsers = (users) =>  {
        const json = JSON.stringify(users);
        fs.writeFileSync('users.json', json);
      }
    //Helper function to generate accesstoken
    module.exports.generateAccessToken = (username,email, id) =>  {
        return jwt.sign({username:username, email:email, id:id}, process.env.TOKEN_SECRET);
      }

      function segregateFilenames(arr) {
        const txtFiles = [];
        const jsFiles = [];
      
        for (let i = 0; i < arr.length; i++) {
          const filename = arr[i];
          const extension = filename.slice(filename.lastIndexOf("."));
      
          if (extension === ".txt") {
            txtFiles.push(filename);
          } else if (extension === ".js") {
            jsFiles.push(filename);
          }
        }
        return {
          testCaseFiles: txtFiles,
          uploadedFiles: jsFiles
        }
      }