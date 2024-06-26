// src/pages/profile/[userId].js
import { db } from "../../utils/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../utils/firebase";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Container,
  Typography,
  Avatar,
  Box,
  Button,
} from "@mui/material";

export default function ProfilePage({ userProfile }) {
  const [user] = useAuthState(auth);
  const [collectedCount, setCollectedCount] = useState(0);

  useEffect(() => {
    const fetchCollectedCount = async () => {
      try {
        if (userProfile && userProfile.id) {
          const userDocRef = doc(db, "users", userProfile.id);
          const collectedCardsSubcollectionRef = collection(
            userDocRef,
            "collectedCards"
          );
          const querySnapshot = await getDocs(collectedCardsSubcollectionRef);
          setCollectedCount(querySnapshot.size);
        }
      } catch (error) {
        console.error("Error fetching collected card count:", error);
      }
    };

    fetchCollectedCount();
  }, [userProfile]);

  if (!userProfile) {
    return (
      <Container
        maxWidth="md"
        sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Typography variant="body1">Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Avatar
          alt={`Profile picture of ${userProfile.userName}`}
          src={userProfile.userImage || "/default-profile.png"}
          sx={{ width: 150, height: 150, mb: 4 }}
        />
        <Typography variant="h4" component="h1" gutterBottom>
          {userProfile.userName}
        </Typography>
        {userProfile.userBio && (
          <Typography variant="body1" gutterBottom>
            <strong>Bio:</strong> {userProfile.userBio}
          </Typography>
        )}
        <Typography variant="body1" gutterBottom>
          <strong>Cards Collected:</strong> {collectedCount}
        </Typography>
        {user && user.uid === userProfile.id && (
          <Button
            variant="contained"
            component={Link}
            href="/profile/edit"
            sx={{ mt: 4 }}
          >
            Edit Profile
          </Button>
        )}
      </Box>
    </Container>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const userDocRef = doc(db, "users", params.userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return { notFound: true };
    }

    const userProfile = { id: userDoc.id, ...userDoc.data() };
    return { props: { userProfile } };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { props: { userProfile: null } };
  }
}