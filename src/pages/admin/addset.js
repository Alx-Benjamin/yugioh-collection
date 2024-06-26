// src/pages/admin/addset.js
import { useState } from "react";
import { db } from "../../utils/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
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
} from "@mui/material";

export default function AddSetPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [setName, setSetName] = useState("");
  const [setAbbreviation, setSetAbbreviation] = useState("");
  const [setImage, setSetImage] = useState("");
  const [setCount, setSetCount] = useState(0); 
  const [addSetError, setAddSetError] = useState(null);
  const [addSetSuccess, setAddSetSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddSetError(null);
    setAddSetSuccess(false);

    if (!setName || !setAbbreviation || !setImage || setCount <= 0) {
      setAddSetError("Please fill in all fields correctly.");
      return;
    }

    try {
      const setDocRef = doc(db, "setCollection", setAbbreviation);

      await setDoc(setDocRef, {
        setName,
        setAbbreviation,
        setImage,
        setCount: parseInt(setCount, 10), 
      });

      setAddSetSuccess(true);
      setSetName("");
      setSetAbbreviation("");
      setSetImage("");
      setSetCount(0); 

      setTimeout(() => {
        router.push("/sets");
      }, 1500);
    } catch (error) {
      console.error("Error adding set:", error);
      if (error.code === "already-exists") {
        setAddSetError("A set with that abbreviation already exists.");
      } else {
        setAddSetError("Error adding set. Please try again later.");
      }
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
          Add New Set
        </Typography>

        {addSetError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {addSetError}
          </Alert>
        )}

        {addSetSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Set added successfully!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <TextField
            label="Set Name"
            variant="outlined"
            fullWidth
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            label="Set Abbreviation"
            variant="outlined"
            fullWidth
            value={setAbbreviation}
            onChange={(e) => setSetAbbreviation(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            label="Set Image URL"
            variant="outlined"
            fullWidth
            value={setImage}
            onChange={(e) => setSetImage(e.target.value)}
            margin="normal"
            required
          />
          <TextField 
            label="Set Card Count"
            variant="outlined"
            fullWidth
            type="number" 
            value={setCount}
            onChange={(e) => setSetCount(e.target.value)}
            margin="normal"
            required
          />
          <Button
            variant="contained"
            type="submit"
            color="primary"
            sx={{ mt: 2 }}
          >
            Add Set
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