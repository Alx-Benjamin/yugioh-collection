// src/pages/sets/[setId].js
import { db } from "../../utils/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Pagination from "../../components/Pagination";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../utils/firebase";
import {
  Container,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

export default function SetPage({ set, initialCards }) {
  const [cards, setCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [view, setView] = useState("grid");
  const [user] = useAuthState(auth);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const filteredCards = initialCards.filter((card) =>
      card.cardName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sorting cards
    const sortedCards = [...filteredCards].sort((a, b) => {
      switch (sortBy) {
        case "nameAsc":
          return a.cardName.localeCompare(b.cardName);
        case "nameDesc":
          return b.cardName.localeCompare(a.cardName);
        case "numberAsc":
          return a.cardNumber.localeCompare(b.cardNumber, undefined, {
            numeric: true,
          });
        case "numberDesc":
          return b.cardNumber.localeCompare(a.cardNumber, undefined, {
            numeric: true,
          });
        default:
          return 0; // No sorting by default
      }
    });

    setCards(sortedCards);
  }, [searchTerm, sortBy, initialCards]);

  useEffect(() => {
    // Fetch cards and set userOwnsCard for each
    const fetchCards = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const collectedCardsRef = collection(
            userDocRef,
            "collectedCards"
          );
          const collectedCardsSnapshot = await getDocs(collectedCardsRef);
          const userCollectedCardIds = collectedCardsSnapshot.docs.map(
            (doc) => doc.id
          );

          const updatedCards = initialCards.map((card) => ({
            ...card,
            userOwnsCard: userCollectedCardIds.includes(card.id),
          }));

          setCards(updatedCards);
        } catch (error) {
          console.error("Error fetching collected cards:", error);
        }
      } else {
        // Set userOwnsCard to false if not logged in
        const updatedCards = initialCards.map((card) => ({
          ...card,
          userOwnsCard: false,
        }));
        setCards(updatedCards);
      }
    };

    fetchCards();
  }, [initialCards, user]);

  const handleToggleCollection = async (cardId) => {
    if (!user) {
      console.error("User not logged in");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const collectedCardsSubcollectionRef = collection(
        userDocRef,
        "collectedCards"
      );
      const cardDocRef = doc(collectedCardsSubcollectionRef, cardId);

      const cardToUpdate = cards.find((card) => card.id === cardId);
      if (cardToUpdate.userOwnsCard) {
        // Remove from collection
        await deleteDoc(cardDocRef);
      } else {
        // Add to collection with default values
        await setDoc(cardDocRef, {
          condition: "Near Mint",
          edition: "Unlimited",
        });
      }

      // Update UI
      setCards(
        cards.map((card) =>
          card.id === cardId
            ? { ...card, userOwnsCard: !card.userOwnsCard }
            : card
        )
      );
    } catch (error) {
      console.error("Error updating collection:", error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCards = cards.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {set.setName}
      </Typography>

      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Search cards in this set..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="sort-label">Sort by</InputLabel>
            <Select
              labelId="sort-label"
              id="sort"
              value={sortBy}
              label="Sort by"
              onChange={handleSortChange}
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="nameAsc">Name (A-Z)</MenuItem>
              <MenuItem value="nameDesc">Name (Z-A)</MenuItem>
              <MenuItem value="numberAsc">Card Number (Ascending)</MenuItem>
              <MenuItem value="numberDesc">Card Number (Descending)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(event, newView) => {
              if (newView !== null) {
                setView(newView);
              }
            }}
            fullWidth
            sx={{ display: "flex" }}
          >
            <ToggleButton value="grid" aria-label="grid view">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <FormatListBulletedIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>

      {cards.length === 0 && (
        <Typography variant="body1">
          No cards found in this set.
        </Typography>
      )}

      {view === "grid" && (
        <Grid container spacing={4}>
          {currentCards.map((card) => (
            <Grid item key={card.id} xs={12} sm={6} md={4} lg={3}>
              <Box sx={{ position: "relative" }}>
                <Link
                  href={`/cards/${card.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      paddingTop: "150%", // Aspect ratio 3:4
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: 1,
                      backgroundColor: "grey.200",
                      "&:hover": { opacity: 0.8 },
                    }}
                  >
                    <Image
                      src={card.cardImage}
                      alt={card.cardName}
                      layout="fill"
                      objectFit="contain"
                    />
                  </Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 2, color: "text.primary" }}
                  >
                    {card.cardName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.cardNumber}
                  </Typography>
                </Link>

                {user && (
                  <Chip
                    label={card.userOwnsCard ? "Collected" : "Not Collected"}
                    color={card.userOwnsCard ? "success" : "default"}
                    onClick={() => handleToggleCollection(card.id)}
                    sx={{
                      cursor: "pointer",
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                  />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {view === "list" && (
        <List>
          {currentCards.map((card) => (
            <ListItem
              key={card.id}
              sx={{
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Link
                href={`/cards/${card.id}`}
                style={{ textDecoration: "none", width: "100%" }}
              >
                <ListItemButton>
                  <ListItemIcon>
                    <Box sx={{ width: 80, height: 100, position: "relative" }}>
                      <Image
                        src={card.cardImage}
                        alt={card.cardName}
                        layout="fill"
                        objectFit="contain"
                      />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={card.cardName}
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {card.cardNumber}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </Link>

              {user && (
                <Chip
                  label={card.userOwnsCard ? "Collected" : "Not Collected"}
                  color={card.userOwnsCard ? "success" : "default"}
                  onClick={() => handleToggleCollection(card.id)}
                  sx={{ cursor: "pointer" }}
                />
              )}
            </ListItem>
          ))}
        </List>
      )}

      <Box mt={4} sx={{ display: "flex", justifyContent: "center" }}>
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={cards.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      </Box>
    </Container>
  );
}

export async function getStaticPaths() {
  try {
    const setsCollection = collection(db, "setCollection");
    const setsSnapshot = await getDocs(setsCollection);
    const paths = setsSnapshot.docs.map((doc) => ({
      params: { setId: doc.id },
    }));

    return { paths, fallback: "blocking" };
  } catch (error) {
    console.error("Error fetching set IDs:", error);
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  try {
    const setDocRef = doc(db, "setCollection", params.setId);
    const setDoc = await getDoc(setDocRef);

    if (!setDoc.exists()) {
      return { notFound: true };
    }

    const set = { id: setDoc.id, ...setDoc.data() };

    const cardsQuery = query(
      collection(db, "cardCollection"),
      where("setReference", "==", setDocRef)
    );
    const cardsSnapshot = await getDocs(cardsQuery);
    const initialCards = cardsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      setReference: doc.data().setReference.id,
    }));

    return {
      props: { set, initialCards },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching set or cards:", error);
    return {
      props: { set: {}, initialCards: [] },
    };
  }
}