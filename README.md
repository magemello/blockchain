Blockchain Example


- 1
```
npm init
```
- 2
```
npm install --save crypto-js express nodemon babel-preset-env babel-cli express http unirest ws
```
- 3
```
touch  .babelrc 
```
- 4 Add the following line to the .babelrc file
```
{ "presets": ["env"] } 
```
- 5 Open the package.json and add the following line
```
"dev": "nodemon --exec babel-node server.js"
```
- 6 Create our main class
```
touch server.js
```
- 7 Run our app
```
npm run dev
```

# Step 1
git checkout 9e68ff04de8161b9001f22845ff2b3178d8b8bf9