Setup:

Backend:
cd .\backend\node-express\
npm -i
npm run start

Frontend:
cd .\frontend\sellcars\
npm -i
npm run serve


The Code still needs a bit of tuning. More error-handling needs to be added and a better and safer data-input validation (especially for the edit-function).

The styling could be better:
- Edit-window doesnt consider screen size correctly
- Overall design could be improved
- Animations would be a nice feature

The login function needs to use cookies so the user actually stays logged in. This means a logout button is also needed.
The Customers should be linked to certain users. Right now every user has access to every customer.
The readability can also be improved (f.e. by Refactoring and splitting the code up) 
