// src/pages/index.js
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../utils/firebase";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import Link from "next/link";
import {
  Box,
  Typography,
  Container,
  Grid,
  CircularProgress,
  LinearProgress,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import Pagination from "../components/Pagination";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [userCollection, setUserCollection] = useState([]);
  const [allSetsData, setAllSetsData] = useState([]);
  const [cardHealthData, setCardHealthData] = useState([]);
  const [editionData, setEditionData] = useState([]);
  const [rarityData, setRarityData] = useState([]);
  const [setCompletionData, setSetCompletionData] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [setsPerPage] = useState(6);

  // Search and sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const fetchUserCollection = async () => {
      setLoading(true);
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const collectedCardsSubcollectionRef = collection(
              userDocRef,
              "collectedCards"
            );

            const collectedCardsSnapshot = await getDocs(
              collectedCardsSubcollectionRef
            );

            const cardsSnapshot = await getDocs(
              collection(db, "cardCollection")
            );
            const allCards = cardsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            const userCards = collectedCardsSnapshot.docs.map(
              (collectedCardDoc) => {
                const cardId = collectedCardDoc.id;
                const cardData = allCards.find((card) => card.id === cardId);
                return {
                  ...cardData,
                  condition: collectedCardDoc.data().condition,
                  edition: collectedCardDoc.data().edition,
                };
              }
            );

            setUserCollection(userCards);
          }
        } catch (error) {
          console.error("Error fetching user collection:", error);
        }
      }
      setLoading(false);
    };

    fetchUserCollection();
  }, [user]);

  useEffect(() => {
    const fetchAllSets = async () => {
      try {
        const setCollectionRef = collection(db, "setCollection");
        const setDocsSnapshot = await getDocs(setCollectionRef);

        const setsData = setDocsSnapshot.docs.map((setDoc) => ({
          id: setDoc.id,
          ...setDoc.data(),
        }));

        setAllSetsData(setsData);
      } catch (error) {
        console.error("Error fetching all sets:", error);
      }
    };

    fetchAllSets();
  }, []);

  useEffect(() => {
    const calculateSetCompletion = () => {
      const updatedSetsData = allSetsData.map((set) => {
        const cardsInSet = userCollection.filter(
          (card) => card.setReference.id === set.id
        );

        const completion = (cardsInSet.length / set.setCount) * 100 || 0;

        const firstEditionCount = cardsInSet.filter(
          (card) => card.edition === "1st Edition"
        ).length;
        const firstEditionPercentage =
          (firstEditionCount / cardsInSet.length) * 100 || 0;

        return {
          ...set,
          collectedCards: cardsInSet.length,
          completion,
          totalCards: set.setCount,
          firstEditionPercentage,
        };
      });

      const filteredSetsData = updatedSetsData.filter(
        (set) => set.collectedCards > 0
      );

      setSetCompletionData(filteredSetsData);
    };

    if (userCollection.length > 0 && allSetsData.length > 0) {
      calculateSetCompletion();
    }
  }, [userCollection, allSetsData]);

  useEffect(() => {
    if (userCollection && userCollection.length > 0) {
      const healthCounts = {
        Damaged: 0,
        "Heavy Play": 0,
        "Moderate Play": 0,
        "Light Play": 0,
        "Very Light Play": 0,
        "Near Mint": 0,
        Graded: 0,
      };
      userCollection.forEach((card) => {
        if (card.condition.startsWith("Graded")) {
          healthCounts.Graded++;
        } else {
          healthCounts[card.condition]++;
        }
      });
      setCardHealthData(healthCounts);

      const editionCounts = {
        Unlimited: 0,
        "1st Edition": 0,
        Limited: 0,
      };
      userCollection.forEach((card) => {
        editionCounts[card.edition || "Unlimited"]++;
      });
      setEditionData(editionCounts);

      const rarityCounts = {};
      userCollection.forEach((card) => {
        if (!rarityCounts[card.cardRarity]) {
          rarityCounts[card.cardRarity] = 0;
        }
        rarityCounts[card.cardRarity]++;
      });
      setRarityData(rarityCounts);
    }
  }, [userCollection]);

  const generatePieChartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title,
      },
    },
  });

  const indexOfLastSet = currentPage * setsPerPage;
  const indexOfFirstSet = indexOfLastSet - setsPerPage;
  const currentSets = setCompletionData
    .filter((set) =>
      set.setName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "mostComplete":
          return b.completion - a.completion;
        case "leastComplete":
          return a.completion - b.completion;
        case "mostFirstEdition":
          return b.firstEditionPercentage - a.firstEditionPercentage;
        case "leastFirstEdition":
          return a.firstEditionPercentage - b.firstEditionPercentage;
        default:
          return a.setName.localeCompare(b.setName);
      }
    })
    .slice(indexOfFirstSet, indexOfLastSet);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
        <Typography variant="body1" mt={2}>
          Loading your collection...
        </Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container
        maxWidth="md"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to your new favorite Yu-Gi-Oh! Collection Tracker
        </Typography>
        <Box mt={2}>
          <Typography variant="body1">
            Please log in to start tracking your collection.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome, {user.displayName}!
      </Typography>

      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h5" mt={6} mb={2}>
          Set Completion
        </Typography>

        <FormControl sx={{ minWidth: 150, mb: 2 }}>
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            id="sort-select"
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="mostComplete">Most Complete</MenuItem>
            <MenuItem value="leastComplete">Least Complete</MenuItem>
            <MenuItem value="mostFirstEdition">Most 1st Edition</MenuItem>
            <MenuItem value="leastFirstEdition">Least 1st Edition</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Search Sets"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <Grid container spacing={4}>
        {currentSets.map((set) => (
          <Grid item key={set.id} xs={12} sm={6} md={4}>
            <Box>
              <Link href={`/sets/${set.id}`} passHref>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {set.setName}
                </Typography>
              </Link>

              <Pie
                data={{
                  labels: ["Collected", "Remaining"],
                  datasets: [
                    {
                      label: "Set Completion",
                      data: [
                        set.collectedCards,
                        set.totalCards - set.collectedCards,
                      ],
                      backgroundColor: ["#36A2EB", "#FF6384"],
                      hoverOffset: 4,
                    },
                  ],
                }}
                options={generatePieChartOptions(
                  `${set.completion.toFixed(1)}%`
                )}
              />

              <Link href={`/sets/${set.id}`} passHref>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Total cards in set: {set.totalCards}
                </Typography>
              </Link>
              <Link href={`/sets/${set.id}`} passHref>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  You have: {set.collectedCards}
                </Typography>
              </Link>
              <Link href={`/sets/${set.id}`} passHref>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  1st Edition: {set.firstEditionPercentage.toFixed(1)}%
                </Typography>
              </Link>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box mt={4} display="flex" justifyContent="center">
        <Pagination
          itemsPerPage={setsPerPage}
          totalItems={
            setCompletionData.filter((set) =>
              set.setName.toLowerCase().includes(searchTerm.toLowerCase())
            ).length
          }
          paginate={paginate}
          currentPage={currentPage}
        />
      </Box>

      <Typography variant="h5" mt={6} mb={2}>
        Card Health
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(cardHealthData).map(([condition, count]) => (
          <Grid item key={condition} xs={12} sm={6} md={4}>
            <Typography variant="subtitle1">{condition}</Typography>
            <LinearProgress
              variant="determinate"
              value={(count / userCollection.length) * 100}
            />
            <Typography variant="body2" color="text.secondary">
              {count} cards (
              {((count / userCollection.length) * 100).toFixed(1)}%)
            </Typography>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4} mt={6}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" mb={2}>
            Edition Distribution
          </Typography>
          <Pie
            data={{
              labels: Object.keys(editionData),
              datasets: [
                {
                  label: "Edition Distribution",
                  data: Object.values(editionData),
                  backgroundColor: ["#FFCE56", "#36A2EB", "#FF6384"],
                  hoverOffset: 4,
                },
              ],
            }}
            options={generatePieChartOptions("Edition Distribution")}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h5" mb={2}>
            Rarity Distribution
          </Typography>
          <Pie
            data={{
              labels: Object.keys(rarityData),
              datasets: [
                {
                  label: "Rarity Distribution",
                  data: Object.values(rarityData),
                  backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#F7464A",
                  ],
                  hoverOffset: 4,
                },
              ],
            }}
            options={generatePieChartOptions("Rarity Distribution")}
          />
        </Grid>
      </Grid>
    </Container>
  );
}