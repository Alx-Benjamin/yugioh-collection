import { db } from "../utils/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Image from "next/image";
import Pagination from "../components/Pagination";
import Error from "../components/Error";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../utils/firebase";
import Link from "next/link";
import {
  Container,
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
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
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import DeleteIcon from "@mui/icons-material/Delete";

export default function CollectionPage() {
  const [user] = useAuthState(auth);
  const [userCards, setUserCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("grid");
  const [selectedSet, setSelectedSet] = useState("");
  const [allSets, setAllSets] = useState([]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const handleSetChange = (event) => {
    setSelectedSet(event.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchUserCards = async () => {
      if (user) {
        try {
          setLoading(true);
          setError(null);

          const userDocRef = doc(db, "users", user.uid);
          const collectedCardsSubcollectionRef = collection(
            userDocRef,
            "collectedCards"
          );

          const querySnapshot = await getDocs(
            collectedCardsSubcollectionRef
          );

          const cardPromises = querySnapshot.docs.map(async (cardDoc) => {
            const cardId = cardDoc.id;
            const cardRef = doc(db, "cardCollection", cardId);
            const cardSnapshot = await getDoc(cardRef);
            return {
              id: cardSnapshot.id,
              ...cardSnapshot.data(),
              condition: cardDoc.data().condition,
              edition: cardDoc.data().edition,
            };
          });

          const cardsData = await Promise.all(cardPromises);
          setUserCards(cardsData);
        } catch (error) {
          console.error("Error fetching user cards:", error);
          setError("Error loading your collection. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserCards();
  }, [user]);

  useEffect(() => {
    const fetchAllSets = async () => {
      try {
        const setsSnapshot = await getDocs(collection(db, "setCollection"));
        const setsData = setsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllSets(setsData);
      } catch (error) {
        console.error("Error fetching sets:", error);
      }
    };

    fetchAllSets();
  }, []);

  const filteredCards = userCards
    .filter((card) =>
      card.cardName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (card) => selectedSet === "" || card.setReference.id === selectedSet
    );

  const sortedCards =
    sortBy === "nameAsc"
      ? [...filteredCards].sort((a, b) =>
          a.cardName.localeCompare(b.cardName)
        )
      : sortBy === "nameDesc"
      ? [...filteredCards].sort((a, b) =>
          b.cardName.localeCompare(a.cardName)
        )
      : filteredCards;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCards = sortedCards.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRemoveFromCollection = async (cardId) => {
    if (!user) {
      return; // Do nothing if user is not logged in
    }
  
    try {
      setLoading(true);
      setError(null);
  
      // Get reference to the specific card document in the subcollection
      const userDocRef = doc(db, "users", user.uid);
      const cardDocRef = doc(collection(userDocRef, "collectedCards"), cardId); 
  
      // Delete the card document from the subcollection
      await deleteDoc(cardDocRef);
  
      // Update the UI by removing the card from the userCards array
      setUserCards(userCards.filter((card) => card.id !== cardId)); 
  
      setLoading(false);
    } catch (error) {
      console.error("Error removing card from collection:", error);
      setError("Error removing card from collection. Please try again later.");
      setLoading(false);
    }
  };

  if (!user) {
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
          Please log in to view your collection.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Collection
      </Typography>

      {error && <Error message={error} />}

      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Search"
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
              <MenuItem value="nameAsc">Name Ascending</MenuItem>
              <MenuItem value="nameDesc">Name Descending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel id="set-filter-label">Filter by Set</InputLabel>
            <Select
              labelId="set-filter-label"
              id="set-filter"
              value={selectedSet}
              label="Filter by Set"
              onChange={handleSetChange}
            >
              <MenuItem value="">All Sets</MenuItem>
              {allSets.map((set) => (
                <MenuItem key={set.id} value={set.id}>
                  {set.setName}
                </MenuItem>
              ))}
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

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
          <CircularProgress />
        </Box>
      ) : currentCards.length === 0 ? (
        <Typography variant="body1">
          You have not added any cards to your collection yet!
        </Typography>
      ) : (
        <>
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
                        Condition: {card.condition}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Edition: {card.edition}
                      </Typography>
                    </Link>
                    <Button
                      onClick={() => handleRemoveFromCollection(card.id)}
                      variant="contained"
                      color="error"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        minWidth: 0,
                        padding: "4px 8px",
                        "&:hover": { backgroundColor: "red.700" },
                      }}
                      aria-label={`Remove ${card.cardName} from collection`}
                    >
                      ×
                    </Button>
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
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              Condition: {card.condition}
                            </Typography>
                            <br />
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              Edition: {card.edition}
                            </Typography>
                          </>
                        }
                      />
                    </ListItemButton>
                  </Link>
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveFromCollection(card.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}

      <Box mt={4} sx={{ display: "flex", justifyContent: "center" }}>
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={sortedCards.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      </Box>
    </Container>
  );
}