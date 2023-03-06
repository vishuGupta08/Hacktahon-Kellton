
const fs = require('fs')
//save a new project
const jwt = require('jsonwebtoken');
const path = require('path')
module.exports.saveProjects = (project) => {
    const json = JSON.stringify(project);
    fs.writeFileSync('projectList.json', json);
  }

  //get project list
  module.exports.getProjects = (id = '', userId ='') =>  {
    const projects = fs.readFileSync('projectList.json');
    if(id){
      return JSON.parse(projects).find(project=> project.id === id )
    }
    if(userId){

      console.log(userId)
      let allProjects = [];
      let result =[]
      allProjects.push(JSON.parse(projects).find(project=> project.userid === userId ))
      for(let project of allProjects){
       
        let projectName = project.name;
     let folderPath =   path.join(__dirname, '..', `/Projects/${projectName}`)
     
        fs.readdir(folderPath, (err, files) => {
          if (err) {
            console.error(err);
            
          } else {
            Object.assign(project, {files: files})
            result.push(project)
            console.log(result)
            // res.send(files);
          }
        });   

      }
     
      
          return result
    }
    return JSON.parse(projects);
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