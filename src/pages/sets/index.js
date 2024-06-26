// src/pages/sets/index.js
import { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import Pagination from "../../components/Pagination";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../utils/firebase";
import Image from "next/image";
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
} from "@mui/material";

export default function SetsPage({ initialSets }) {
  const [user] = useAuthState(auth);
  const [sets, setSets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const filteredSets = initialSets.filter((set) =>
      set.setName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedSets =
      sortBy === "nameAsc"
        ? [...filteredSets].sort((a, b) => a.setName.localeCompare(b.setName))
        : sortBy === "nameDesc"
        ? [...filteredSets].sort((a, b) => b.setName.localeCompare(a.setName))
        : filteredSets;

    setSets(sortedSets);
  }, [searchTerm, sortBy, initialSets]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSets = sets.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Yu-Gi-Oh! Sets
      </Typography>

      <Box mb={4}>
        <TextField
          label="Search sets..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="sort-label">Sort by:</InputLabel>
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
          </Select>
        </FormControl>
      </Box>

      {sets.length === 0 && (
        <Typography variant="body1">No sets found.</Typography>
      )}

      <Grid container spacing={4}>
        {currentSets.map((set) => (
          <Grid item key={set.id} xs={12} sm={6} md={4} lg={3}>
            <Box
              sx={{
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
                p: 2,
                boxShadow: 3,
                bgcolor: "background.paper",
              }}
              role="listitem"
            >
              <Link href={`/sets/${set.id}`} style={{ textDecoration: "none" }}>
                <Box
                  sx={{
                    width: "100%",
                    paddingTop: "150%", // Aspect ratio 3:4
                    position: "relative",
                    mb: 2,
                  }}
                >
                  <Image
                    src={set.setImage}
                    alt={set.setName}
                    layout="fill"
                    objectFit="cover"
                    style={{ borderRadius: "4px 4px 0 0" }} // Round top corners
                  />
                </Box>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ color: "text.primary" }}
                >
                  {set.setName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {set.setAbbreviation}
                </Typography>
              </Link>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box mt={4} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={sets.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      </Box>
    </Container>
  );
}

export async function getStaticProps() {
  try {
    const setsCollection = collection(db, "setCollection");
    const setsSnapshot = await getDocs(setsCollection);
    const initialSets = setsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      props: { initialSets },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching sets:", error);
    return {
      props: { initialSets: [] },
    };
  }
}