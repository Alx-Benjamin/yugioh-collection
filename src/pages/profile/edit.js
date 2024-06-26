// src/pages/profile/edit.js
import { db, getCurrentUser } from "../../utils/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [userBio, setUserBio] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    console.log("User state updated:", user);

    if (user) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          console.log("Fetched user document:", userDoc.data());

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.userName || "");
            setUserBio(userData.userBio || "");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setErrorMessage("Error fetching user data. Please try again.");
        }
      };

      fetchUserData();
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(null);
    setUpdateSuccess(false);

    console.log("Form submitted");

    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          userName: userName,
          userBio: userBio,
        });
        console.log("User document updated successfully!");
        setUpdateSuccess(true);
        setTimeout(() => {
          router.push(`/profile/${user.uid}`);
        }, 1500);
      } catch (error) {
        console.error("Error updating user document:", error);
        setErrorMessage("Error updating profile. Please try again.");
      }
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Profile
      </Typography>

      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
      {updateSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Profile updated successfully!
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          label="Bio"
          variant="outlined"
          multiline
          rows={3}
          fullWidth
          value={userBio}
          onChange={(e) => setUserBio(e.target.value.slice(0, 50))}
          inputProps={{ maxLength: 50 }} 
          helperText={`${userBio.length}/50`}
          margin="normal"
        />
        <Button variant="contained" type="submit" color="primary">
          Save Changes
        </Button>
      </Box>
    </Container>
  );
}