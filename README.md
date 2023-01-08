# NODEPOP
API for a second hand ads portal, created using Express, Node.js and mongoDB.
Relatable actions: edit, delete and filter ads.  
 
## Install dependencies
`npm install` 
## Database 
`node initDB.js`  

## Starting the application  
Production mode: `npm start`
Windows development mode: `npm run devWin`
Development mode on windows: `npm run devWin`  
Development mode on linux platforms: `npm run dev`

### Full list of ads  
`http://localhost:3000/api`

### Allowed filters  
The following filters are supported:  

- **item=**  
*Example:* `item=iphone`.  
- **sale=** for sale (*true*) or buy (*false*).  
- **tag=** 
    - lifestyle
    - mobile
    - motor
    - work  
- **price=** 
  - *number* example: `50` exact price
  - *number*- example: `30-` from 30
  - *number*-*number* example: `20-100` from 20 to 100 
  -*number* example: `-60` up to 60  
  
- **Pagination**
  - skip=*number* number of results to skip
  - limit=*number* number of results to display
- **Sort**  
  - sort=*field* field to sort the results. The supported fields are:
    - name
    - price
    - sale
- **selection of fields to return**
  - fields=*string* --> the string indicates the fields to return, separated by `+`. If you do not want the _id of the database, add `%20-_id`.  
  Example:  
  `http://localhost:3000/api/?fields=item+price%20-_id`  
---  
## Images
Ask the API for the service at the url /images/announcements/*filename.extension*.  
For example: `http://localhost:3000/images/anuncios/bike.jpeg`.  

---
## Number of elements per tag allowed
Returns an object with the allowed tags and how many ads of each tag are contained in the database.  
`http://localhost:3000/api/alltags`  
**Attention:** not to be confused with the call to get the ads containing a given ad containing a given tag, which would be  
`http://localhost:3000/api/?tag=...` or
`http://localhost:3000/api?tag=...`  

---  
## Creation of advertisements
All fields must be provided via POST method.
The API will respond with a 201 code and an object with a correctly created announcement message.  


## WEB PAGE
Under the address `http://localhost:3000` the server will show a test web page containing the ads contained in the database.