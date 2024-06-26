// src/pages/cards/[cardId].js
import { db } from "../../utils/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Image from "next/image";
import Error from "../../components/Error";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../utils/firebase";
import Link from "next/link";
import {
  Container,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";

export default function CardPage({ card }) {
  const [user] = useAuthState(auth);
  const [userOwnsCard, setUserOwnsCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState("Near Mint");
  const [selectedEdition, setSelectedEdition] = useState("");
  const [setName, setSetName] = useState(""); 

  useEffect(() => {
    const checkIfUserOwnsCard = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const collectedCardsSubcollectionRef = collection(
            userDocRef,
            "collectedCards"
          );
          const cardDocRef = doc(collectedCardsSubcollectionRef, card.id);
          const cardDocSnapshot = await getDoc(cardDocRef);

          if (cardDocSnapshot.exists()) {
            setUserOwnsCard(true);
            setSelectedCondition(
              cardDocSnapshot.data().condition || "Near Mint"
            );
            setSelectedEdition(cardDocSnapshot.data().edition || "");
          } else {
            setUserOwnsCard(false);
          }
        } catch (error) {
          console.error("Error checking card ownership:", error);
          setError("Error checking card ownership. Please try again later.");
        }
      }
    };

    checkIfUserOwnsCard();
  }, [user, card.id]);

  useEffect(() => {
    const fetchSetName = async () => {
      if (card.setReference) {
        try {
          // Correctly create the document reference from the path string
          const setDocRef = doc(db, "setCollection", card.setReference); 
          const setDocSnapshot = await getDoc(setDocRef);

          if (setDocSnapshot.exists()) {
            setSetName(setDocSnapshot.data().setName); // Access setName
          } else {
            console.error("Set document not found!");
          }
        } catch (error) {
          console.error("Error fetching set name:", error);
        }
      }
    };

    fetchSetName();
  }, [card.setReference]); 

  const handleAddToCollection = async () => {
    if (!user) {
      setError("You must be logged in to add cards to your collection.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userDocRef = doc(db, "users", user.uid);
      const collectedCardsSubcollectionRef = collection(
        userDocRef,
        "collectedCards"
      );
      const cardDocRef = doc(collectedCardsSubcollectionRef, card.id);

      await setDoc(cardDocRef, {
        condition: selectedCondition,
        edition: selectedEdition,
      });

      setUserOwnsCard(true);
      setLoading(false);
    } catch (error) {
      console.error("Error adding card to collection:", error);
      setError("Error adding card to collection. Please try again later.");
      setLoading(false);
    }
  };

  const handleRemoveFromCollection = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userDocRef = doc(db, "users", user.uid);
      const collectedCardsSubcollectionRef = collection(
        userDocRef,
        "collectedCards"
      );
      const cardDocRef = doc(collectedCardsSubcollectionRef, card.id);

      await deleteDoc(cardDocRef);

      setUserOwnsCard(false);
      setLoading(false);
    } catch (error) {
      console.error("Error removing card from collection:", error);
      setError("Error removing card from collection. Please try again later.");
      setLoading(false);
    }
  };

  const handleConditionChange = async (event) => {
    setSelectedCondition(event.target.value);

    if (user && userOwnsCard) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const collectedCardsSubcollectionRef = collection(
          userDocRef,
          "collectedCards"
        );
        const cardDocRef = doc(collectedCardsSubcollectionRef, card.id);
        await updateDoc(cardDocRef, { condition: event.target.value });
        console.log("Card condition updated in Firestore!");
      } catch (error) {
        console.error("Error updating card condition:", error);
      }
    }
  };

  const handleEditionChange = async (event) => {
    setSelectedEdition(event.target.value);

    if (user && userOwnsCard) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const collectedCardsSubcollectionRef = collection(
          userDocRef,
          "collectedCards"
        );
        const cardDocRef = doc(collectedCardsSubcollectionRef, card.id);
        await updateDoc(cardDocRef, { edition: event.target.value });
        console.log("Card edition updated in Firestore!");
      } catch (error) {
        console.error("Error updating card edition:", error);
      }
    }
  };

  const conditionOptions = [
    "Damaged",
    "Heavy Play",
    "Moderate Play",
    "Light Play",
    "Very Light Play",
    "Near Mint",
    "Graded 1",
    "Graded 1.5",
    "Graded 2",
    "Graded 2.5",
    "Graded 3",
    "Graded 3.5",
    "Graded 4",
    "Graded 4.5",
    "Graded 5",
    "Graded 5.5",
    "Graded 6",
    "Graded 6.5",
    "Graded 7",
    "Graded 7.5",
    "Graded 8",
    "Graded 8.5",
    "Graded 9",
    "Graded 9.5",
    "Graded 10",
  ];

  const editionOptions = ["Unlimited", "1st Edition", "Limited"];

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Grid container spacing={4} alignItems="center"> 
        <Grid item md={4} xs={12}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: 300, 
            paddingTop: '150%', 
            position: 'relative', 
            margin: '0 auto' 
          }}>
            <Image
              src={card.cardImage}
              alt={card.cardName}
              layout="fill" 
              objectFit="contain" 
            />
          </Box>
        </Grid>
        <Grid item md={8} xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            {card.cardName}
          </Typography>

          <Link href={`/sets/${card.setReference.split('/').pop()}`} passHref>
            <Typography variant="body1" gutterBottom sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              {setName} 
            </Typography>
          </Link>

          <Typography variant="body1" gutterBottom>
            Card Number: {card.cardNumber}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Rarity: {card.cardRarity}
          </Typography>

          {error && <Error message={error} />}

          {user && (
            <Box mt={4}>
              {loading ? (
                <Typography variant="body1">Updating collection...</Typography>
              ) : userOwnsCard ? (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="condition-label">Condition:</InputLabel>
                    <Select
                      labelId="condition-label"
                      id="condition"
                      value={selectedCondition}
                      label="Condition"
                      onChange={handleConditionChange}
                    >
                      {conditionOptions.map((condition) => (
                        <MenuItem key={condition} value={condition}>
                          {condition}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="edition-label">Edition:</InputLabel>
                    <Select
                      labelId="edition-label"
                      id="edition"
                      value={selectedEdition}
                      label="Edition"
                      onChange={handleEditionChange}
                    >
                      <MenuItem value=""> </MenuItem>
                      {editionOptions.map((edition) => (
                        <MenuItem key={edition} value={edition}>
                          {edition}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleRemoveFromCollection}
                    disabled={loading}
                  >
                    Remove from Collection
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddToCollection}
                  disabled={loading}
                >
                  Add to Collection
                </Button>
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export async function getStaticPaths() {
  try {
    const cardsRef = collection(db, "cardCollection");
    const cardsSnapshot = await getDocs(cardsRef);

    const paths = cardsSnapshot.docs.map((doc) => ({
      params: { cardId: doc.id.toString() },
    }));

    return { paths, fallback: "blocking" };
  } catch (error) {
    console.error("Error building paths:", error);
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  try {
    const cardDocRef = doc(db, "cardCollection", params.cardId);
    const cardDoc = await getDoc(cardDocRef);

    if (!cardDoc.exists()) {
      return { notFound: true };
    }

    const card = {
      id: cardDoc.id,
      ...cardDoc.data(),
      setReference: cardDoc.data().setReference.id,
    };

    return { props: { card }, revalidate: 60 };
  } catch (error) {
    console.error("Error fetching card:", error);
    return { props: { card: null } };
  }
}