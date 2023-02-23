const express = require('express');
require('dotenv').config()
const {Configuration , OpenAIApi} = require('openai');
const fs = require('fs')
const util = require('util')
const app = express();

app.use(express.json());

const configuration = new Configuration({
    apiKey : process.env.OPEN_AI_KEY
});

const openAI = new OpenAIApi(configuration);

app.post('/find-complexity', async(req,res)=> {
    try{
        arr = []
        let functionObj = require('./function')
        let count =0;
        for(let key in functionObj ){
            count++;
            let functionName = key;
            console.log(functionName);
            let prompt = `Create four test cases for this function. ${functionObj[functionName]}.  The test cases are:  `
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
var write = fs.writeFile(`TEST CASE - ${functionName}.txt`, answer, (err) => {

    if (err) throw err 
    
})


        }
        return res.status(200).json({
            success: true,
            message:`Test Cases Generated for ${count} functions`
        })
    }catch(error){
        console.log(error)
return res.status(400).json({
    success: false,
    error: error.response ? error.response.data : 'Server Issue'
})
    }
})

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server listening on port ${port}`));


