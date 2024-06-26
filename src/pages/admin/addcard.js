// src/pages/admin/addcard.js
import { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { collection, addDoc, getDocs, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../utils/firebase";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export default function AddCardPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [sets, setSets] = useState([]);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardRarity, setCardRarity] = useState("");
  const [cardImage, setCardImage] = useState("");
  const [selectedSet, setSelectedSet] = useState("");
  const [addCardError, setAddCardError] = useState(null);
  const [addCardSuccess, setAddCardSuccess] = useState(false);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const setsCollectionRef = collection(db, "setCollection");
        const setsSnapshot = await getDocs(setsCollectionRef);
        const setsData = setsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSets(setsData);
      } catch (error) {
        console.error("Error fetching sets:", error);
      }
    };

    fetchSets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddCardError(null);
    setAddCardSuccess(false);

    if (
      !cardName ||
      !cardNumber ||
      !cardRarity ||
      !cardImage ||
      !selectedSet
    ) {
      setAddCardError("Please fill in all fields.");
      return;
    }

    try {
      const setRef = doc(db, "setCollection", selectedSet);
      const cardsCollectionRef = collection(db, "cardCollection");
      await addDoc(cardsCollectionRef, {
        cardName,
        cardNumber,
        cardRarity,
        cardImage,
        setReference: setRef,
      });

      setAddCardSuccess(true);
      setCardName("");
      setCardNumber("");
      setCardRarity("");
      setCardImage("");
      setSelectedSet("");

      setTimeout(() => {
        router.push("/sets");
      }, 1500);
    } catch (error) {
      console.error("Error adding card:", error);
      setAddCardError("Error adding card. Please try again later.");
    }
  };

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1">Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="md"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1">Error: {error.message}</Typography>
      </Container>
    );
  }

  if (user && user.uid === "UKIeRQSd52YEL0dLYUIWl6S4coD2") {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Card
        </Typography>

        {addCardError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {addCardError}
          </Alert>
        )}

        {addCardSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Card added successfully!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <TextField
            label="Card Name"
            variant="outlined"
            fullWidth
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            label="Card Number"
            variant="outlined"
            fullWidth
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            label="Card Rarity"
            variant="outlined"
            fullWidth
            value={cardRarity}
            onChange={(e) => setCardRarity(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            label="Card Image URL"
            variant="outlined"
            fullWidth
            value={cardImage}
            onChange={(e) => setCardImage(e.target.value)}
            margin="normal"
            required
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="set-select-label">Select Set</InputLabel>
            <Select
              labelId="set-select-label"
              id="setSelect"
              value={selectedSet}
              label="Select Set"
              onChange={(e) => setSelectedSet(e.target.value)}
              required
            >
              <MenuItem value="">Select a set</MenuItem>
              {sets.map((set) => (
                <MenuItem key={set.id} value={set.id}>
                  {set.setName} ({set.setAbbreviation})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            sx={{ mt: 2 }}
          >
            Add Card
          </Button>
        </Box>
      </Container>
    );
  } else {
    return (
      <Container
        maxWidth="md"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1">
          You are not authorized to view this page.
        </Typography>
      </Container>
    );
  }
}