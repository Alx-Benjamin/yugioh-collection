// src/components/Navbar.js
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState } from "react";
import { auth, signInWithGoogle, logOut } from "../utils/firebase";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText,
  Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button component={Link} href="/sets">
          <ListItemText primary="Sets" />
        </ListItem>
        <ListItem button component={Link} href="/cards"> 
          <ListItemText primary="Cards" /> 
        </ListItem>
        {user && (
          <>
            <ListItem button component={Link} href="/collection">
              <ListItemText primary="My Collection" />
            </ListItem>
            <ListItem button component={Link} href={`/profile/${user.uid}`}>
              <ListItemText primary="Profile" />
            </ListItem>
            {/* Admin Links */}
            {user.uid === 'UKIeRQSd52YEL0dLYUIWl6S4coD2' && (
              <>
                <ListItem button component={Link} href="/admin/addset">
                  <ListItemText primary="Add Set" />
                </ListItem>
                <ListItem button component={Link} href="/admin/addcard">
                  <ListItemText primary="Add Card" />
                </ListItem>
              </>
            )}
            <ListItem button onClick={logOut}>
              <ListItemText primary="Sign Out" />
            </ListItem>
          </>
        )}
        {!user && (
          <ListItem button onClick={signInWithGoogle}>
            <ListItemText primary="Sign In" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer(true)}
          sx={{ mr: 2, display: { xs: 'block', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component={Link} href="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'common.white' }}>
          Yugioh Collection Manager
        </Typography>
        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Button color="inherit" component={Link} href="/sets">
            Sets
          </Button>
          <Button color="inherit" component={Link} href="/cards"> 
            Cards 
          </Button>
          {user ? (
            <>
              <Button color="inherit" component={Link} href="/collection">
                My Collection
              </Button>
              <Button color="inherit" component={Link} href={`/profile/${user.uid}`}>
                Profile
              </Button>
              {/* Admin Links */}
              {user.uid === 'UKIeRQSd52YEL0dLYUIWl6S4coD2' && (
                <>
                  <Button color="inherit" component={Link} href="/admin/addset">
                    Add Set
                  </Button>
                  <Button color="inherit" component={Link} href="/admin/addcard">
                    Add Card
                  </Button>
                </>
              )}
              <Button color="inherit" onClick={logOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={signInWithGoogle}>
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>
    </AppBar>
  );
}