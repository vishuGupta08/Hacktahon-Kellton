
const fs = require('fs')
//save a new project
const jwt = require('jsonwebtoken');
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
      return JSON.parse(projects).find(project=> project.userid === userId )
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