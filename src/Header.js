import { useState } from 'react'
import { AppBar, IconButton, Box, Typography, Toolbar, Menu, MenuItem } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { Button } from '@aws-amplify/ui-react';
import Login from './Login';

function Header({ username, authStatus, signOut, getAllLocationData, menuIconAction }) {
    const [loginOverlay, setLoginOverlay] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);

    function signInButtonHandler() {
        setLoginOverlay(true);
    }

    function loginExitButtonHandler() {
        setLoginOverlay(false);
    }

    function handleUserMenu(event) {
        setMenuAnchor(event.currentTarget);
    }

    function handleMenuClose() {
        setMenuAnchor(null);
    }

    function handleLogout(){
        signOut();
        handleMenuClose();
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size='large'
                        edge='start'
                        color='inherit'
                        onClick={menuIconAction}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h3"
                        noWrap
                        component="div"
                        sx={{ flexGrow: 1, display: { xs: 'block', sm: 'block' } }}
                    >
                        Fire Detection🌲🔥
                    </Typography>

                    {authStatus && (
                        <div>
                            <IconButton
                                size='large'
                                edge='end'
                                color='inherit'
                                onClick={handleUserMenu}
                            >
                                {username}
                            </IconButton>
                            <Menu
                                anchorEl={menuAnchor}
                                keepMounted
                                open={Boolean(menuAnchor)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={() => getAllLocationData(false)}>View Public Locations</MenuItem>
                                <MenuItem onClick={() => getAllLocationData(true)}>View User Sensors</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </div>
                    )}

                    {!authStatus && (
                        <Button onClick={signInButtonHandler}>Login</Button>
                    )}

                </Toolbar>
            </AppBar>
            {loginOverlay && <Login closeHandler={loginExitButtonHandler} />}
        </Box>

    )
}

export default Header;