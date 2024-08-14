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

img here later.

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
