### Yugioh Collection Tracker

An app for tracking all of your yugioh sets, specifically monitoring completion and conditions.

## Summary:

I never got around to hosting this project, so I am releasing the code. 
This uses firebase NoSQL for user data, as well as all the cards data. You will have to create the database yourself. 
Authentication is also through firebase.

# Technology Stack:

- Next.js (version 14.2.4)
- Firebase (authentication, Firestore database)	  
- Material UI for Styling

# Admin

- Admin pages for adding sets (/admin/addset) and cards (/admin/addcard)
- Access restricted to your UID ('UKIeRQSd52YEL0dLYUIWl6S4coD2')


## Demo
<details><summary>Click me to view photos</summary>
![MqlBPvD](https://github.com/user-attachments/assets/28ab41dc-f0ed-42af-9ffd-4ba267a9a552)
![51hvwZS](https://github.com/user-attachments/assets/93ea71ca-40c0-4988-a017-2e1047a5ed23)
![9zddwFC](https://github.com/user-attachments/assets/212d1de4-c0ad-4b56-9b1b-7958e7a7553e)
![ssHOxZu](https://github.com/user-attachments/assets/cdc275c6-5609-4cdd-b014-f2a5f8c2051e)
![WDpc5Ai](https://github.com/user-attachments/assets/2b6cce6f-91a7-4f25-a87e-925ad59bb28f)
![RQMSOxo](https://github.com/user-attachments/assets/d39147a2-307d-4110-a6be-8709c963d087)
</details>

## Database Layout

# Firestore Data Structure:

- setCollection: Documents for sets 
    - setName
    - setAbbreviation
    - setImage
    - setCount

- cardCollection: Documents for cards
    - cardName
    - cardNumber
    - cardRarity,
    - cardImage
    - setReference

- users: Documents for users
    - userName
    - userImage
    - userBio
    - collectedCards: Documents for collectedCards
        - condition
        - edition

 - User Authentication: Basic Firebase Google Authentication (popup method)
